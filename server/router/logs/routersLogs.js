import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";

const create = "Berhasil direkam";
const finish = "Berhasil menyelesaikan ujian";
const update = "Berhasil diubah";
const rejoin = "Diberikan izin untuk masuk";
const remove = "Berhasil dihapus";

const router = express.Router();

// ===============================
// CBT LOGS
// ===============================

router.post("/add-cbt-logs", authorize("student"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { student, exam } = req.body;

    const examData = await client.query(`SELECT * FROM c_exam WHERE id = $1`, [
      exam,
    ]);

    let ipAddress = req.socket.remoteAddress;
    const browser = req.useragent.browser + " " + req.useragent.version;

    if (ipAddress.includes("::ffff:")) {
      ipAddress = ipAddress.split("::ffff:")[1];
    }

    // Check if browser is Chrome
    if (!req.useragent.browser.toLowerCase().includes("chrome")) {
      const data = {
        userid: student,
        exam,
        ipAddress,
        browser,
      };

      console.log(data);

      res.status(400).json({
        message: "Gunakan Chrome untuk mengikuti ujian ini",
        browser: browser,
        ip: ipAddress,
      });
      return;
    }

    // Check if student and exam combination exists
    const existingLog = await client.query(
      `SELECT * FROM logs WHERE student = $1 AND exam = $2`,
      [student, exam]
    );

    if (existingLog.rows.length > 0) {
      const log = existingLog.rows[0];
      // Check if isactive, ispenalty, and isdone are all false
      if (!log.isactive && !log.ispenalty && !log.isdone) {
        const isactive = true;
        const action = `Masuk Ujian ${examData.rows[0].name}`;
        await client.query(
          `UPDATE logs SET 
          isactive = $1, action = $2 
          WHERE id = $3`,
          [isactive, action, log.id]
        );
        res.status(200).json({ message: update });
        return;
      }
    }

    // If no existing log or conditions not met, insert new log
    const islogin = true;
    const ispenalty = false;
    const isactive = true;
    const isdone = false;

    const action = `Masuk Ujian ${examData.rows[0].name}`;

    await client.query(
      `INSERT INTO 
      logs (student, exam, ip, browser, islogin, ispenalty, isactive, isdone, action)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        student,
        exam,
        ipAddress,
        browser,
        islogin,
        ispenalty,
        isactive,
        isdone,
        action,
      ]
    );

    res.status(200).json({ message: create });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-user-log", authorize("student"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { exam, student } = req.query;

    const result = await client.query(
      `SELECT 
            id, student, exam, islogin, 
            ispenalty, isactive, isdone,
            createdat as start_time
        FROM logs WHERE exam = $1 AND student = $2`,
      [exam, student]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.put("/rejoin-exam", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    const isactive = false;
    const ispenalty = false;
    const isdone = false;

    await client.query(
      `UPDATE logs SET isactive = $1, ispenalty = $2, isdone = $3 WHERE id = $4`,
      [isactive, ispenalty, isdone, id]
    );

    res.status(200).json({ message: rejoin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete(
  "/retake-exam",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id, student, exam } = req.query;

      await client.query(`DELETE FROM logs WHERE id = $1`, [id]);

      await client.query(
        `DELETE FROM c_answer WHERE student = $1 AND exam = $2`,
        [student, exam]
      );

      res.status(200).json({ message: remove });
    } catch (error) {
      console.error(error);
    }
  }
);

router.post(
  "/finish-cbt",
  authorize("student", "admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id, exam } = req.query;

      const examData = await client.query(
        `SELECT * FROM c_exam WHERE id = $1`,
        [exam]
      );

      const isactive = false;
      const isdone = true;
      const action = `Ujian ${examData.rows[0].name} diselesaikan`;

      await client.query(
        `UPDATE logs SET isactive = $1, isdone = $2, action = $3 WHERE id = $4`,
        [isactive, isdone, action, id]
      );

      res.status(200).json({ message: finish });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

// ===============================
// EXAM REPORT
// ===============================

// Get all classes for an exam
router.get("/get-filter", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { exam } = req.query;

    const result = await client.query(
      `SELECT 
        a_class.id,
        a_class.name,
        a_grade.name as grade_name,
        a_major.name as major_name
      FROM c_class
      JOIN a_class ON c_class.classid = a_class.id
      LEFT JOIN a_grade ON a_class.grade = a_grade.id
      LEFT JOIN a_major ON a_class.major = a_major.id
      WHERE c_class.exam = $1
      ORDER BY a_grade.name, a_major.name, a_class.name`,
      [exam]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Get exam logs with student details
router.get("/get-exam-log", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { exam, classid, page, limit, search } = req.query;
    const homebase = req.user.homebase;

    // Safely parse page and limit with defaults
    const pageNum = page && !isNaN(page) ? parseInt(page) : 1;
    const limitNum = limit && !isNaN(limit) ? parseInt(limit) : 10;
    const offset = (pageNum - 1) * limitNum;

    const period = await client.query(
      `SELECT * FROM a_periode WHERE
      homebase = $1 AND isactive = true`,
      [homebase]
    );

    const activePeriod = period.rows[0].id;

    // Base query to get all students in classes that have the exam
    let baseQuery = `
      SELECT DISTINCT 
        cs.student as student_id,
        cs.classid as class_id
      FROM c_class cc
      JOIN cl_students cs ON cc.classid = cs.classid
      JOIN u_students us ON cs.student = us.id
      WHERE cc.exam = $1
      AND us.periode = $2
      AND us.isactive = true
    `;

    // Add class filter if provided
    const queryParams = [exam, activePeriod];
    if (classid) {
      baseQuery += ` AND cs.classid = $${queryParams.length + 1}`;
      queryParams.push(classid);
    }

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM (${baseQuery}) exam_students
      JOIN u_students ON exam_students.student_id = u_students.id
      WHERE u_students.name ILIKE $${queryParams.length + 1}
    `;

    // Add search parameter
    queryParams.push(`%${search || ""}%`);

    // Main query with pagination - Updated to properly join with logs table
    const mainQuery = `
      SELECT 
        u_students.id as student_id,
        u_students.name as student_name,
        u_students.nis,
        a_class.id as class_id,
        a_class.name as class_name,
        a_grade.name as grade_name,
        a_major.name as major_name,
        l.id as log_id,
        l.ip,
        l.browser,
        l.createdat,
        l.islogin,
        l.ispenalty,
        l.isactive,
        l.isdone,
        l.action,
        CASE WHEN l.id IS NOT NULL THEN true ELSE false END as has_log
      FROM (${baseQuery}) exam_students
      JOIN u_students ON exam_students.student_id = u_students.id
      JOIN a_class ON exam_students.class_id = a_class.id
      LEFT JOIN a_grade ON a_class.grade = a_grade.id
      LEFT JOIN a_major ON a_class.major = a_major.id
      LEFT JOIN logs l ON l.student = exam_students.student_id AND l.exam = $1
      WHERE u_students.name ILIKE $${queryParams.length}
      ORDER BY 
        COALESCE(a_grade.name, '') ASC,
        COALESCE(a_major.name, '') ASC,
        a_class.name ASC,
        u_students.name ASC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    // Add pagination parameters
    queryParams.push(limitNum, offset);

    // Execute both queries
    const [countResult, dataResult] = await Promise.all([
      client.query(countQuery, queryParams.slice(0, -2)),
      client.query(mainQuery, queryParams),
    ]);

    const totalData = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalData / limitNum);

    res.status(200).json({
      result: dataResult.rows,
      totalData,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
