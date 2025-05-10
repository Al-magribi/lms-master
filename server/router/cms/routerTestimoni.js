import { Router } from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";

const router = Router();

router.get("/get-testimonies", async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search = "" } = req.query;

    // If page and limit are not provided, return all testimonies
    if (!page || !limit) {
      const query = search
        ? `SELECT * FROM cms_testimony WHERE name ILIKE $1 ORDER BY id DESC`
        : `SELECT * FROM cms_testimony ORDER BY id DESC`;

      const params = search ? [`%${search}%`] : [];
      const { rows: testimonies } = await client.query(query, params);

      return res.status(200).json({
        results: testimonies,
        totalPage: 1,
        totalData: testimonies.length,
      });
    }

    // Pagination logic
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = search
      ? `SELECT COUNT(*) FROM cms_testimony WHERE name ILIKE $1`
      : `SELECT COUNT(*) FROM cms_testimony`;

    const countParams = search ? [`%${search}%`] : [];
    const {
      rows: [{ count }],
    } = await client.query(countQuery, countParams);
    const totalData = parseInt(count);

    // Get paginated data
    const dataQuery = search
      ? `SELECT * FROM cms_testimony WHERE name ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3`
      : `SELECT * FROM cms_testimony ORDER BY id DESC LIMIT $1 OFFSET $2`;

    const dataParams = search
      ? [`%${search}%`, limit, offset]
      : [limit, offset];

    const { rows: testimonies } = await client.query(dataQuery, dataParams);
    const totalPage = Math.ceil(totalData / limit);

    res.status(200).json({
      results: testimonies,
      totalPage,
      totalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/add-testimony", authorize("cms"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, name, description, testimonial } = req.body;

    if (!name || !description || !testimonial) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    if (id) {
      await client.query(
        `UPDATE cms_testimony 
            SET name = $1, description = $2, testimonial = $3 
            WHERE id = $4`,
        [name, description, testimonial, id]
      );
      return res.status(200).json({ message: update });
    }

    await client.query(
      `INSERT INTO 
        cms_testimony (name, description, testimonial) 
        VALUES ($1, $2, $3)`,
      [name, description, testimonial]
    );
    return res.status(200).json({ message: create });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-testimony", authorize("cms"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    await client.query(`DELETE FROM cms_testimony WHERE id = $1`, [id]);
    return res.status(200).json({ message: remove });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
