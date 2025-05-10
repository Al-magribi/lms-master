import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const teacherName = req.user.name.toLowerCase().replace(/\s+/g, "_");
      const teacherDir = `./server/assets/lms/${teacherName}`;

      // Buat folder guru jika belum ada
      if (!fs.existsSync(teacherDir)) {
        await fs.promises.mkdir(teacherDir, { recursive: true });
      }

      cb(null, teacherDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const router = express.Router();

// ============================================
// ENDPOINT UNTUK MANAJEMEN KELAS
// ============================================

// Mengambil data kelas
router.get("/get-class", authorize("admin", "teacher"), async (req, res) => {
  try {
    const { homebase } = req.user;
    const client = await pool.connect();

    try {
      const data = await client.query(
        `SELECT * FROM a_class WHERE homebase = $1`,
        [homebase]
      );
      res.status(200).json(data.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// ENDPOINT UNTUK MANAJEMEN BAB/CHAPTER
// ============================================

// Membuat atau memperbarui bab
router.post("/add-chapter", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { subjectid, chapterid, title, target, classes } = req.body;
    const teacher = req.user.id;

    await client.query("BEGIN");

    if (chapterid) {
      await client.query(
        `UPDATE l_chapter 
				SET title = $1, target = $2, teacher = $3, subject = $4 
				WHERE id = $5`,
        [title, target, teacher, subjectid, chapterid]
      );

      await client.query(`DELETE FROM l_cclass WHERE chapter = $1`, [
        chapterid,
      ]);

      for (const cls of classes) {
        await client.query(
          "INSERT INTO l_cclass (chapter, classid) VALUES ($1, $2)",
          [chapterid, cls]
        );
      }
      await client.query("COMMIT");
      return res.status(200).json({ message: update });
    }

    const lastOrder = await client.query(
      `SELECT COALESCE(MAX(order_number), 0) as last_order 
			FROM l_chapter 
			WHERE subject = $1 AND teacher = $2`,
      [subjectid, teacher]
    );

    const newOrder = lastOrder.rows[0].last_order + 1;

    const result = await client.query(
      `INSERT INTO l_chapter (subject, teacher, title, target, order_number)
			VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [subjectid, teacher, title, target, newOrder]
    );

    const newChapterId = result.rows[0].id;

    for (const cls of classes) {
      await client.query(
        "INSERT INTO l_cclass (chapter, classid) VALUES ($1, $2)",
        [newChapterId, cls]
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({ message: create });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Menampilkan bab
router.get("/get-chapters", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.query;
    const teacher = req.user.id;

    const query = `
			SELECT 
				ch.id as chapter_id,
				ch.title as chapter_name,
				ch.target as chapter_target,
				ch.order_number,
				ut.name as teacher_name,
				(
					SELECT json_agg(class_data ORDER BY grade_id, class_name)
					FROM (
						SELECT DISTINCT 
							jsonb_build_object(
								'id', cl.id,
								'name', cl.name,
								'grade', gr.name,
								'grade_id', gr.id
							) as class_data,
							gr.id as grade_id,
							cl.name as class_name
						FROM l_cclass cc2
						LEFT JOIN a_class cl ON cc2.classid = cl.id
						LEFT JOIN a_grade gr ON cl.grade = gr.id
						WHERE cc2.chapter = ch.id
					) sub
				) as class,
				COUNT(DISTINCT co.id) as content_count,
				COALESCE(
					CASE 
						WHEN COUNT(co.id) > 0 THEN (
							SELECT json_agg(content_data)
							FROM (
								SELECT jsonb_build_object(
									'content_id', co2.id,
									'content_title', co2.title,
									'content_target', co2.target,
									'files', (
										SELECT COALESCE(json_agg(
											jsonb_build_object(
												'id', f.id,
												'title', f.title,
												'file', f.file
											)
										), '[]'::json)
										FROM l_file f 
										WHERE f.content = co2.id AND f.file IS NOT NULL
									),
									'videos', (
										SELECT COALESCE(json_agg(
											jsonb_build_object(
												'id', f.id,
												'title', f.title,
												'video', f.video
											)
										), '[]'::json)
										FROM l_file f 
										WHERE f.content = co2.id AND f.video IS NOT NULL
									)
								) as content_data
								FROM l_content co2
								WHERE co2.chapter = ch.id
								ORDER BY co2.order_number ASC
							) sub
						)
						ELSE '[]'::json
					END
				) as contents,
				(
					SELECT COUNT(*)
					FROM l_content lc
					JOIN l_file f ON f.content = lc.id
					WHERE lc.chapter = ch.id AND f.file IS NOT NULL
				) as file_count,
				(
					SELECT COUNT(*)
					FROM l_content lc
					JOIN l_file f ON f.content = lc.id
					WHERE lc.chapter = ch.id AND f.video IS NOT NULL
				) as video_count
			FROM l_chapter ch
			LEFT JOIN u_teachers ut ON ch.teacher = ut.id
			LEFT JOIN l_content co ON ch.id = co.chapter
			WHERE ch.subject = $1 and ch.teacher = $2
			GROUP BY ch.id, ch.title, ch.target, ut.name, ch.order_number
			ORDER BY ch.order_number ASC`;

    const result = await client.query(query, [id, teacher]);

    // Format response
    const formattedData = result.rows.map((row) => ({
      chapter_id: row.chapter_id,
      chapter_name: row.chapter_name,
      target: row.chapter_target,
      teacher_name: row.teacher_name,
      class: row.class || [],
      content: row.content_count,
      contents: row.contents || [],
      file: parseInt(row.file_count) || 0,
      video: parseInt(row.video_count) || 0,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Endpoint untuk mengupdate urutan chapter
router.post("/update-chapter-order", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { chapters } = req.body;
    const teacher = req.user.id;

    await client.query("BEGIN");

    for (let i = 0; i < chapters.length; i++) {
      await client.query(
        `UPDATE l_chapter 
				SET order_number = $1 
				WHERE id = $2 AND teacher = $3`,
        [i + 1, chapters[i].chapter_id, teacher]
      );
    }

    await client.query("COMMIT");
    res.status(200).json({ message: update });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Menghapus chapter
router.delete("/delete-chapter", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const teacher = req.user.id;

    await client.query("BEGIN");

    // Ambil semua file yang terkait dengan chapter ini
    const filesQuery = `
			SELECT f.id, f.file 
			FROM l_file f
			JOIN l_content c ON f.content = c.id
			WHERE c.chapter = $1 AND f.file IS NOT NULL`;

    const filesResult = await client.query(filesQuery, [id]);

    // Hapus file fisik
    for (const file of filesResult.rows) {
      const filePath = `./server/${file.file}`;
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    // Hapus semua file dari database
    await client.query(
      `
			DELETE FROM l_file 
			WHERE content IN (
				SELECT id FROM l_content WHERE chapter = $1
			)`,
      [id]
    );

    // Hapus semua content
    await client.query("DELETE FROM l_content WHERE chapter = $1", [id]);

    // Hapus chapter
    await client.query("DELETE FROM l_chapter WHERE id = $1", [id]);

    await client.query("COMMIT");
    return res.status(200).json({ message: remove });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ============================================
// ENDPOINT UNTUK MANAJEMEN KONTEN/MATERI
// ============================================

// Menambahkan materi
router.post("/add-content", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { chapterid, contentid, title, content } = req.body;

    await client.query("BEGIN");

    if (contentid) {
      await client.query(
        `UPDATE l_content 
				SET title = $1, target = $2 
				WHERE id = $3`,
        [title, content, contentid]
      );
      await client.query("COMMIT");
      return res.status(200).json({ message: update });
    }

    // Dapatkan order terakhir untuk chapter yang sama
    const lastOrder = await client.query(
      `SELECT COALESCE(MAX(order_number), 0) as last_order 
			FROM l_content 
			WHERE chapter = $1`,
      [chapterid]
    );

    const newOrder = lastOrder.rows[0].last_order + 1;

    const contentResult = await client.query(
      `INSERT INTO l_content (chapter, title, target, order_number) 
			VALUES ($1, $2, $3, $4) 
			RETURNING id`,
      [chapterid, title, content, newOrder]
    );

    await client.query("COMMIT");
    res.status(200).json({
      message: create,
      contentId: contentResult.rows[0].id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Menambahkan file atau video ke content
router.post(
  "/add-content-file",
  authorize("teacher"),
  upload.array("files"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { contentId, title, video } = req.body;
      const files = req.files;
      const { name } = req.user;
      const teacherName = name.toLowerCase().replace(/\s+/g, "_");

      // Get chapter title dari content
      const chapterResult = await client.query(
        `SELECT c.title 
			FROM l_chapter c 
			JOIN l_content lc ON c.id = lc.chapter 
			WHERE lc.id = $1`,
        [contentId]
      );
      const chapterTitle = chapterResult.rows[0].title
        .toLowerCase()
        .replace(/\s+/g, "_");

      await client.query("BEGIN");

      // Jika ada file, simpan file (video akan null)
      if (files && files.length > 0) {
        for (const file of files) {
          // Rename file dengan proper format
          const newFileName = `${chapterTitle}-${file.filename}`;
          const oldPath = path.join(
            "./server/assets/lms",
            teacherName,
            file.filename
          );
          const newPath = path.join(
            "./server/assets/lms",
            teacherName,
            newFileName
          );

          await fs.promises.rename(oldPath, newPath);

          // Save file path for database
          const link = `/assets/lms/${teacherName}/${newFileName}`;

          await client.query(
            `INSERT INTO l_file (content, title, file, video) 
					VALUES ($1, $2, $3, $4)`,
            [contentId, title, link, null]
          );
        }
      }

      // Jika ada video, simpan video (file akan null)
      if (video && video.trim() !== "") {
        await client.query(
          `INSERT INTO l_file (content, title, file, video) 
				VALUES ($1, $2, $3, $4)`,
          [contentId, title, null, video]
        );
      }

      await client.query("COMMIT");
      res.status(200).json({ message: create });
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// Menghapus content
router.delete("/delete-content", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const teacher = req.user.id;

    await client.query("BEGIN");

    // Ambil semua file yang terkait dengan content ini
    const filesQuery = `
			SELECT id, file 
			FROM l_file 
			WHERE content = $1 AND file IS NOT NULL`;

    const filesResult = await client.query(filesQuery, [id]);

    // Hapus file fisik
    for (const file of filesResult.rows) {
      const filePath = `./server/${file.file}`;
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    // Hapus semua file dari database
    await client.query("DELETE FROM l_file WHERE content = $1", [id]);

    // Hapus content
    await client.query("DELETE FROM l_content WHERE id = $1", [id]);

    await client.query("COMMIT");
    return res.status(200).json({ message: remove });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Menghapus file atau video
router.delete("/delete-file", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const { name } = req.user;
    const teacherName = name.toLowerCase().replace(/\s+/g, "_");

    await client.query("BEGIN");

    // Ambil informasi file sebelum dihapus
    const fileResult = await client.query(
      `SELECT file FROM l_file WHERE id = $1`,
      [id]
    );

    if (fileResult.rows[0]?.file) {
      // Hapus file fisik jika ada
      const filePath = `./server/${fileResult.rows[0].file}`;
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    // Hapus record dari database
    await client.query(`DELETE FROM l_file WHERE id = $1`, [id]);

    await client.query("COMMIT");
    return res.status(200).json({ message: remove });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Endpoint untuk mengupdate urutan content
router.post("/update-content-order", authorize("teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { contents } = req.body;
    const teacher = req.user.id;

    await client.query("BEGIN");

    for (let i = 0; i < contents.length; i++) {
      await client.query(
        `UPDATE l_content 
				SET order_number = $1 
				WHERE id = $2 AND chapter IN (
					SELECT id FROM l_chapter WHERE teacher = $3
				)`,
        [i + 1, contents[i].content_id, teacher]
      );
    }

    await client.query("COMMIT");
    res.status(200).json({ message: update });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
