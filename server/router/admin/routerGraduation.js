import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const router = Router();

router.get("/get-students", authorize("admin"), async (req, res) => {
  const clinet = await pool.connect();
  const homebase = req.user.homebase;

  try {
    const data = await clinet.query(
      `SELECT * FROM u_students WHERE isactive = false AND homebase = $1
      ORDER BY name ASC`,
      [homebase]
    );

    return res.status(200).json(data.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  } finally {
    clinet.release();
  }
});

router.post("/add-data", authorize("admin"), async (req, res) => {
  const clinet = await pool.connect();
  try {
    const { id, agency, userid, description } = req.body;

    await clinet.query("BEGIN");

    const checkUser = await clinet.query(
      `SELECT * FROM u_students WHERE id = $1`,
      [userid]
    );

    if (checkUser.rows.length === 0) {
      return res.status(400).json({ message: "NIS tidak ditemukan" });
    }

    if (id) {
      await clinet.query(
        `UPDATE a_graduation SET 
        agency = $1, userid = $2, description = $3 WHERE id = $4`,
        [agency, userid, description, id]
      );
    } else {
      await clinet.query(
        `INSERT INTO 
        a_graduation (userid, agency, description) 
        VALUES ($1, $2, $3)`,
        [userid, agency, description]
      );
    }

    await clinet.query("COMMIT");
    return res.status(200).json({ message: id ? update : create });
  } catch (error) {
    await clinet.query("ROLLBACK");
    return res.status(500).json({ message: error.message });
  } finally {
    clinet.release();
  }
});

router.get("/get-data", authorize("admin"), async (req, res) => {
  const client = await pool.connect();

  try {
    const { search, page, limit } = req.query;
    const offset = (page - 1) * limit;

    const homebase = req.user.homebase;

    const count = await client.query(
      `SELECT COUNT(*) 
       FROM a_graduation g
       JOIN u_students s ON g.userid = s.id 
       WHERE s.name ILIKE $1 
       OR s.nis ILIKE $1
       OR g.agency ILIKE $1
       AND s.homebase = $2`,
      [`%${search}%`, homebase]
    );

    const data = await client.query(
      `SELECT 
        g.id,
        g.userid,
        g.agency,
        g.description,
        s.name as student_name,
        s.nis
       FROM a_graduation g
       JOIN u_students s ON g.userid = s.id
       WHERE s.name ILIKE $1 
       OR s.nis ILIKE $1
       OR g.agency ILIKE $1
       AND s.homebase = $2
       ORDER BY s.name ASC 
       LIMIT $3 OFFSET $4`,
      [`%${search}%`, homebase, limit, offset]
    );

    return res.status(200).json({
      result: data.rows,
      totalData: count.rows[0].count,
      totalPages: Math.ceil(count.rows[0].count / limit),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-data", authorize("admin"), async (req, res) => {
  const clinet = await pool.connect();

  try {
    const { id } = req.query;

    await clinet.query("BEGIN");

    await clinet.query("DELETE FROM a_graduation WHERE id = $1", [id]);

    await clinet.query("COMMIT");

    return res.status(200).json({ message: remove });
  } catch (error) {
    await clinet.query("ROLLBACK");
    console.log(error);
    return res.status(500).json({ message: error.message });
  } finally {
    clinet.release();
  }
});

export default router;
