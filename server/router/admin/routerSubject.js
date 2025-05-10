import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

// Konversi URL ke path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";

const router = express.Router();

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./server/assets/lms/cover";
    // Buat direktori jika belum ada
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(
      null,
      req.body.name.replace(/\s+/g, "_") +
        "_" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // 2MB
  },
});

// ==================== GET ENDPOINTS ====================

// Get mata pelajaran dengan paginasi dan pencarian
router.get("/get-subjects", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;
    const homebase = req.user.homebase;

    if (!page && !limit) {
      const query = `
				SELECT 
					s.id,
					s.name,
					s.cover,
					COALESCE(json_agg(
						json_build_object(
							'name', t.name,
							'chapters', (
								SELECT COUNT(DISTINCT ch.id)
								FROM l_chapter ch
								WHERE ch.teacher = t.id AND ch.subject = s.id
							),
							'contents', (
								SELECT COUNT(DISTINCT c.id)
								FROM l_chapter ch
								JOIN l_content c ON c.chapter = ch.id
								WHERE ch.teacher = t.id AND ch.subject = s.id
							),
							'class', (
								SELECT json_agg(
									json_build_object(
										'id', cl.id,
										'name', cl.name
									)
								)
								FROM (
									SELECT DISTINCT ON (cl.id) cl.id, cl.name
									FROM l_chapter ch
									JOIN l_cclass lc ON lc.chapter = ch.id
									JOIN a_class cl ON cl.id = lc.classid
									WHERE ch.teacher = t.id AND ch.subject = s.id
								) cl
							)
						)
					) FILTER (WHERE t.id IS NOT NULL), '[]') as teachers
				FROM a_subject s
				LEFT JOIN at_subject ats ON ats.subject = s.id
				LEFT JOIN u_teachers t ON t.id = ats.teacher
				WHERE s.homebase = $1
				GROUP BY s.id, s.name, s.cover
			`;
      const data = await client.query(query, [homebase]);
      return res.status(200).json(data.rows);
    }

    const countQuery = `
			SELECT COUNT(DISTINCT s.id) 
			FROM a_subject s
			WHERE s.homebase = $1 AND s.name ILIKE $2
		`;

    const dataQuery = `
			SELECT 
				s.id,
				s.name,
				s.cover,
				COALESCE(json_agg(
					json_build_object(
						'name', t.name,
						'chapters', (
							SELECT COUNT(DISTINCT ch.id)
							FROM l_chapter ch
							WHERE ch.teacher = t.id AND ch.subject = s.id
						),
						'contents', (
							SELECT COUNT(DISTINCT c.id)
							FROM l_chapter ch
							JOIN l_content c ON c.chapter = ch.id
							WHERE ch.teacher = t.id AND ch.subject = s.id
						),
						'class', (
							SELECT json_agg(
								json_build_object(
									'id', cl.id,
									'name', cl.name
								)
							)
							FROM (
								SELECT DISTINCT ON (cl.id) cl.id, cl.name
								FROM l_chapter ch
								JOIN l_cclass lc ON lc.chapter = ch.id
								JOIN a_class cl ON cl.id = lc.classid
								WHERE ch.teacher = t.id AND ch.subject = s.id
							) cl
						)
					)
				) FILTER (WHERE t.id IS NOT NULL), '[]') as teachers
			FROM a_subject s
			LEFT JOIN at_subject ats ON ats.subject = s.id
			LEFT JOIN u_teachers t ON t.id = ats.teacher
			WHERE s.homebase = $1 AND s.name ILIKE $2
			GROUP BY s.id, s.name, s.cover
			ORDER BY s.name ASC
			LIMIT $3 OFFSET $4
		`;

    const [count, data] = await Promise.all([
      client.query(countQuery, [homebase, `%${search}%`]),
      client.query(dataQuery, [homebase, `%${search}%`, limit, offset]),
    ]);

    const totalData = parseInt(count.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);
    const subjects = data.rows;

    res.status(200).json({ totalData, totalPages, subjects });
  } catch (error) {
    console.error("Error getting subjects:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Get detail mata pelajaran
router.get("/get-subject-detail", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const homebase = req.user.homebase;

    const query = `
			SELECT 
				s.id,
				s.name,
				COALESCE(json_agg(
					json_build_object(
						'id', ch.id,
						'name', ch.title,
						'target', ch.target,
						'teacher', t.name,
						'contents', (
							SELECT COALESCE(json_agg(
								json_build_object(
									'id', c.id,
									'name', c.title,
									'target', c.target,
									'files', (
										SELECT COALESCE(json_agg(
											json_build_object(
												'id', f.id,
												'file', f.file
											)
										) FILTER (WHERE f.file IS NOT NULL), '[]')
										FROM l_file f
										WHERE f.content = c.id
									),
									'videos', (
										SELECT COALESCE(json_agg(
											json_build_object(
												'id', f.id,
												'video', f.video
											)
										) FILTER (WHERE f.video IS NOT NULL), '[]')
										FROM l_file f
										WHERE f.content = c.id
									)
								)
							) FILTER (WHERE c.id IS NOT NULL), '[]')
							FROM l_content c
							WHERE c.chapter = ch.id
						)
					)
				) FILTER (WHERE ch.id IS NOT NULL), '[]') as chapters
			FROM a_subject s
			LEFT JOIN l_chapter ch ON ch.subject = s.id
			LEFT JOIN u_teachers t ON t.id = ch.teacher
			WHERE s.id = $1 AND s.homebase = $2
			GROUP BY s.id, s.name
		`;

    const data = await client.query(query, [id, homebase]);

    if (data.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.status(200).json(data.rows[0]);
  } catch (error) {
    console.error("Error getting subject detail:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ==================== POST ENDPOINTS ====================

// Tambah atau update mata pelajaran
router.post(
  "/add-subject",
  authorize("admin"),
  upload.single("cover"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id, name } = req.body;
      const homebase = req.user.homebase;

      await client.query("BEGIN");

      let subjectid;
      if (id) {
        // Ambil informasi cover sebelum mengupdate
        const subject = await client.query(
          "SELECT cover FROM a_subject WHERE id = $1 AND homebase = $2",
          [id, homebase]
        );

        // Hapus file cover lama jika ada
        if (subject.rows.length > 0 && subject.rows[0].cover) {
          const coverPath = subject.rows[0].cover;
          const fileName = path.basename(coverPath);
          const filePath = path.join(
            __dirname,
            "../../assets/lms/cover",
            fileName
          );

          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            console.error("Error deleting old cover file:", error);
          }
        }

        await client.query(
          `UPDATE a_subject SET homebase = $1, name = $2 WHERE id = $3`,
          [homebase, name, id]
        );

        subjectid = id;
      } else {
        const data = await client.query(
          `INSERT INTO a_subject(homebase, name) VALUES ($1, $2) RETURNING id`,
          [homebase, name]
        );
        subjectid = data.rows[0].id;
      }

      if (req.file) {
        const image = `/assets/lms/cover/${req.file.filename}`;
        await client.query(`UPDATE a_subject SET cover = $1 WHERE id = $2`, [
          image,
          subjectid,
        ]);
      }

      await client.query("COMMIT");
      res.status(200).json({ message: id ? update : create });
    } catch (error) {
      await client.query("ROLLBACK");
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("Error managing subject:", error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// Upload mata pelajaran
router.post(
  "/upload-subjects",
  authorize("admin"),
  upload.single("file"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const homebase = req.user.homebase;

      if (!req.file) {
        return res.status(400).json({ message: "File tidak ditemukan" });
      }

      // Read and parse CSV file
      const fileContent = fs.readFileSync(req.file.path, "utf-8");
      const rows = fileContent
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()));

      // Validate header
      const header = rows[0];
      if (header[0].toLowerCase() !== "name") {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Format file tidak sesuai" });
      }

      await client.query("BEGIN");

      // Process each row
      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 1 || !row[0]) continue; // Skip empty rows

        try {
          const name = row[0];

          // Check if subject already exists
          const existingSubject = await client.query(
            "SELECT id FROM a_subject WHERE homebase = $1 AND name = $2",
            [homebase, name]
          );

          if (existingSubject.rows.length > 0) {
            results.failed++;
            results.errors.push(`Mata pelajaran "${name}" sudah ada`);
            continue;
          }

          // Insert new subject
          await client.query(
            "INSERT INTO a_subject (homebase, name) VALUES ($1, $2)",
            [homebase, name]
          );

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error pada baris ${i + 1}: ${error.message}`);
        }
      }

      await client.query("COMMIT");
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        message: "Upload selesai",
        results,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      if (req.file) fs.unlinkSync(req.file.path);
      console.error("Error uploading subjects:", error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ==================== DELETE ENDPOINTS ====================

// Hapus mata pelajaran
router.delete("/delete-subject", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const homebase = req.user.homebase;

    await client.query("BEGIN");

    // Ambil informasi cover sebelum menghapus
    const subject = await client.query(
      "SELECT cover FROM a_subject WHERE id = $1 AND homebase = $2",
      [id, homebase]
    );

    if (subject.rows.length > 0 && subject.rows[0].cover) {
      const coverPath = subject.rows[0].cover;
      const fileName = path.basename(coverPath);
      const filePath = path.join(__dirname, "../../assets/lms/cover", fileName);

      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error deleting cover file:", error);
      }
    }

    await client.query(
      "DELETE FROM a_subject WHERE id = $1 AND homebase = $2",
      [id, homebase]
    );

    await client.query("COMMIT");
    res.json({ message: remove });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting subject:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
