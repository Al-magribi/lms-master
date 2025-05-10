import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets");
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

const uploadImage = multer({ storage: imageStorage });

const router = express.Router();

router.get("/get-app", async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows: app } = await client.query("SELECT * FROM app_config");

    res.status(200).json(app[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-app-data", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.user;

    const { rows: admin } = await client.query(
      "SELECT * FROM u_admin WHERE id = $1",
      [id]
    );

    const { rows: app } = await client.query("SELECT * FROM app_config");

    const data = {
      admin: admin[0],
      app: app[0],
    };

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.put(
  "/update-app",
  authorize("center"),
  uploadImage.single("logo"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id, app_name } = req.body;

      // Get the current app data to preserve the logo if no new file is uploaded
      const { rows: currentApp } = await client.query(
        "SELECT logo FROM app_config WHERE id = $1",
        [id]
      );

      // If a new file was uploaded, use its filename, otherwise keep the existing logo
      const logo = req.file
        ? `/assets/${req.file.filename}`
        : currentApp[0].logo;

      // If a new file was uploaded, delete the old logo file
      if (req.file && currentApp[0].logo) {
        // Extract filename from the stored path
        const oldFileName = currentApp[0].logo.split("/").pop();
        const oldLogoPath = path.join(
          process.cwd(),
          "server",
          "assets",
          oldFileName
        );

        console.log("Attempting to delete old logo:", oldLogoPath);

        // Check if the file exists before trying to delete it
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
          console.log("Old logo file deleted successfully");
        } else {
          console.log("Old logo file not found at:", oldLogoPath);
        }
      }

      await client.query(
        `UPDATE app_config SET app_name = $1, logo = $2 WHERE id = $3`,
        [app_name, logo, id]
      );

      res.status(200).json({ message: "Berhasil diperbarui" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.put("/update-smtp", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { smtp_host, smtp_port, smtp_email, smtp_password, smtp_domain } =
      req.body;
    const { rows: app } = await client.query("SELECT * FROM app_config");

    await client.query(
      `UPDATE app_config 
            SET smtp_host = $1, 
            smtp_port = $2, 
            smtp_email = $3, 
            smtp_password = $4,
            smtp_domain = $5
            WHERE id = $6`,
      [smtp_host, smtp_port, smtp_email, smtp_password, smtp_domain, app[0].id]
    );

    res.status(200).json({ message: "Berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.put("/update-profile", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.user;
    const { name, email, phone, old_password, new_password } = req.body;

    if (new_password && old_password) {
      const { rows: admin } = await client.query(
        "SELECT * FROM u_admin WHERE id = $1",
        [id]
      );

      const isPasswordCorrect = await bcrypt.compare(
        old_password,
        admin[0].password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Password lama salah" });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);

      await client.query(
        `UPDATE u_admin SET name = $1, email = $2, phone = $3, password = $4 WHERE id = $5`,
        [name, email, phone, hashedPassword, id]
      );
    } else {
      await client.query(
        `UPDATE u_admin SET name = $1, email = $2, phone = $3 WHERE id = $4`,
        [name, email, phone, id]
      );
    }

    res.status(200).json({ message: "Berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
