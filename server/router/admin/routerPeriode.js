import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";

const success = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";

const router = express.Router();

router.post("/add-periode", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, name } = req.body;
    const homebase = req.user.homebase;

    await client.query("BEGIN");

    if (id) {
      await client.query(
        `UPDATE a_periode SET name = $1, homebase = $2 
				WHERE id = $3`,
        [name, homebase, id]
      );
    } else {
      await client.query(
        `INSERT INTO a_periode(name, homebase) VALUES ($1, $2)`,
        [name, homebase]
      );
    }

    await client.query("COMMIT");
    res.status(200).json({ message: id ? update : success });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-periode", authorize("admin", "teacher"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;
    const homebase = req.user.homebase;

    if (!page && !limit) {
      const data = await client.query(
        `SELECT * FROM a_periode WHERE homebase = $1`,
        [homebase]
      );

      return res.status(200).json(data.rows);
    }

    const [count, data] = await Promise.all([
      client.query(
        `SELECT COUNT(*) FROM a_periode 
				WHERE homebase = $1 AND name ILIKE $2`,
        [homebase, `%${search}%`]
      ),
      client.query(
        `SELECT * FROM a_periode 
				WHERE homebase = $1 AND name ILIKE $2
				ORDER BY name ASC
				LIMIT $3 OFFSET $4`,
        [homebase, `%${search}%`, limit, offset]
      ),
    ]);

    const totalData = parseInt(count.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);
    const periodes = data.rows;

    res.status(200).json({ totalData, totalPages, periodes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-periode", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const homebase = req.user.homebase;

    await client.query("BEGIN");
    await client.query(
      `DELETE FROM a_periode 
			WHERE id = $1 AND homebase = $2`,
      [id, homebase]
    );
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

router.put("/change-status", authorize("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const active = true;
    const nonactive = false;
    const homebase = req.user.homebase;

    await client.query("BEGIN");

    // Set semua periode menjadi false
    await client.query(
      `UPDATE a_periode 
			SET isactive = $1 WHERE homebase = $2`,
      [nonactive, homebase]
    );

    // Set periode dengan id yang diberikan menjadi true
    await client.query(
      `UPDATE a_periode 
			SET isactive = $1 WHERE id = $2 AND homebase = $3`,
      [active, id, homebase]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Status periode berhasil diubah" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
