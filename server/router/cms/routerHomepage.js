import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import multer from "multer";
import path from "path";

const create = "Berhasil disimpan";
const update = "berhasil diperbarui";
const remove = "Berhasil dihapus";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets/cms");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(
        new Error("Format file tidak didukung. Gunakan JPG, PNG, atau GIF"),
        false
      );
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

const uploadFields = uploadImage.fields([
  { name: "icon", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

const router = express.Router();

router.put(
  "/update-homepage",
  authorize("cms"),
  uploadFields,
  async (req, res) => {
    const client = await pool.connect();

    try {
      // Validate required fields
      const requiredFields = ["name", "tagline", "description"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Field berikut wajib diisi: ${missingFields.join(", ")}`,
          data: null,
        });
      }

      const {
        name,
        tagline,
        description,
        video_url,
        youtube,
        instagram,
        facebook,
        ppdb_url,
        address,
        title_reason,
        desc_reason,
        title_facility,
        desc_facility,
        primary_color,
        secondary_color,
      } = req.body;

      // Handle image paths
      let iconPath = req.body.icon; // Default to existing icon path
      let logoPath = req.body.logo; // Default to existing logo path
      let bannerPath = req.body.banner; // Default to existing banner path

      // Update paths if new files were uploaded
      if (req.files) {
        if (req.files.icon) {
          iconPath = "/assets/cms/" + req.files.icon[0].filename;
        }
        if (req.files.logo) {
          logoPath = "/assets/cms/" + req.files.logo[0].filename;
        }
        if (req.files.banner) {
          bannerPath = "/assets/cms/" + req.files.banner[0].filename;
        }
      }

      const query = `
        UPDATE cms_homepage 
        SET 
          name = $1,
          tagline = $2,
          description = $3,
          video_url = $4,
          youtube = $5,
          instagram = $6,
          facebook = $7,
          ppdb_url = $8,
          icon = $9,
          logo = $10,
          banner = $11,
          address = $12,
          title_reason = $13,
          desc_reason = $14,
          title_facility = $15,
          desc_facility = $16,
          primary_color = $17,
          secondary_color = $18
        WHERE id = 1
        RETURNING *
      `;

      const values = [
        name,
        tagline,
        description,
        video_url,
        youtube,
        instagram,
        facebook,
        ppdb_url,
        iconPath,
        logoPath,
        bannerPath,
        address,
        title_reason,
        desc_reason,
        title_facility,
        desc_facility,
        primary_color,
        secondary_color,
      ];

      const result = await client.query(query, values);

      res.status(200).json({
        success: true,
        message: "Data berhasil diperbarui",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error in homepage update:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat memperbarui data",
        error: error.message,
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

router.get("/get-data", async (req, res) => {
  let client;
  try {
    // Get client with retry mechanism
    let retries = 3;
    while (retries > 0) {
      try {
        client = await pool.connect();
        // Set connection parameters
        await client.query("SET statement_timeout = 30000");
        await client.query("SET lock_timeout = 10000");
        await client.query("SET idle_in_transaction_session_timeout = 30000");
        await client.query("SET search_path TO public");
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        console.log(
          `[get-data] Connection attempt failed, retrying... (${retries} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // First check if table exists

    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cms_homepage'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("[get-data] Table not found");
      return res.status(404).json({
        success: false,
        message: "Table cms_homepage tidak ditemukan",
        data: null,
      });
    }

    // Prepare the statement
    const statement = {
      name: "get_homepage",
      text: `
        SELECT 
          id,
          name,
          tagline,
          description,
          video_url,
          youtube,
          instagram,
          facebook,
          ppdb_url,
          logo,
          address,
          title_reason,
          desc_reason,
          title_facility,
          desc_facility,
          primary_color,
          secondary_color,
          createdat,
          icon,
          banner
        FROM cms_homepage
        WHERE id = $1
      `,
      values: [1],
    };

    let data;
    try {
      // First try with prepared statement
      data = await client.query(statement);
    } catch (queryError) {
      console.log("[get-data] Prepared statement failed, trying direct query");
      // If prepared statement fails, try direct query
      data = await client.query(`
        SELECT *
        FROM cms_homepage
        WHERE id = 1
      `);
    }

    if (!data.rows.length) {
      console.log("[get-data] No data found");
      return res.status(404).json({
        success: false,
        message: "Data homepage tidak ditemukan",
        data: null,
      });
    }

    res.status(200).json(data.rows[0]);
  } catch (error) {
    console.error("[get-data] Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
      query: error.query,
    });

    // Handle specific timeout errors
    if (
      error.code === "57014" ||
      error.message.includes("timeout") ||
      error.message.includes("read timeout")
    ) {
      console.error("[get-data] Timeout error occurred");
      res.status(504).json({
        success: false,
        message: "Waktu tunggu query habis. Silakan coba lagi.",
        data: null,
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error("[get-data] Error releasing client:", releaseError);
      }
    }
  }
});

export default router;
