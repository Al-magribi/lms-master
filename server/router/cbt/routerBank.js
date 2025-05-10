import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import multer from "multer";
import path from "path";

const create = "Berhasil disimpan";
const update = "berhasil diperbarui";
const remove = "Berhasil dihapus";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/cbt/images");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/cbt/audios");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const uploadImage = multer({ storage: imageStorage });
const uploadAudio = multer({ storage: audioStorage });

const router = express.Router();

// Mengambil data guru dan mata pelajaran terkait
router.get("/get-teachers", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { homebase, level, id } = req.user;

    let dataQuery;
    if (level === "teacher" && id) {
      dataQuery = {
        text: `SELECT u_teachers.*, 
					   a_class.name AS class_name, 
					   a_homebase.name AS homebase,
					   COALESCE(
						   (
							   SELECT json_agg(DISTINCT jsonb_build_object(
								   'id', subject.id, 
								   'name', subject.name
							   ))
							   FROM (
								   SELECT DISTINCT a_subject.id, a_subject.name
								   FROM at_subject
								   LEFT JOIN a_subject ON at_subject.subject = a_subject.id
								   WHERE at_subject.teacher = u_teachers.id
							   ) subject
						   ),
						   '[]'
					   ) AS subjects,
					   COALESCE(
						   (
							   SELECT json_agg(DISTINCT jsonb_build_object(
								   'id', bank.id, 
								   'name', bank.name,
								   'type', bank.btype
							   ))
							   FROM (
								   SELECT DISTINCT id, name, btype
								   FROM c_bank
								   WHERE teacher = u_teachers.id
									 ORDER BY btype ASC, name ASC
							   ) bank
						   ),
						   '[]'
					   ) AS bank
				FROM u_teachers
				LEFT JOIN a_homebase ON u_teachers.homebase = a_homebase.id
				LEFT JOIN a_class ON u_teachers.class = a_class.id
				WHERE u_teachers.homebase = $1 AND u_teachers.id = $2
				GROUP BY u_teachers.id, a_class.name, a_homebase.name
				ORDER BY a_homebase.name ASC, u_teachers.name ASC`,
        values: [homebase, id],
      };
    } else {
      dataQuery = {
        text: `SELECT u_teachers.name, u_teachers.id,
					   COALESCE(
						   (
							   SELECT json_agg(DISTINCT jsonb_build_object(
								   'id', subject.id, 
								   'name', subject.name
							   ))
							   FROM (
								   SELECT DISTINCT a_subject.id, a_subject.name
								   FROM at_subject
								   LEFT JOIN a_subject ON at_subject.subject = a_subject.id
								   WHERE at_subject.teacher = u_teachers.id
							   ) subject
						   ),
						   '[]'
					   ) AS subjects,
					   COALESCE(
						   (
							   SELECT json_agg(DISTINCT jsonb_build_object(
								   'id', bank.id, 
								   'name', bank.name,
								   'type', bank.btype
							   ))
							   FROM (
								   SELECT DISTINCT id, name, btype
								   FROM c_bank
								   WHERE teacher = u_teachers.id
									 ORDER BY btype ASC, name ASC
							   ) bank
						   ),
						   '[]'
					   ) AS bank
				FROM u_teachers
				WHERE u_teachers.homebase = $1
				GROUP BY u_teachers.id
				ORDER BY u_teachers.name ASC`,
        values: [homebase],
      };
    }

    const dataResult = await client.query(dataQuery);

    // Kirimkan data ke klien
    res.status(200).json(dataResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Menambahkan bank soal
router.post("/add-bank", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, teacher, subject, btype, name } = req.body;
    const { homebase, level, id: userid } = req.user;

    await client.query("BEGIN");

    if (id) {
      await client.query(
        `UPDATE c_bank
				SET homebase = $1, teacher = $2, subject = $3, btype = $4, name = $5
				WHERE id = $6`,
        [
          homebase,
          level === "teacher" ? userid : teacher,
          subject,
          btype,
          name,
          id,
        ]
      );
    } else {
      await client.query(
        `INSERT INTO c_bank(homebase, teacher, subject, btype, name)
				 VALUES($1, $2, $3, $4, $5)`,
        [homebase, level === "teacher" ? userid : teacher, subject, btype, name]
      );
    }

    await client.query("COMMIT");
    res.status(200).json({ message: id ? update : create });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Mengambil data bank soal
router.get("/get-bank", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const { homebase, id, level } = req.user;
    const offset = (page - 1) * limit;

    const [countResult, dataResult] = await Promise.all([
      client.query(
        level === "admin"
          ? `SELECT COUNT(*) FROM c_bank 
						LEFT JOIN u_teachers ON c_bank.teacher = u_teachers.id
						WHERE c_bank.homebase = $1 AND (c_bank.name ILIKE $2 OR u_teachers.name ILIKE $2)`
          : `SELECT COUNT(*) FROM c_bank 
						LEFT JOIN u_teachers ON c_bank.teacher = u_teachers.id
						WHERE c_bank.teacher = $1 AND (c_bank.name ILIKE $2 OR u_teachers.name ILIKE $2)`,
        level === "admin" ? [homebase, `%${search}%`] : [id, `%${search}%`]
      ),
      client.query(
        level === "admin"
          ? `SELECT c_bank.*, u_teachers.name AS teacher_name,
						a_subject.name AS subject_name,
						COUNT(c_question.id) AS question_count
						FROM c_bank
						LEFT JOIN u_teachers ON c_bank.teacher = u_teachers.id
						LEFT JOIN a_subject ON c_bank.subject = a_subject.id
						LEFT JOIN c_question ON c_bank.id = c_question.bank
						WHERE c_bank.homebase = $1 AND (c_bank.name ILIKE $2 OR u_teachers.name ILIKE $2)
						GROUP BY c_bank.id, u_teachers.name, a_subject.name
						ORDER BY c_bank.name ASC
						LIMIT $3 OFFSET $4`
          : `SELECT c_bank.*, u_teachers.name AS teacher_name,
						a_subject.name AS subject_name,
						COUNT(c_question.id) AS question_count
						FROM c_bank
						LEFT JOIN u_teachers ON c_bank.teacher = u_teachers.id
						LEFT JOIN a_subject ON c_bank.subject = a_subject.id
						LEFT JOIN c_question ON c_bank.id = c_question.bank
						WHERE c_bank.teacher = $1 AND (c_bank.name ILIKE $2 OR u_teachers.name ILIKE $2)
						GROUP BY c_bank.id, u_teachers.name, a_subject.name
						ORDER BY u_teachers.name ASC, c_bank.name ASC
						LIMIT $3 OFFSET $4`,
        level === "admin"
          ? [homebase, `%${search}%`, limit, offset]
          : [id, `%${search}%`, limit, offset]
      ),
    ]);

    const totalData = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);

    // Kirimkan data dan informasi paginasi ke klien
    res.status(200).json({
      totalData,
      totalPages,
      banks: dataResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Menghapus bank soal
router.delete(
  "/delete-bank",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.query;

      await client.query("BEGIN");
      await client.query(`DELETE FROM c_bank WHERE id = $1`, [id]);
      await client.query("COMMIT");

      res.status(200).json({ message: remove });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// Menambahkan soal
router.post(
  "/add-question",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id, bank, qtype, qkey, poin, question, a, b, c, d, e } = req.body;

      await client.query("BEGIN");

      if (id) {
        await client.query(
          `UPDATE c_question 
				SET bank = $1, qtype = $2, qkey = $3, poin = $4, question = $5, a = $6, b = $7, c = $8, d = $9, e = $10
				WHERE id = $11`,
          [bank, qtype, qkey, poin, question, a, b, c, d, e, id]
        );

        await client.query(
          `UPDATE c_answer SET point = $1 WHERE question = $2`,
          [poin, id]
        );
      } else {
        await client.query(
          `INSERT INTO c_question(bank, qtype, qkey, poin, question, a, b, c, d, e)
				VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [bank, qtype, qkey, poin, question, a, b, c, d, e]
        );
      }

      await client.query("COMMIT");
      res.status(200).json({ message: id ? update : create });
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// Mengupload soal
router.post(
  "/upload-question",
  authorize("admin", "teacher"),
  async (req, res) => {
    try {
      const { bankid } = req.query;
      const questions = req.body;

      const client = await pool.connect();
      const data = await client.query(
        `SELECT btype FROM c_bank WHERE id = $1`,
        [bankid]
      );

      if (data.rows[0].btype === "bank") {
        await Promise.all(
          questions.map(async (question) => {
            await client.query(
              `INSERT INTO c_question(bank, qtype, question, a, b, c, d, e, qkey)
					VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                bankid,
                question[0],
                question[1],
                question[2],
                question[3],
                question[4],
                question[5],
                question[6],
                question[7],
              ]
            );
          })
        );

        res
          .status(200)
          .json({ message: `${questions.length} soal berhasil diupload` });
      } else {
        let totalPoinQtype1 = 0; // Inisialisasi total poin untuk qtype 1
        let totalPoinQtype2 = 0; // Inisialisasi total poin untuk qtype 2
        const validQuestions = []; // Array untuk menyimpan pertanyaan yang valid
        let hasQtype1 = false; // Flag untuk mengecek apakah ada qtype 1
        let hasQtype2 = false; // Flag untuk mengecek apakah ada qtype 2

        // Validasi dan hitung total poin
        for (const question of questions) {
          const qtype = question[0]; // Ambil qtype
          const poin = question[8]; // Ambil poin

          // Validasi qtype
          if (qtype < 1 || qtype > 2) {
            return res
              .status(400)
              .json({ message: "Jenis soal harus 1 atau 2" });
          }

          // Tambahkan poin ke total berdasarkan qtype
          if (qtype === 1) {
            totalPoinQtype1 += poin; // Tambahkan poin untuk qtype 1
            hasQtype1 = true; // Set flag bahwa ada qtype 1
          } else if (qtype === 2) {
            totalPoinQtype2 += poin; // Tambahkan poin untuk qtype 2
            hasQtype2 = true; // Set flag bahwa ada qtype 2
          }

          // Simpan pertanyaan yang valid
          validQuestions.push(question);
        }

        // Validasi total poin untuk qtype 1 dan qtype 2 hanya jika ada pertanyaan dengan qtype tersebut
        if (hasQtype1 && totalPoinQtype1 !== 100) {
          return res
            .status(400)
            .json({ message: "Total poin untuk pg harus 100" });
        }
        if (hasQtype2 && totalPoinQtype2 !== 100) {
          return res
            .status(400)
            .json({ message: "Total poin untuk essay harus 100" });
        }

        // Simpan semua pertanyaan yang valid ke database
        await Promise.all(
          validQuestions.map(async (question) => {
            await client.query(
              `INSERT INTO c_question(bank, qtype, question, a, b, c, d, e, qkey, poin)
					VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                bankid,
                question[0],
                question[1],
                question[2],
                question[3],
                question[4],
                question[5],
                question[6],
                question[7],
                question[8],
              ]
            );
          })
        );

        res
          .status(200)
          .json({ message: `${validQuestions.length} soal berhasil diupload` });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Mengambil data soal
router.get(
  "/get-questions",
  authorize("admin", "teacher"),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "", bankid } = req.query;
      const offset = (page - 1) * limit;

      const client = await pool.connect();
      const count = await client.query(
        `SELECT COUNT(*) FROM c_question 
				WHERE bank = $1
				AND (question ILIKE $2 OR a ILIKE $2 OR b ILIKE $2 OR c ILIKE $2 OR d ILIKE $2 OR e ILIKE $2)`,
        [bankid, `%${search}%`]
      );

      const data = await client.query(
        `SELECT * FROM c_question
				WHERE bank = $1
				AND (question ILIKE $2 OR a ILIKE $2 OR b ILIKE $2 OR c ILIKE $2 OR d ILIKE $2 OR e ILIKE $2)
				ORDER BY id ASC
				LIMIT $3 OFFSET $4	`,
        [bankid, `%${search}%`, limit, offset]
      );

      const totalData = parseInt(count.rows[0].count);
      const totalPages = Math.ceil(totalData / limit);

      res.status(200).json({
        totalData,
        totalPages,
        questions: data.rows,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Mengambil data soal detail
router.get("/get-question", authorize("admin", "teacher"), async (req, res) => {
  try {
    const { id } = req.query;

    const client = await pool.connect();
    const data = await client.query(`SELECT * FROM c_question WHERE id = $1`, [
      id,
    ]);

    res.status(200).json(data.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Menghapus soal
router.delete(
  "/delete-question",
  authorize("admin", "teacher"),
  async (req, res) => {
    try {
      const { id } = req.query;

      const client = await pool.connect();
      await client.query(`DELETE FROM c_question WHERE id = $1`, [id]);

      res.status(200).json({ message: remove });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Mengkosongkan bank soal
router.delete(
  "/clear-bank",
  authorize("admin", "teacher"),
  async (req, res) => {
    try {
      const { bankid } = req.query;

      const client = await pool.connect();
      await client.query(`DELETE FROM c_question WHERE bank = $1`, [bankid]);

      res.status(200).json({ message: remove });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Upload image editor
router.post("/upload/image", uploadImage.single("file"), (req, res) => {
  try {
    const imageLink = "/assets/cbt/images/" + req.file.filename;

    res.status(200).json({ url: imageLink });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.post("/upload/audio", uploadAudio.single("file"), (req, res) => {
  try {
    const audioLink = "/assets/cbt/audios/" + req.file.filename;

    res.status(200).json({ url: audioLink });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

export default router;
