import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";
import multer from "multer";
import path from "path";
import geoip from "geoip-lite";

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/cms/news");
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

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/cms/news");
  },

  filename: (req, file, cb) => {
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
const uploadAudio = multer({ storage: audioStorage });

const router = Router();

router.get("/get-news", async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;

    const count = await client.query(
      `SELECT COUNT(*) FROM cms_news
   WHERE title ILIKE $1`,
      [`%${search}%`]
    );

    const news = await client.query(
      `SELECT cms_news.*, cms_category.name as category_name 
      FROM cms_news 
      JOIN cms_category ON cms_news.category_id = cms_category.id 
      ORDER BY createdat DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      result: news.rows,
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

router.get("/get-news/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const news = await client.query(
      `SELECT cms_news.*, cms_category.name as category_name 
      FROM cms_news 
      JOIN cms_category ON cms_news.category_id = cms_category.id 
      WHERE cms_news.id = $1`,
      [id]
    );

    if (news.rows.length === 0) {
      return res.status(404).json({ message: "News not found" });
    }

    res.json(news.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post(
  "/add-news",
  authorize("cms"),
  upload.single("image"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id, category, title, content } = req.body;

      // Validate required fields
      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "Judul dan isi berita harus diisi" });
      }

      let image = null;
      if (req.file) {
        image = "/assets/cms/news/" + req.file.filename;
      }

      if (id) {
        // Update existing news
        const existingNews = await client.query(
          "SELECT * FROM cms_news WHERE id = $1",
          [id]
        );

        if (existingNews.rows.length === 0) {
          return res.status(404).json({ message: "Berita tidak ditemukan" });
        }

        // Keep existing image if no new image uploaded
        if (!image) {
          image = existingNews.rows[0].image;
        }

        await client.query(
          `UPDATE cms_news 
          SET category_id = $1, title = $2, image = $3, content = $4
          WHERE id = $5`,
          [category, title, image, content, id]
        );
      } else {
        // Create new news
        if (!image) {
          return res.status(400).json({ message: "Gambar berita harus diisi" });
        }

        await client.query(
          `INSERT INTO cms_news (category_id, title, image, content) 
          VALUES ($1, $2, $3, $4)`,
          [category, title, image, content]
        );
      }

      res.json({ message: id ? update : create });
    } catch (error) {
      console.error("Error in add-news:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  }
);

router.delete("/delete-news", authorize("cms"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    await client.query("DELETE FROM cms_news WHERE id = $1", [id]);

    res.json({ message: remove });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Upload image editor
router.post("/upload/image", upload.single("file"), (req, res) => {
  try {
    const imageLink = "/assets/cms/news/" + req.file.filename;

    res.status(200).json({ url: imageLink });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.post("/upload/audio", uploadAudio.single("file"), (req, res) => {
  try {
    const audioLink = "/assets/cms/news/" + req.file.filename;

    res.status(200).json({ url: audioLink });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

// Add visitor tracking endpoint
router.post("/track-visitor", async (req, res) => {
  const client = await pool.connect();
  try {
    const { pageType, contentId } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Get country from IP using geoip-lite
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : "Unknown";

    // Check if this IP has already visited today
    const existingVisit = await client.query(
      `SELECT id FROM cms_visitors 
       WHERE ip_address = $1 
       AND page_type = $2 
       AND visit_date = CURRENT_DATE
       AND (content_id = $3 OR ($3 IS NULL AND content_id IS NULL))`,
      [ip, pageType, contentId]
    );

    if (existingVisit.rows.length === 0) {
      // Insert new visit
      await client.query(
        `INSERT INTO cms_visitors (ip_address, country, page_type, content_id)
         VALUES ($1, $2, $3, $4)`,
        [ip, country, pageType, contentId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
});

export default router;
