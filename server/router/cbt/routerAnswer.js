import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const router = Router();

// ================================
// SISWA
// ================================
router.post("/add-answer", authorize("student"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, student, exam, question, mc, essay } = req.body;

    // Get the question's point and correct answer (qkey)
    const questionQuery = `
      SELECT poin, qkey FROM c_question WHERE id = $1
    `;
    const questionResult = await client.query(questionQuery, [question]);
    const questionData = questionResult.rows[0];

    // Calculate points based on whether mc matches qkey
    const isCorrect = questionData
      ? mc?.toUpperCase() === questionData.qkey?.toUpperCase()
      : false;
    const point = questionData ? (isCorrect ? questionData.poin : 0) : 0;
    const correct = questionData.qkey;

    // Check if an answer already exists for this student, exam, and question
    const checkExistingQuery = `
      SELECT id FROM c_answer 
      WHERE student = $1 AND exam = $2 AND question = $3
    `;
    const existingResult = await client.query(checkExistingQuery, [
      student,
      exam,
      question,
    ]);
    const existingAnswer = existingResult.rows[0];

    if (existingAnswer) {
      // Update existing answer
      const updateQuery = `
        UPDATE c_answer SET 
        mc = $1, essay = $2, point = $3, correct = $4
        WHERE id = $5
      `;
      await client.query(updateQuery, [
        mc,
        essay,
        point,
        correct,
        existingAnswer.id,
      ]);
      res.status(200).json({ message: update, id: existingAnswer.id });
    } else {
      // Insert new answer
      const insertQuery = `
        INSERT INTO c_answer (student, exam, question, mc, essay, point, correct)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      const insertResult = await client.query(insertQuery, [
        student,
        exam,
        question,
        mc,
        essay,
        point,
        correct,
      ]);
      res.status(200).json({ message: create, id: insertResult.rows[0].id });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get(
  "/get-student-answer",
  authorize("student", "admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { student, exam } = req.query;

      if (req.user.level === "admin" || req.user.level === "teacher") {
        const query = `
          WITH student_info AS (
            SELECT 
              us.id as student_id,
              us.name as student_name,
              us.nis as student_nis,
              ag.name as student_grade,
              ac.name as student_class,
              (SELECT l.createdat 
               FROM logs l 
               WHERE l.student = us.id AND l.exam = $2 AND l.islogin = true 
               ORDER BY l.createdat DESC 
               LIMIT 1) as log_exam
            FROM u_students us
            LEFT JOIN cl_students cls ON us.id = cls.student
            LEFT JOIN a_class ac ON cls.classid = ac.id
            LEFT JOIN a_grade ag ON ac.grade = ag.id
            WHERE us.id = $1
          ),
          answer_stats AS (
            SELECT 
              COUNT(CASE WHEN ca.point > 0 THEN 1 END) as correct_count,
              COUNT(CASE WHEN ca.point = 0 THEN 1 END) as incorrect_count,
              SUM(CASE WHEN ca.mc IS NOT NULL AND ca.point > 0 THEN ca.point ELSE 0 END) as pg_score,
              SUM(CASE WHEN ca.essay IS NOT NULL THEN ca.point ELSE 0 END) as essay_score
            FROM c_answer ca
            WHERE ca.student = $1 AND ca.exam = $2
          ),
          exam_info AS (
            SELECT mc_score, essay_score
            FROM c_exam
            WHERE id = $2
          )
          SELECT 
            si.*,
            COALESCE(answer_stats.correct_count, 0) as correct,
            COALESCE(answer_stats.incorrect_count, 0) as incorrect,
            COALESCE(answer_stats.pg_score, 0) as pg_score,
            COALESCE(answer_stats.essay_score, 0) as essay_score,
            ROUND(
              (COALESCE(answer_stats.pg_score, 0) * ei.mc_score / 100.0) + 
              (COALESCE(answer_stats.essay_score, 0) * ei.essay_score / 100.0), 
              2
            ) as score,
            (
              SELECT json_agg(
                json_build_object(
                  'question_id', cq.id,
                  'question_text', cq.question,
                  'answer', ca.mc,
                  'essay', ca.essay,
                  'correct', cq.qkey,
                  'point', ca.point,
                  'qtype', cq.qtype,
                  'max_point', cq.poin,
                  'id', ca.id
                )
                ORDER BY cq.id
              )
              FROM c_answer ca
              JOIN c_question cq ON ca.question = cq.id
              WHERE ca.student = si.student_id 
              AND ca.exam = $2
            ) as answers
          FROM student_info si
          CROSS JOIN answer_stats answer_stats
          CROSS JOIN exam_info ei
          GROUP BY 
            si.student_id, si.student_name, si.student_nis, si.student_grade, 
            si.student_class, si.log_exam, answer_stats.correct_count, answer_stats.incorrect_count, 
            answer_stats.pg_score, answer_stats.essay_score, ei.mc_score, ei.essay_score
        `;
        const result = await client.query(query, [student, exam]);
        res.status(200).json(result.rows);
      } else {
        // For students, return a simplified version with just their answers
        const query = `
          SELECT 
            ca.id as id,
            cq.id as question_id,
            cq.question as question_text,
            ca.mc,
            ca.essay,
            cq.qkey as correct,
            ca.point,
            cq.qtype,
            cq.poin as max_point
          FROM c_question cq
          LEFT JOIN c_answer ca ON ca.question = cq.id AND ca.student = $1 AND ca.exam = $2
          WHERE cq.id IN (
            SELECT cq2.id 
            FROM c_question cq2
            JOIN c_bank cb ON cq2.bank = cb.id
            JOIN c_ebank ce ON ce.bank = cb.id
            WHERE ce.exam = $2
          )
          ORDER BY cq.id
        `;
        const result = await client.query(query, [student, exam]);
        res.status(200).json(result.rows);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ================================
// TEACHER/ADMIN
// ================================
router.post("/grade-essay", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { answer_id, point } = req.body;

    // Get the answer and question details to validate the point
    const answerQuery = `
      SELECT ca.*, cq.poin as max_point, cq.qtype
      FROM c_answer ca
      JOIN c_question cq ON ca.question = cq.id
      WHERE ca.id = $1
    `;
    const answerResult = await client.query(answerQuery, [answer_id]);

    if (answerResult.rows.length === 0) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const answerData = answerResult.rows[0];

    // Validate that this is an essay question
    if (answerData.qtype !== 2) {
      return res.status(400).json({ message: "This is not an essay question" });
    }

    // Validate that the point doesn't exceed the maximum
    if (point > answerData.max_point) {
      return res.status(400).json({
        message: `Point cannot exceed the maximum of ${answerData.max_point}`,
      });
    }

    // Update the answer with the new point
    const updateQuery = `
      UPDATE c_answer SET point = $1
      WHERE id = $2
    `;
    await client.query(updateQuery, [point, answer_id]);

    res.status(200).json({ message: update });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get(
  "/get-line-chart-data",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { exam } = req.query;
      const homebase = req.user.homebase;

      const period = await client.query(
        `SELECT * FROM a_periode WHERE homebase = $1 AND isactive = true`,
        [homebase]
      );

      const activePeriod = period.rows[0].id;

      const query = `
        WITH student_scores AS (
          SELECT 
            us.id as student_id,
            ROUND(
              (
                SUM(
                  CASE 
                    WHEN cq.qtype = 1 AND ca.point > 0 THEN ca.point 
                    ELSE 0 
                  END
                ) * ce.mc_score / 100.0
              ) + 
              (
                SUM(
                  CASE 
                    WHEN cq.qtype = 2 THEN ca.point 
                    ELSE 0 
                  END
                ) * ce.essay_score / 100.0
              ),
              2
            ) as final_score
          FROM u_students us
          JOIN c_answer ca ON us.id = ca.student
          JOIN c_exam ce ON ca.exam = ce.id
          JOIN c_question cq ON ca.question = cq.id
          WHERE ca.exam = $1
          AND us.periode = $2
          AND us.isactive = true
          GROUP BY us.id, ce.mc_score, ce.essay_score
        ),
        score_ranges AS (
          SELECT 
            CASE 
              WHEN final_score >= 0 AND final_score <= 10 THEN '0-10'
              WHEN final_score > 10 AND final_score <= 20 THEN '11-20'
              WHEN final_score > 20 AND final_score <= 30 THEN '21-30'
              WHEN final_score > 30 AND final_score <= 40 THEN '31-40'
              WHEN final_score > 40 AND final_score <= 50 THEN '41-50'
              WHEN final_score > 50 AND final_score <= 60 THEN '51-60'
              WHEN final_score > 60 AND final_score <= 70 THEN '61-70'
              WHEN final_score > 70 AND final_score <= 80 THEN '71-80'
              WHEN final_score > 80 AND final_score <= 90 THEN '81-90'
              WHEN final_score > 90 AND final_score <= 100 THEN '91-100'
            END as score_range,
            COUNT(*) as quantity
          FROM student_scores
          GROUP BY score_range
          ORDER BY score_range ASC
        )
        SELECT 
          COALESCE(score_range, '0-10') as score,
          COALESCE(quantity, 0) as quantity
        FROM score_ranges
      `;

      const result = await client.query(query, [exam, activePeriod]);
      res.status(200).json(result.rows);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.get(
  "/get-exam-score-list",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { exam, classid, page = 1, limit = 10, search = "" } = req.query;
      const offset = (page - 1) * limit;

      const homebase = req.user.homebase;

      const period = await client.query(
        `SELECT * FROM a_periode WHERE 
        homebase = $1 AND isactive = true`,
        [homebase]
      );

      const activePeriod = period.rows[0].id;

      // Base query for exam info
      const examInfoQuery = `
        SELECT 
          ce.id as exam_id,
          ce.name as exam_name,
          ce.token as exam_token,
          ut.name as teacher_name,
          ah.name as homebase_name,
          ce.mc_score,
          ce.essay_score
        FROM c_exam ce
        JOIN u_teachers ut ON ce.teacher = ut.id
        JOIN a_homebase ah ON ce.homebase = ah.id
        WHERE ce.id = $1
      `;
      const examInfo = await client.query(examInfoQuery, [exam]);

      if (examInfo.rows.length === 0) {
        return res.status(404).json({ message: "Exam not found" });
      }

      // Query for students with their scores
      const studentsQuery = `
        WITH student_data AS (
          SELECT 
            us.id as student_id,
            us.nis as student_nis,
            us.name as student_name,
            ag.name as student_grade,
            ac.name as student_class,
            (
              SELECT l.createdat 
              FROM logs l 
              WHERE l.student = us.id AND l.exam = $1 AND l.islogin = true 
              ORDER BY l.createdat DESC 
              LIMIT 1
            ) as log_exam,
            COUNT(CASE WHEN ca.mc IS NOT NULL AND ca.point > 0 THEN 1 END) as correct,
            COUNT(CASE WHEN ca.mc IS NOT NULL AND ca.point = 0 THEN 1 END) as incorrect,
            SUM(CASE WHEN ca.mc IS NOT NULL AND ca.point > 0 THEN ca.point ELSE 0 END) as mc_score,
            SUM(CASE WHEN ca.essay IS NOT NULL THEN ca.point ELSE 0 END) as essay_score,
            ROUND(
              (
                SUM(CASE WHEN ca.mc IS NOT NULL AND ca.point > 0 THEN ca.point ELSE 0 END) * ce.mc_score / 100.0
              ) + 
              (
                SUM(CASE WHEN ca.essay IS NOT NULL THEN ca.point ELSE 0 END) * ce.essay_score / 100.0
              ),
              2
            ) as score
          FROM u_students us
          JOIN cl_students cls ON us.id = cls.student
          JOIN a_class ac ON cls.classid = ac.id
          JOIN a_grade ag ON ac.grade = ag.id
          JOIN c_class cc ON cc.exam = $1 AND cc.classid = cls.classid
          LEFT JOIN c_answer ca ON us.id = ca.student AND ca.exam = $1
          JOIN c_exam ce ON ce.id = $1
          WHERE ($2::integer IS NULL OR cls.classid = $2)
          AND us.periode = $3
          AND us.isactive = true
          AND (
            LOWER(us.name) LIKE LOWER($4) OR 
            LOWER(us.nis) LIKE LOWER($4)
          )
          GROUP BY 
            us.id, us.nis, us.name, ag.name, ac.name, ce.mc_score, ce.essay_score
        ),
        counted_data AS (
          SELECT COUNT(*) OVER() as total_count, student_data.*
          FROM student_data
          ORDER BY CAST(student_class AS TEXT) ASC, student_name ASC
          LIMIT $5 OFFSET $6
        )
        SELECT 
          COALESCE(json_agg(
            json_build_object(
              'student_id', student_id,
              'student_nis', student_nis,
              'student_name', student_name,
              'student_grade', student_grade,
              'student_class', student_class,
              'log_exam', log_exam,
              'correct', correct,
              'incorrect', incorrect,
              'mc_score', mc_score,
              'essay_score', essay_score,
              'score', score
            )
          ), '[]') as students,
          MAX(total_count) as total_count
        FROM counted_data
      `;

      const searchPattern = `%${search}%`;
      const result = await client.query(studentsQuery, [
        exam,
        classid || null,
        activePeriod,
        searchPattern,
        limit,
        offset,
      ]);

      const totalData = parseInt(result.rows[0].total_count || 0);
      const totalPages = parseInt(Math.ceil(totalData / limit));

      res.status(200).json({
        ...examInfo.rows[0],
        students: result.rows[0].students,
        totalData,
        totalPages,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.get(
  "/get-exam-analysis",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { exam, classid, page = 1, limit = 10, search = "" } = req.query;
      const offset = (page - 1) * limit;

      const homebase = req.user.homebase;

      const period = await client.query(
        `SELECT * FROM a_periode WHERE homebase = $1 AND isactive = true`,
        [homebase]
      );

      const activePeriod = period.rows[0].id;

      // Get exam details and questions
      const examQuery = `
        WITH exam_details AS (
          SELECT 
            ce.id as exam_id,
            ce.name as exam_name,
            ce.token as exam_token,
            ut.name as teacher_name
          FROM c_exam ce
          JOIN u_teachers ut ON ce.teacher = ut.id
          WHERE ce.id = $1
        ),
        exam_questions AS (
          SELECT 
            cq.id,
            cq.poin,
            cq.qkey
          FROM c_question cq
          JOIN c_bank cb ON cq.bank = cb.id
          JOIN c_ebank ce ON ce.bank = cb.id
          WHERE ce.exam = $1 AND cq.qtype = 1
          ORDER BY cq.id ASC
        ),
        student_answers AS (
          SELECT 
            ca.student,
            ca.question,
            ca.mc,
            ca.point
          FROM c_answer ca
          WHERE ca.exam = $1 AND ca.essay IS NULL
        ),
        filtered_students AS (
          SELECT 
            us.id,
            us.nis,
            us.name,
            ag.name as grade,
            ac.name as class
          FROM u_students us
          JOIN cl_students cls ON us.id = cls.student
          JOIN a_class ac ON cls.classid = ac.id
          JOIN a_grade ag ON ac.grade = ag.id
          JOIN c_class cc ON cc.exam = $1 AND cc.classid = cls.classid
          WHERE ($2::integer IS NULL OR cls.classid = $2)
          AND us.periode = $3
          AND us.isactive = true
          AND (
            LOWER(us.name) LIKE LOWER($4) OR 
            LOWER(us.nis) LIKE LOWER($4)
          )
        ),
        student_data AS (
          SELECT 
            fs.*,
            COUNT(CASE WHEN sa.point > 0 THEN 1 END) as correct,
            COUNT(CASE WHEN sa.point = 0 THEN 1 END) as incorrect,
            SUM(CASE WHEN sa.mc IS NOT NULL AND sa.point > 0 THEN sa.point ELSE 0 END) as mc_score,
            (
              SELECT json_agg(
                json_build_object(
                  'id', sa.question,
                  'mc', sa.mc
                )
                ORDER BY sa.question ASC
              )
              FROM student_answers sa
              WHERE sa.student = fs.id
            ) as answers
          FROM filtered_students fs
          LEFT JOIN student_answers sa ON fs.id = sa.student
          GROUP BY fs.id, fs.nis, fs.name, fs.grade, fs.class
          ORDER BY fs.class ASC, fs.name ASC
          LIMIT $5 OFFSET $6
        ),
        total_count AS (
          SELECT COUNT(*) as total_count
          FROM filtered_students
        )
        SELECT 
          ed.*,
          (SELECT json_agg(eq.*) FROM exam_questions eq) as questions,
          (SELECT json_agg(sd.*) FROM student_data sd) as students,
          (SELECT total_count FROM total_count) as total_count
        FROM exam_details ed
      `;

      const searchPattern = `%${search}%`;
      const result = await client.query(examQuery, [
        exam,
        classid || null,
        activePeriod,
        searchPattern,
        limit,
        offset,
      ]);

      res.status(200).json({
        ...result.rows[0],
        totalData: parseInt(result.rows[0].total_count),
        totalPages: Math.ceil(parseInt(result.rows[0].total_count) / limit),
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

export default router;

// const result = [
//   {
//     exam_name: "Nama ujian diambil dari c_exam",
//     exam_token: "Token ujian diambil dari c_exam",
//     teacher_name: "Nama guru diambil dari teacher di c_exam",
//     homebase_name: "Nama sekolah diambil dari homebase di c_exam",
//     mc_score: "presentase PG diambil dari c_exam.mc_score",
//     essay_score: "presentase Essay diambil dari c_exam.essay_score",
//     students: [
//       {
//         student_id: "Id siswa diambil dari u_students",
//         student_nis: "NIS siswa diambil dari u_students",
//         student_name: "Nama siswa diambil dari u_students",
//         student_grade:
//           "Tingkat kelas siswa diambil dari a_grade berdasarkan cl_students.grade",
//         student_class:
//           "Kelas siswa diambil dari a_class berdasarkan cl_students.classid",
//         log_exam:
//           "Tanggal ujian diambil dari log dengan kombinasi exam dan student",
//         correct:
//           "jumlah Jawaban benar diambil dari c_answer.point > 0 dan c_answer.essay null",
//         incorrect:
//           " jumlah Jawaban salah diambil dari c_answer.point = 0 dan c_answer.essay null",
//         mc_score:
//           "Jumlah PG benar diambil dari c_answer.point yang c_answer.mc tidak null",
//         essay_score:
//           "Nilai Essay diambil dari c_answer.point yang c_answer.essay tidak null",
//         score:
//           "pg_score dikali c_exam.mc_score ditambah essay_score dikali c_exam.essay_score, 2 angka dibelakang koma",
//       },
//     ],
//   },
// ];

const result = [
  {
    exam_name: "Nama ujian diambil dari c_exam",
    exam_token: "Token ujian diambil dari c_exam",
    teacher_name: "Nama guru diambil dari teacher di c_exam",
    questions: [
      {
        id: "id pertanyaan diambil dari c_question yang qtype = 1",
        poin: "poin pertanyaan diambil dari c_question",
        qkey: "jawaban benar diambil dari c_question",
      },
    ],
    students: [
      {
        id: "id siswa diambil dari u_students",
        nis: "nis siswa diambil dari u_students",
        name: "nama siswa diambil dari u_students",
        grade:
          "tingkat kelas siswa diambil dari a_grade berdasarkan cl_students.grade",
        class:
          "kelas siswa diambil dari a_class berdasarkan cl_students.classid",
        correct:
          "jumlah jawaban benar diambil dari c_answer.point > 0 dan c_answer.essay null",
        incorrect:
          "jumlah jawaban salah diambil dari c_answer.point = 0 dan c_answer.essay null",
        mc_score:
          "jumlah PG benar diambil dari c_answer.point yang c_answer.mc tidak null",
        answer: [
          {
            id: "id question dari c_answer yang essay = null",
            mc: "jawaban siswa diambil dari c_answer.mc",
          },
        ],
      },
    ],
  },
];
