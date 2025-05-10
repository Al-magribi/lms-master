import express from "express";
import { pool } from "../../config/config.js";

const router = express.Router();

router.get("/province", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM db_province
      ORDER BY name ASC`);

    const trimed = result.rows.map((row) => ({
      id: row.id.trim(),
      name: row.name.trim(),
    }));

    res.status(200).json(trimed);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.get("/city", async (req, res) => {
  const client = await pool.connect();
  try {
    const { provinceid } = req.query;

    if (!provinceid) {
      return res.status(400).json({ error: "Province ID is required" });
    }

    const result = await client.query(
      `SELECT * FROM db_city WHERE provinceid = $1
      ORDER BY name ASC`,
      [provinceid]
    );

    const trimed = result.rows.map((row) => ({
      id: row.id.trim(),
      name: row.name.trim(),
    }));

    res.status(200).json(trimed);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.get("/district", async (req, res) => {
  const client = await pool.connect();
  try {
    const { cityid } = req.query;

    if (!cityid) {
      return res.status(400).json({ error: "City ID is required" });
    }

    const result = await client.query(
      `SELECT * FROM db_district WHERE cityid = $1
      ORDER BY name ASC`,
      [cityid]
    );

    const trimed = result.rows.map((row) => ({
      id: row.id.trim(),
      name: row.name.trim(),
    }));

    res.status(200).json(trimed);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.get("/village", async (req, res) => {
  const client = await pool.connect();
  try {
    const { districtid } = req.query;

    if (!districtid) {
      return res.status(400).json({ error: "District ID is required" });
    }

    const result = await client.query(
      `SELECT * FROM db_village WHERE districtid = $1
      ORDER BY name ASC`,
      [districtid]
    );

    const trimed = result.rows.map((row) => ({
      id: row.id.trim(),
      name: row.name.trim(),
    }));

    res.status(200).json(trimed);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;
