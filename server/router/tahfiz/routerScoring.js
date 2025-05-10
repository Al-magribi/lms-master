import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const create = "Berhasil disimpan";
const update = "Berhasil diubah";
const remove = "Berhasil dihapus";

const router = express.Router();

// =================================
// Endpoint Target
// =================================
router.get("/get-grades", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const homebase = req.user.homebase;

    if (homebase) {
      const { rows } = await client.query(
        "SELECT * FROM a_grade WHERE homebase = $1",
        [homebase]
      );

      res.status(200).json(rows);
    } else {
      const { rows } = await client.query("SELECT * FROM a_grade");
      res.status(200).json(rows);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/add-target", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, gradeId, juzId } = req.body;

    if (id) {
      await client.query(
        "UPDATE t_target SET grade_id = $1, juz_id = $2 WHERE id = $3",
        [gradeId, juzId, id]
      );
    } else {
      await client.query(
        "INSERT INTO t_target (grade_id, juz_id) VALUES ($1, $2) RETURNING *",
        [gradeId, juzId]
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

router.get("/get-targets", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    // Fetch all target data sorted by grade and juz name
    const targetData = await client.query(
      `SELECT t_target.*,
          t_juz.name AS juz_name, 
          a_grade.name AS grade_name
      FROM t_target 
        LEFT JOIN t_juz ON t_juz.id = t_target.juz_id
        LEFT JOIN a_grade ON a_grade.id = t_target.grade_id
        ORDER BY a_grade.name::INTEGER ASC, t_juz.name DESC`
    );

    // Fetch total ayat and total lines for each juz
    const responseData = await Promise.all(
      targetData.rows.map(async (target) => {
        const ayatData = await client.query(
          `SELECT 
          COALESCE(SUM(to_ayat), 0) AS total_ayat,
          COALESCE(SUM(lines), 0) AS total_line
        FROM t_juzitems
        WHERE juz_id = $1`,
          [target.juz_id]
        );

        return {
          grade: target.grade_name,
          juz: target.juz_name,
          total_ayat: parseInt(ayatData.rows[0].total_ayat, 10),
          total_line: parseInt(ayatData.rows[0].total_line, 10),
          id: target.id,
        };
      })
    );

    // Group data by grade and calculate total_ayat & total_line per grade
    const groupedData = responseData.reduce((acc, target) => {
      let gradeEntry = acc.find((entry) => entry.grade === target.grade);
      if (!gradeEntry) {
        gradeEntry = {
          grade: target.grade,
          target: [],
          total_ayat: 0,
          total_line: 0,
        };
        acc.push(gradeEntry);
      }

      // Add juz data
      gradeEntry.target.push({
        target_id: target.id,
        juz: target.juz,
        total_ayat: target.total_ayat,
        total_line: target.total_line,
        id: target.id,
      });

      // Sum total ayat and total line for the grade
      gradeEntry.total_ayat += target.total_ayat;
      gradeEntry.total_line += target.total_line;

      return acc;
    }, []);

    res.status(200).json(groupedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.delete("/delete-target", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.query;

    // Check if target exists
    const targetExists = await client.query(
      `SELECT * FROM t_target WHERE id = $1`,
      [id]
    );

    if (targetExists.rows.length === 0) {
      return res.status(404).json({ message: "Target tidak ditemukan" });
    }

    // Delete the target
    await client.query("DELETE FROM t_target WHERE id = $1", [id]);

    res.status(200).json({ message: remove });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// =================================
// Endpoint Hafalan
// =================================
router.get("/get-filter", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const homebase = req.user.homebase;

    if (homebase) {
      const dataGrade = await client.query(
        "SELECT * FROM a_grade WHERE homebase = $1",
        [homebase]
      );

      const dataClass = await client.query(
        "SELECT * FROM a_class WHERE homebase = $1",
        [homebase]
      );

      res.status(200).json({
        grades: dataGrade.rows,
        classes: dataClass.rows,
      });
    } else {
      const homeData = await client.query(`SELECT * FROM a_homebase`);
      const dataGrade = await client.query("SELECT * FROM a_grade");
      const dataClass = await client.query("SELECT * FROM a_class");

      res.status(200).json({
        homebases: homeData.rows,
        grades: dataGrade.rows,
        classes: dataClass.rows,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get(
  "/get-categories",
  authorize("tahfiz", "student", "parent"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      // Query untuk mendapatkan kategori, ID, dan indikator terkait
      const query = `
				SELECT 
					c.id AS category_id,
					c.name, 
					json_agg(
						CASE
							WHEN i.id IS NOT NULL THEN
							json_build_object(
								'id', i.id,
								'name', i.name,
								'category_id', c.id
							)
							ELSE NULL
						END
						ORDER BY i.name ASC
					) AS indicators
				FROM t_categories c
				LEFT JOIN t_indicators i ON c.id = i.category_id
				GROUP BY c.id, c.name
				ORDER BY c.id
			`;

      const result = await client.query(query);

      // Struktur data sesuai kebutuhan
      const categories = result.rows.map((row) => ({
        id: row.category_id,
        name: row.name,
        indicators: row.indicators || [],
      }));

      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.get("/get-students", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search, homebaseId, gradeId, classId } = req.query;
    const offset = (page - 1) * limit;
    const userHomebase = req.user.homebase;

    let query = `
			SELECT 
				us.nis,
				us.id as userid,
				us.name,
				ag.name as grade,
				ac.name as class,
				ah.name as homebase,
				ap.id as periode_id
			FROM cl_students cs
			JOIN u_students us ON cs.student = us.id
			JOIN a_class ac ON cs.classid = ac.id
			JOIN a_grade ag ON ac.grade = ag.id
			JOIN a_homebase ah ON us.homebase = ah.id
			JOIN a_periode ap ON cs.periode = ap.id
			WHERE ap.isactive = true
		`;

    const params = [];

    // Filter berdasarkan homebase user atau homebaseId yang dipilih
    if (userHomebase) {
      query += ` AND us.homebase = $${params.length + 1}`;
      params.push(userHomebase);
    } else if (homebaseId) {
      query += ` AND us.homebase = $${params.length + 1}`;
      params.push(homebaseId);
    }

    // Filter berdasarkan grade
    if (gradeId) {
      query += ` AND ac.grade = $${params.length + 1}`;
      params.push(gradeId);
    }

    // Filter berdasarkan class
    if (classId) {
      query += ` AND cs.classid = $${params.length + 1}`;
      params.push(classId);
    }

    if (search) {
      query += ` AND (
				us.name ILIKE $${params.length + 1} 
				OR us.nis ILIKE $${params.length + 1}
				OR ah.name ILIKE $${params.length + 1}
			)`;
      params.push(`%${search}%`);
    }

    query += `
			ORDER BY 
				ah.name ASC,
				CAST(ag.name AS INTEGER) DESC,
				ac.name ASC,
				cs.student_name ASC
			LIMIT $${params.length + 1} 
			OFFSET $${params.length + 2}
		`;
    params.push(limit, offset);

    const { rows } = await client.query(query, params);

    // Get total count for pagination
    let countQuery = `
			SELECT COUNT(*) as total
			FROM cl_students cs
			JOIN u_students us ON cs.student = us.id
			JOIN a_class ac ON cs.classid = ac.id
			JOIN a_grade ag ON ac.grade = ag.id
			JOIN a_homebase ah ON us.homebase = ah.id
			JOIN a_periode ap ON cs.periode = ap.id
			WHERE ap.isactive = true
		`;
    const countParams = [];

    // Filter berdasarkan homebase user atau homebaseId yang dipilih
    if (userHomebase) {
      countQuery += ` AND us.homebase = $${countParams.length + 1}`;
      countParams.push(userHomebase);
    } else if (homebaseId) {
      countQuery += ` AND us.homebase = $${countParams.length + 1}`;
      countParams.push(homebaseId);
    }

    // Filter berdasarkan grade
    if (gradeId) {
      countQuery += ` AND ac.grade = $${countParams.length + 1}`;
      countParams.push(gradeId);
    }

    // Filter berdasarkan class
    if (classId) {
      countQuery += ` AND cs.classid = $${countParams.length + 1}`;
      countParams.push(classId);
    }

    if (search) {
      countQuery += ` AND (
				us.name ILIKE $${countParams.length + 1} 
				OR us.nis ILIKE $${countParams.length + 1}
				OR ah.name ILIKE $${countParams.length + 1}
			)`;
      countParams.push(`%${search}%`);
    }

    const { rows: countRows } = await client.query(countQuery, countParams);

    res.status(200).json({
      students: rows,
      totalData: parseInt(countRows[0].total),
      totalPages: Math.ceil(parseInt(countRows[0].total) / parseInt(limit)),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.post("/add-score", authorize("tahfiz"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { userid, periodeId, poin, examiner, surahs } = req.body;

    // Validasi input
    if (
      !userid ||
      !poin ||
      !poin.type_id ||
      !poin.categories ||
      !Array.isArray(surahs)
    ) {
      return res.status(400).json({ error: "Isikan data dengan lengkap" });
    }

    await client.query("BEGIN");

    // Check existing data for each surah before insertion
    for (const surah of surahs) {
      const { fromSurah, fromAyat, toAyat, fromLine, toLine, juzId } = surah;
      if (!fromSurah || !fromAyat || !toAyat) {
        throw new Error("Data surah tidak lengkap");
      }

      // Check for existing data with the same surah_id only for type_id 6 (Harian)
      if (poin.type_id === 6) {
        const existingData = await client.query(
          `SELECT from_count, to_count, from_line, to_line, juz_id
          FROM t_process
          WHERE userid = $1 AND periode_id = $2 AND surah_id = $3 AND type_id = 6
          ORDER BY createdat DESC
          LIMIT 1`,
          [userid, periodeId, fromSurah]
        );

        if (existingData.rows.length > 0) {
          const lastData = existingData.rows[0];

          // Check if juzId from request matches juz_id from database
          if (juzId === lastData.juz_id) {
            // Validasi ayat
            if (fromAyat <= lastData.to_count) {
              throw new Error(
                "Dari ayat tidak boleh lebih kecil atau sama dengan ayat terakhir sebelumnya untuk Juz yang sama"
              );
            }

            // Validasi baris
            if (fromLine <= lastData.to_line) {
              throw new Error(
                "Dari baris tidak boleh lebih kecil atau sama dengan baris terakhir sebelumnya untuk Juz yang sama"
              );
            }
          }
        }
      }

      await client.query(
        `INSERT INTO t_process 
        (userid, periode_id, surah_id, from_count, to_count, type_id, juz_id, from_line, to_line, createdat)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [
          userid,
          periodeId,
          fromSurah,
          fromAyat,
          toAyat,
          poin.type_id,
          juzId,
          fromLine,
          toLine,
        ]
      );
    }

    // Masukkan data ke tabel t_scoring
    for (const category of poin.categories) {
      const { category_id, poin: categoryPoin, indicators } = category;
      if (!category_id || categoryPoin === undefined) {
        throw new Error("Data kategori tidak lengkap");
      }

      // Insert data kategori
      const categoryInsertQuery = `
				INSERT INTO t_scoring 
				(userid, periode_id, examiner_id, type_id, category_id, poin, createdat)
				VALUES ($1, $2, $3, $4, $5, $6, NOW())
				RETURNING id
			`;
      const categoryResult = await client.query(categoryInsertQuery, [
        userid,
        periodeId,
        examiner,
        poin.type_id,
        category_id,
        categoryPoin,
      ]);

      // Masukkan data indikator jika ada
      if (indicators && Array.isArray(indicators)) {
        for (const indicator of indicators) {
          const { indicator_id, poin: indicatorPoin } = indicator;
          if (!indicator_id || indicatorPoin === undefined) {
            throw new Error("Data indikator tidak lengkap");
          }

          const indicatorInsertQuery = `
						INSERT INTO t_scoring 
						(userid, periode_id, examiner_id, type_id, category_id, indicator_id, poin)
						VALUES ($1, $2, $3, $4, $5, $6, $7)
					`;
          await client.query(indicatorInsertQuery, [
            userid,
            periodeId,
            examiner,
            poin.type_id,
            category_id,
            indicator_id,
            indicatorPoin,
          ]);
        }
      }
    }

    await client.query("COMMIT");
    res.status(200).json({ message: create });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
