import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Konversi URL ke path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/cms");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: imageStorage });

const router = Router();

router.post(
  "/add-facility",
  authorize("cms"),
  upload.single("image"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { id, name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Nama fasilitas harus diisi" });
      }

      let image = null;
      if (req.file) {
        image = `/assets/cms/${req.file.filename}`;
      }

      if (id) {
        // Update existing facility
        if (image) {
          await client.query(
            `UPDATE cms_facility 
              SET name = $1, image = $2 
              WHERE id = $3`,
            [name, image, id]
          );
        } else {
          await client.query(
            `UPDATE cms_facility 
              SET name = $1
              WHERE id = $2`,
            [name, id]
          );
        }
        return res.status(200).json({ message: update });
      }

      // Insert new facility
      if (!image) {
        return res
          .status(400)
          .json({ message: "Gambar fasilitas harus diupload" });
      }

      const query = `INSERT INTO cms_facility (name, image) VALUES ($1, $2)`;
      await client.query(query, [name, image]);

      await client.query("COMMIT");
      res.status(200).json({ message: create });
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.get("/get-facilities", async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, search, limit } = req.query;
    const offset = (page - 1) * limit;

    if (!page || !limit) {
      const result = await client.query("SELECT * FROM cms_facility");

      return res.status(200).json(result.rows);
    }

    const count = await client.query(
      `SELECT 
        COUNT(*) FROM cms_facility 
        WHERE name ILIKE $1`,
      [`%${search}%`]
    );

    const result = await client.query(
      `SELECT * FROM cms_facility 
        WHERE name ILIKE $1 
        ORDER BY createdat DESC
        LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    return res.status(200).json({
      results: result.rows,
      totalData: count.rows[0].count,
      totalPage: Math.ceil(count.rows[0].count / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-facility", authorize("cms"), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.query;

    const facility = await client.query(
      "SELECT image FROM cms_facility WHERE id = $1",
      [id]
    );

    if (facility.rows.length > 0 && facility.rows[0].image) {
      const imagePath = facility.rows[0].image;
      const fileName = path.basename(imagePath);
      const filePath = path.join(__dirname, "../../assets/cms", fileName);

      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error deleting image file:", error);
      }
    }

    await client.query("DELETE FROM cms_facility WHERE id = $1", [id]);

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
export default router;
