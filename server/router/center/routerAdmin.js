import express from "express";
import { pool } from "../../config/config.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import SendEmail from "../../utils/sendEmail.js";
import { authorize } from "../../middleware/auth.js";

const create = "Berhasil disimpan";
const update = "Berhasil diperbarui";
const remove = "Berhasil dihapus";
const failed = "Gagal Menambahkan";

const router = express.Router();

router.get("/get-admin", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;

    const [count, data] = await Promise.all([
      client.query(
        `SELECT COUNT(*) AS total FROM u_admin
        WHERE name ILIKE $1 OR email ILIKE $1`,
        [`%${search}%`]
      ),
      client.query(
        `SELECT u_admin.id, u_admin.name AS username, u_admin.email,
        u_admin.activation, u_admin.level,
        a_homebase.name AS homebase, u_admin.isactive, u_admin.phone
        FROM u_admin
        LEFT JOIN a_homebase ON a_homebase.id = u_admin.homebase
        WHERE u_admin.name ILIKE $1 OR u_admin.email ILIKE $1
        LIMIT $2 OFFSET $3`,
        [`%${search}%`, limit, offset]
      ),
    ]);

    const totalData = parseInt(count.rows[0].total, 10);
    const totalPage = Math.ceil(totalData / limit);
    const admin = data.rows;

    res.status(200).json({ totalPage, totalData, admin });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/add-admin", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, home, name, phone, email, password, level } = req.body;

    await client.query("BEGIN");

    if (id) {
      await client.query(
        `UPDATE u_admin 
        SET name = $1, email = $2, homebase = $3, phone = $4, level = $5 
        WHERE id = $6`,
        [name, email, home, phone, level, id]
      );

      await client.query("COMMIT");
      return res.status(200).json({ message: update });
    }

    if (!password) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Password tidak tersedia" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (level !== "center") {
      const activation = uuidv4();
      const data = await client.query(
        `INSERT INTO u_admin (name, email, password, level, homebase, phone, activation) 
        VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, email, hashedPassword, level, home, phone, activation]
      );

      const url = `${process.env.DOMAIN}/aktivasi-akun/${data.rows[0].activation}`;
      const message = `Link aktivasi: ${url}`;

      await SendEmail({ email: email, subject: "Aktivasi Akun", message });

      await client.query("COMMIT");
      return res.status(200).json({ message: create });
    }

    const data = await client.query(
      `INSERT INTO u_admin (name, email, password, level, homebase, phone) 
      VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, email, hashedPassword, level, home, phone]
    );

    if (data.rows[0].id) {
      await client.query("COMMIT");
      return res.status(201).json({ message: create });
    } else {
      await client.query("ROLLBACK");
      return res.status(500).json({ message: failed });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-admin", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    await client.query("BEGIN");
    await client.query(`DELETE FROM u_admin WHERE id = $1`, [id]);
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

router.put("/activation", async (req, res) => {
  const client = await pool.connect();
  try {
    const { code } = req.query;
    const status = true;

    await client.query("BEGIN");

    const data = await client.query(
      `SELECT * FROM u_admin WHERE activation = $1 AND isactive = false`,
      [code]
    );

    if (data.rowCount > 0) {
      await client.query(`UPDATE u_admin SET isactive = $1 WHERE id = $2`, [
        status,
        data.rows[0].id,
      ]);

      await client.query("COMMIT");
      res.status(200).json({ message: "Berhasil diaktivasi" });
    } else {
      await client.query("ROLLBACK");
      res.status(404).json({ message: "Data tidak ditemukan" });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
