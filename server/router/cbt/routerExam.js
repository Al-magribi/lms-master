import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";

const router = express.Router();

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

function generateToken() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let token = "";

  // Menambahkan 2 huruf pertama
  for (let i = 0; i < 2; i++) {
    token += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Menambahkan 2 angka
  for (let i = 0; i < 2; i++) {
    token += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // Menambahkan 2 huruf terakhir
  for (let i = 0; i < 2; i++) {
    token += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  return token;
}

router.post("/create-exam", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { homebase, id, level } = req.user;
    const {
      teacher,
      bank,
      classes,
      name,
      duration,
      examid,
      token,
      isshuffle,
      mc_score,
      essay_score,
    } = req.body;

    await client.query("BEGIN");

    const teacherId = level === "admin" ? teacher : id;
    let examId = examid;

    if (examId) {
      await client.query(
        `UPDATE c_exam SET homebase = $1, teacher = $2, name = $3, 
        duration = $4, token = $5, isshuffle = $6, 
        mc_score = $7, essay_score = $8 
        WHERE id = $9`,
        [
          homebase,
          teacherId,
          name,
          duration,
          token,
          isshuffle,
          mc_score,
          essay_score,
          examId,
        ]
      );
      await client.query("DELETE FROM c_ebank WHERE exam = $1", [examId]);
      await client.query("DELETE FROM c_class WHERE exam = $1", [examId]);
    } else {
      const token = generateToken();
      const examResult = await client.query(
        `INSERT INTO 
            c_exam (homebase, teacher, name, duration, token, isshuffle, mc_score, essay_score) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          homebase,
          teacherId,
          name,
          duration,
          token,
          isshuffle,
          mc_score,
          essay_score,
        ]
      );
      examId = examResult.rows[0].id;
    }

    for (const item of bank) {
      await client.query(
        "INSERT INTO c_ebank (exam, bank, pg, essay ) VALUES ($1, $2, $3, $4)",
        [examId, item.bankid, item.pg || null, item.essay || null]
      );
    }

    for (const cls of classes) {
      await client.query(
        "INSERT INTO c_class (exam, classid) VALUES ($1, $2)",
        [examId, cls.value]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: examid ? update : create });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
});

router.get("/get-exam", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const { homebase, id, level } = req.user;
    const offset = (page - 1) * limit;

    let countQuery;
    let dataQuery;

    if (level === "admin") {
      countQuery = {
        text: `SELECT COUNT(*) FROM c_exam 
				WHERE homebase = $1 AND name ILIKE $2`,
        values: [homebase, `%${search}%`],
      };

      dataQuery = {
        text: `SELECT 
					c_exam.*,
					u_teachers.name AS teacher_name,
					COALESCE(
						(
							SELECT json_agg(
								jsonb_build_object(
									'id', bank_data.bank_id,
									'name', bank_data.bank_name,
									'pg', bank_data.pg,
									'essay', bank_data.essay,
									'type', bank_data.btype
								)
							)
							FROM (
								SELECT 
									c_bank.id AS bank_id,
									c_bank.name AS bank_name,
									c_ebank.pg,
									c_ebank.essay,
									c_bank.btype
								FROM c_ebank
								LEFT JOIN c_bank ON c_bank.id = c_ebank.bank
								WHERE c_ebank.exam = c_exam.id
							) bank_data
						),
						'[]'
					) AS banks,
					COALESCE(
						(
							SELECT json_agg(
								jsonb_build_object(
									'id', class_data.class_id,
									'name', class_data.class_name
								)
							)
							FROM (
								SELECT 
									a_class.id AS class_id,
									a_class.name AS class_name
								FROM c_class
								LEFT JOIN a_class ON a_class.id = c_class.classid
								WHERE c_class.exam = c_exam.id
							) class_data
						),
						'[]'
					) AS classes
				FROM c_exam
				LEFT JOIN u_teachers ON u_teachers.id = c_exam.teacher
				LEFT JOIN c_ebank ON c_ebank.exam = c_exam.id
				WHERE c_exam.homebase = $1 
				AND (c_exam.name ILIKE $2 OR u_teachers.name ILIKE $2)
				GROUP BY c_exam.id, u_teachers.name
				ORDER BY c_exam.name ASC
				LIMIT $3 OFFSET $4`,
        values: [homebase, `%${search}%`, limit, offset],
      };
    } else {
      countQuery = {
        text: `SELECT COUNT(*) FROM c_exam 
				WHERE homebase = $1 AND teacher = $2 AND name ILIKE $3`,
        values: [homebase, id, `%${search}%`],
      };

      dataQuery = {
        text: `SELECT 
					c_exam.*,
					u_teachers.name AS teacher_name,
					COALESCE(
						(
							SELECT json_agg(
								jsonb_build_object(
									'id', bank_data.bank_id,
									'name', bank_data.bank_name,
									'pg', bank_data.pg,
									'essay', bank_data.essay,
									'type', bank_data.btype
								)
							)
							FROM (
								SELECT 
									c_bank.id AS bank_id,
									c_bank.name AS bank_name,
									c_ebank.pg,
									c_ebank.essay,
									c_bank.btype
								FROM c_ebank
								LEFT JOIN c_bank ON c_bank.id = c_ebank.bank
								WHERE c_ebank.exam = c_exam.id
							) bank_data
						),
						'[]'
					) AS banks,
					COALESCE(
						(
							SELECT json_agg(
								jsonb_build_object(
									'id', class_data.class_id,
									'name', class_data.class_name
								)
							)
							FROM (
								SELECT 
									a_class.id AS class_id,
									a_class.name AS class_name
								FROM c_class
								LEFT JOIN a_class ON a_class.id = c_class.classid
								WHERE c_class.exam = c_exam.id
							) class_data
						),
						'[]'
					) AS classes
				FROM c_exam
				LEFT JOIN u_teachers ON u_teachers.id = c_exam.teacher
				WHERE c_exam.homebase = $1 
				AND c_exam.teacher = $2
				AND (c_exam.name ILIKE $3 OR u_teachers.name ILIKE $3)
				GROUP BY c_exam.id, u_teachers.name
				ORDER BY c_exam.name ASC
				LIMIT $4 OFFSET $5`,
        values: [homebase, id, `%${search}%`, limit, offset],
      };
    }

    const [countResult, dataResult] = await Promise.all([
      client.query(countQuery),
      client.query(dataQuery),
    ]);

    const totalData = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      exams: dataResult.rows,
      totalData,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete(
  "/delete-exam",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.query;

      await client.query("DELETE FROM c_exam WHERE id = $1", [id]);

      res.status(200).json({ message: remove });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.put("/change-status", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    const data = await client.query("SELECT * FROM c_exam WHERE id = $1", [id]);

    const status = !data.rows[0].isactive;

    await client.query("UPDATE c_exam SET isactive = $1 WHERE id = $2", [
      status,
      id,
    ]);

    res.status(200).json({ message: update });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-exam-by-class", authorize("student"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, page, limit, search } = req.query;
    const offset = (page - 1) * limit;

    const count = await client.query(
      `SELECT COUNT(*) FROM c_exam 
			WHERE id IN (SELECT exam FROM c_class WHERE classid = $1)
			AND name ILIKE $2`,
      [classid, `%${search}%`]
    );

    const totalData = parseInt(count.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);

    const data = await client.query(
      `SELECT c_exam.*, u_teachers.name AS teacher_name
			FROM c_exam
			LEFT JOIN u_teachers ON u_teachers.id = c_exam.teacher
			WHERE c_exam.id IN (SELECT exam FROM c_class WHERE classid = $1)
			AND (c_exam.name ILIKE $2 OR u_teachers.name ILIKE $2)
			ORDER BY c_exam.name ASC
			LIMIT $3 OFFSET $4`,
      [classid, `%${search}%`, limit, offset]
    );

    res.status(200).json({ exams: data.rows, totalData, totalPages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get(
  "/get-exam-and-questions",
  authorize("student"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { examid } = req.query;

      // Get exam details
      const examQuery = `
        SELECT 
          c_exam.*,
          u_teachers.name AS teacher_name
        FROM c_exam
        LEFT JOIN u_teachers ON u_teachers.id = c_exam.teacher
        WHERE c_exam.id = $1
      `;

      const examResult = await client.query(examQuery, [examid]);

      if (examResult.rows.length === 0) {
        return res.status(404).json({ message: "Exam not found" });
      }

      const exam = examResult.rows[0];

      // Get exam banks
      const banksQuery = `
        SELECT 
          c_ebank.*,
          c_bank.name AS bank_name,
          c_bank.btype
        FROM c_ebank
        LEFT JOIN c_bank ON c_bank.id = c_ebank.bank
        WHERE c_ebank.exam = $1
      `;

      const banksResult = await client.query(banksQuery, [examid]);
      const banks = banksResult.rows;

      // Get questions for each bank
      let questions = [];

      for (const bank of banks) {
        let questionsQuery = `
          SELECT 
            c_question.*
          FROM c_question
          WHERE c_question.bank = $1
        `;

        const questionsResult = await client.query(questionsQuery, [bank.bank]);
        let bankQuestions = questionsResult.rows;

        // Add questions to the array with bank info
        questions.push(...bankQuestions);
      }

      // Apply shuffling if exam.isshuffle is true
      if (exam.isshuffle) {
        // Separate questions by type
        const type1Questions = questions.filter((q) => q.qtype === 1);
        const type2Questions = questions.filter((q) => q.qtype === 2);
        const otherQuestions = questions.filter(
          (q) => q.qtype !== 1 && q.qtype !== 2
        );

        // Shuffle each group separately
        const shuffledType1 = shuffleArray(type1Questions);
        const shuffledType2 = shuffleArray(type2Questions);
        const shuffledOther = shuffleArray(otherQuestions);

        // Combine questions with type 1 first, then type 2, then others
        questions = [...shuffledType1, ...shuffledType2, ...shuffledOther];

        // For multiple choice questions (qtype = 1), also shuffle choices
        questions = questions.map((q) => {
          if (q.qtype === 1) {
            // Create choices array with key and text
            const choices = [
              { key: "a", text: q.a },
              { key: "b", text: q.b },
              { key: "c", text: q.c },
              { key: "d", text: q.d },
              { key: "e", text: q.e },
            ].filter((choice) => choice.text); // Remove empty choices

            // Shuffle the choices array
            const shuffledChoices = shuffleArray(choices);

            // Return the question with shuffled choices, without original values
            return {
              ...q,
              choices: shuffledChoices,
              // Remove original values
              a: undefined,
              b: undefined,
              c: undefined,
              d: undefined,
              e: undefined,
            };
          }
          return q;
        });
      } else {
        // If not shuffled, format multiple choice questions with choices array
        questions = questions.map((q) => {
          if (q.qtype === 1) {
            const choices = [
              { key: "a", text: q.a },
              { key: "b", text: q.b },
              { key: "c", text: q.c },
              { key: "d", text: q.d },
              { key: "e", text: q.e },
            ].filter((choice) => choice.text); // Remove empty choices

            return {
              ...q,
              choices: choices,
            };
          }
          return q;
        });
      }

      // Sort questions by id and then by qtype if not shuffled
      if (!exam.isshuffle) {
        questions.sort((a, b) => {
          if (a.id !== b.id) {
            return a.id - b.id;
          }
          return a.qtype - b.qtype;
        });
      }

      res.status(200).json({
        exam,
        banks,
        questions,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// Helper function to shuffle an array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default router;
