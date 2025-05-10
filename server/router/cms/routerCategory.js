import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const router = express.Router();

router.get("/get-category", async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;

    if (!page || !limit) {
      const data = await client.query(
        `SELECT * FROM cms_category ORDER BY createdat DESC`
      );
      return res.status(200).json(data.rows);
    }

    const count = await client.query(
      `SELECT COUNT(*) FROM cms_category WHERE name LIKE '%${search}%'`
    );

    const query = `SELECT * FROM cms_category
     WHERE name LIKE '%${search}%' 
     ORDER BY createdat DESC 
     LIMIT ${limit} OFFSET ${offset}`;

    const data = await client.query(query);

    return res.status(200).json({
      result: data.rows,
      totalData: count.rows[0].count,
      totalPage: Math.ceil(count.rows[0].count / limit),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: error.message });
  }
});

router.post("/create-category", authorize("cms"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, name } = req.body;

    if (id) {
      await client.query("UPDATE cms_category SET name = $1 WHERE id = $2", [
        name,
        id,
      ]);
    } else {
      await client.query("INSERT INTO cms_category (name) VALUES ($1)", [name]);
    }

    return res.status(200).json({ message: id ? update : create });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-category", authorize("cms"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    const check = await client.query(
      "SELECT * FROM cms_category WHERE id = $1",
      [id]
    );

    if (check.rows[0].name === "Kegiatan") {
      return res.status(400).json({ message: "Data tidak bisa dihapus" });
    } else {
      await client.query("DELETE FROM cms_category WHERE id = $1", [id]);

      return res.status(200).json({ message: remove });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
