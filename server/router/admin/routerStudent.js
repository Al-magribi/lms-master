import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import bcrypt from "bcrypt";

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";

const router = express.Router();

router.post("/add-student", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, entry, nis, name, gender } = req.body;
    const homebase = req.user.homebase;
    const password = "12345678";
    const hashedPassword = await bcrypt.hash(password, 10);

    const periode = await client.query(
      `SELECT * FROM a_periode WHERE isactive = true AND homebase = $1`,
      [homebase]
    );

    const activePeriode = periode.rows[0].id;

    await client.query("BEGIN");

    const checkData = await client.query(
      `SELECT * FROM u_students
			WHERE homebase = $1 AND nis = $2`,
      [homebase, nis]
    );

    if (checkData.rowCount > 0 && !id) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "NIS sudah terdaftar" });
    }

    if (id) {
      await client.query(
        `UPDATE u_students
				SET name = $1, nis = $2, gender = $3 WHERE id = $4`,
        [name, nis, gender, id]
      );
    } else {
      await client.query(
        `INSERT INTO u_students(entry, nis, name, password, homebase, gender, periode)
				VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [entry, nis, name, hashedPassword, homebase, gender, activePeriode]
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
});

router.post("/upload-students", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const students = req.body;
    const password = "12345678";
    const hash = await bcrypt.hash(password, 10);
    const homebase = req.user.homebase;

    await client.query("BEGIN");

    await Promise.all(
      students.map(async (student) => {
        await client.query(
          `INSERT INTO u_students(homebase, entry, nis, name, gender, password)
					VALUES($1, $2, $3, $4, $5, $6)`,
          [homebase, student[0], student[1], student[2], student[3], hash]
        );
      })
    );

    await client.query("COMMIT");
    res
      .status(200)
      .json({ message: `${students?.length} Siswa berhasil disimpan` });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-students", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;
    const homebase = req.user.homebase;

    const periode = await client.query(
      `SELECT * FROM a_periode 
      WHERE isactive = true AND homebase = $1`,
      [homebase]
    );

    const activePeriode = periode.rows[0].id;

    const [count, data] = await Promise.all([
      client.query(
        `SELECT COUNT(*) FROM u_students
				WHERE homebase = $1 
        AND (name ILIKE $2 OR nis ILIKE $2)
        AND periode = $3
        AND isactive = true`,
        [homebase, `%${search}%`, activePeriode]
      ),

      client.query(
        `SELECT u_students.*,
				entry_periode.id AS entry_id,
        entry_periode.name AS entry,
				periode_periode.id AS periode_id,
        periode_periode.name AS periode_name,
				a_homebase.name AS homebase
				FROM u_students
				LEFT JOIN a_periode AS entry_periode ON u_students.entry = entry_periode.id
				LEFT JOIN a_periode AS periode_periode ON u_students.periode = periode_periode.id
				LEFT JOIN a_homebase ON u_students.homebase = a_homebase.id
				WHERE u_students.homebase = $1
				AND (u_students.name ILIKE $2 OR u_students.nis ILIKE $2) 
				AND u_students.periode = $3
        AND u_students.isactive = true
				ORDER BY entry_periode.name DESC, u_students.name ASC
				LIMIT $4 OFFSET $5`,
        [homebase, `%${search}%`, activePeriode, limit, offset]
      ),
    ]);

    const totalData = parseInt(count.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);
    const students = data.rows;

    res.status(200).json({ totalData, totalPages, students });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-student", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    await client.query("BEGIN");
    await client.query(`DELETE FROM u_students WHERE id = $1`, [id]);
    await client.query("COMMIT");

    res.status(200).json({ message: remove });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.put(
  "/change-status",
  authorize("admin", "center", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.query;

      const student = await client.query(
        `SELECT * FROM u_students WHERE id = $1`,
        [id]
      );

      const isactive = student.rows[0].isactive;

      await client.query(
        `UPDATE u_students SET isactive = $1 
      WHERE id = $2`,
        [!isactive, id]
      );

      res.status(200).json({ message: "Berhasil mengubah status" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.put(
  "/change-periode",
  authorize("admin", "teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { userid, periodeid } = req.body;

      await client.query("BEGIN");

      const user = await client.query(
        `SELECT * FROM u_students WHERE id = $1`,
        [userid]
      );

      if (user.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Siswa tidak ditemukan" });
      }

      await client.query(`UPDATE u_students SET periode = $1 WHERE id = $2`, [
        periodeid,
        userid,
      ]);

      await client.query("COMMIT");

      res.status(200).json({ message: "Berhasil mengubah tahun ajaran" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.put("/graduated", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid } = req.query;

    await client.query("BEGIN");

    await client.query(
      `UPDATE u_students SET isactive = false 
       WHERE id IN (
         SELECT student FROM cl_students 
         WHERE classid = $1
       )`,
      [classid]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Berhasil meluluskan semua siswa" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
