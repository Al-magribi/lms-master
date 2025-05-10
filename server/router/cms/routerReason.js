import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "berhasil dihapus";

const router = Router();

router.post("/add-reason", authorize("cms"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, name, description, icon } = req.body;

    if (id) {
      await client.query(
        `UPDATE cms_reason SET 
          name = $1, description = $2, icon = $3 
        WHERE id = $4 
        RETURNING *`,
        [name, description, icon, id]
      );
      return res.status(200).json({ message: update });
    }

    await client.query(
      `INSERT INTO 
          cms_reason (name, description, icon) 
          VALUES ($1, $2, $3)
        RETURNING *`,
      [name, description, icon]
    );

    return res.status(201).json({ message: create });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-reasons", async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, search, limit } = req.query;
    const offset = (page - 1) * limit;

    if (!page || !limit) {
      const result = await client.query("SELECT * FROM cms_reason");

      return res.status(200).json(result.rows);
    }

    const count = await client.query(
      `SELECT 
        COUNT(*) FROM cms_reason 
        WHERE name ILIKE $1`,
      [`%${search}%`]
    );

    const result = await client.query(
      `SELECT * FROM cms_reason 
        WHERE name ILIKE $1 LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    return res.status(200).json({
      reasons: result.rows,
      totalData: count.rows[0].count,
      totalPage: Math.ceil(count.rows[0].count / limit),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-reason", authorize("cms"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    await client.query("DELETE FROM cms_reason WHERE id = $1", [id]);

    return res.status(200).json({ message: remove });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
