import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const router = express.Router();

// ====================================
// Endpoint Surah
// ====================================

router.get("/get-surah", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;

    if (!page && !limit) {
      const data = await client.query(
        `SELECT * FROM t_surah
                WHERE name ILIKE $1
                ORDER BY id ASC`,
        [`%${search}%`]
      );

      return res.status(200).json(data.rows);
    }

    const offset = (page - 1) * limit;

    const data = await client.query(
      `SELECT * FROM t_surah
                WHERE name ILIKE $1
                ORDER BY id ASC
                LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const totalData = await client.query(
      `SELECT COUNT(*) FROM t_surah
                WHERE name ILIKE $1`,
      [`%${search}%`]
    );

    const totalPages = Math.ceil(totalData.rows[0].count / limit);

    return res.status(200).json({
      result: data.rows,
      totalPages,
      totalData: totalData.rows[0].count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Add or update surah endpoint
router.post("/add-surah", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, name, ayat, lines } = req.body;

    // Validate required fields
    if (!name || !ayat || !lines) {
      return res
        .status(400)
        .json({ message: "Name, ayat, and lines are required" });
    }

    // Check if surah with the same name already exists (for insert case)
    if (!id) {
      const existingSurah = await client.query(
        `SELECT * FROM t_surah WHERE name = $1`,
        [name]
      );

      if (existingSurah.rows.length > 0) {
        return res.status(400).json({ message: "Nama surah sudah ada" });
      }
    }

    let result;

    if (id) {
      // Update existing surah
      result = await client.query(
        `UPDATE t_surah 
         SET name = $1, ayat = $2, lines = $3 
         WHERE id = $4 
         RETURNING *`,
        [name, ayat, lines, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Surah tidak ditemukan" });
      }

      return res.status(200).json({
        message: update,
        data: result.rows[0],
      });
    } else {
      // Insert new surah
      result = await client.query(
        `INSERT INTO t_surah (name, ayat, lines) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [name, ayat, lines]
      );

      return res.status(201).json({
        message: create,
        data: result.rows[0],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Delete surah endpoint
router.delete("/delete-surah", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    // Validate ID
    if (!id) {
      return res.status(400).json({ message: "ID surah diperlukan" });
    }

    // Check if surah exists
    const existingSurah = await client.query(
      `SELECT * FROM t_surah WHERE id = $1`,
      [id]
    );

    if (existingSurah.rows.length === 0) {
      return res.status(404).json({ message: "Surah tidak ditemukan" });
    }

    // Delete surah
    await client.query(`DELETE FROM t_surah WHERE id = $1`, [id]);

    return res.status(200).json({
      message: remove,
      data: existingSurah.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ====================================
// Endpoint Juz
// ====================================
router.post("/add-juz", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, name } = req.body;

    if (id) {
      await client.query(`UPDATE t_juz SET name = $1 WHERE id = $2`, [
        name,
        id,
      ]);
    } else {
      await client.query(`INSERT INTO t_juz(name) VALUES($1) RETURNING *`, [
        name,
      ]);
    }

    res.status(200).json({ message: id ? update : create });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-juz", authorize("tahfiz", "student"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search = "" } = req.query;
    let query;
    let values = [];

    if (!page || !limit) {
      query = `SELECT t_juz.*, 
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', t_juzitems.id,
                'surah_id', t_surah.id,
                'surah', t_surah.name,
                'from_ayat', t_juzitems.from_ayat,
                'to_ayat', t_juzitems.to_ayat,
                'lines', t_juzitems.lines
              )
            ) FILTER (WHERE t_juzitems.id IS NOT NULL), '[]'
          ) AS surah,
          COALESCE((SELECT SUM(to_ayat) FROM t_juzitems WHERE t_juzitems.juz_id = t_juz.id), 0) AS total_ayat,
          COALESCE((SELECT SUM(lines) FROM t_juzitems WHERE t_juzitems.juz_id = t_juz.id), 0) AS total_line
        FROM t_juz
        LEFT JOIN t_juzitems ON t_juz.id = t_juzitems.juz_id
        LEFT JOIN t_surah ON t_juzitems.surah_id = t_surah.id
        GROUP BY t_juz.id
        ORDER BY CAST(SUBSTRING(t_juz.name FROM 'Juz ([0-9]+)') AS INTEGER) ASC`;
      const data = await client.query(query);
      return res.json(data.rows);
    } else {
      // Query to get total data count
      const countQuery = `
        SELECT COUNT(*) AS total FROM t_juz
        WHERE LOWER(name) LIKE LOWER($1)
      `;
      const countResult = await client.query(countQuery, [`%${search}%`]);
      const totalData = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalData / parseInt(limit));

      query = `
        SELECT t_juz.*, 
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', t_juzitems.id,
                'surah_id', t_surah.id,
                'surah', t_surah.name,
                'from_ayat', t_juzitems.from_ayat,
                'to_ayat', t_juzitems.to_ayat,
                'lines', t_juzitems.lines
              )
            ) FILTER (WHERE t_juzitems.id IS NOT NULL), '[]'
          ) AS surah,
          COALESCE((SELECT SUM(to_ayat) FROM t_juzitems WHERE t_juzitems.juz_id = t_juz.id), 0) AS total_ayat,
          COALESCE((SELECT SUM(lines) FROM t_juzitems WHERE t_juzitems.juz_id = t_juz.id), 0) AS total_line
        FROM t_juz
        LEFT JOIN t_juzitems ON t_juz.id = t_juzitems.juz_id
        LEFT JOIN t_surah ON t_juzitems.surah_id = t_surah.id
        WHERE LOWER(t_juz.name) LIKE LOWER($1)
        GROUP BY t_juz.id
        ORDER BY CAST(SUBSTRING(t_juz.name FROM 'Juz ([0-9]+)') AS INTEGER) ASC
        LIMIT $2 OFFSET $3
      `;
      values = [
        `%${search}%`,
        parseInt(limit),
        (parseInt(page) - 1) * parseInt(limit),
      ];

      const data = await client.query(query, values);
      res.json({
        totalData,
        totalPages,
        juz: data.rows,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/add-surah-to-juz", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, juzId, surahId, fromAyat, toAyat, lines } = req.body;

    if (id) {
      await client.query(
        `UPDATE t_juzitems 
          SET juz_id = $1, surah_id = $2, 
          from_ayat = $3, to_ayat = $4,
          lines = $5 
          WHERE id = $6`,
        [juzId, surahId, fromAyat, toAyat, lines, id]
      );
    } else {
      await client.query(
        `INSERT INTO 
          t_juzitems(juz_id, surah_id, from_ayat, to_ayat, lines)
          VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [juzId, surahId, fromAyat, toAyat, lines]
      );
    }

    res.status(200).json({ message: id ? update : create });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-juz", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    await client.query("DELETE FROM t_juz WHERE id = $1", [id]);

    res.status(200).json({ message: remove });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
