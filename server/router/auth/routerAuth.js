import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signin", async (req, res) => {
  const client = await pool.connect();
  try {
    const { nis, username, email, name, password } = req.body;

    const userTypes = {
      nis: "u_students",
      username: "u_teachers",
      email: "u_admin",
      name: "u_parents",
    };

    const key = Object.keys(userTypes).find((k) => req.body[k]);
    if (!key)
      return res.status(400).json({ message: "Kredensial tidak valid" });

    const data = await client.query(
      `SELECT * FROM ${userTypes[key]} WHERE ${key} = $1`,
      [req.body[key]]
    );

    if (data.rowCount === 0)
      return res.status(401).json({ message: "User tidak ditemukan" });

    const user = data.rows[0];
    if ((user.level === "admin" || user.level === "parent") && !user.isactive) {
      return res.status(400).json({ message: "Email belum terverifikasi" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
      { id: user.id, level: user.level },
      process.env.JWT,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Log the signin activity for non-parent users
    if (user.level !== "parent") {
      const logData = {
        student: user.level === "student" ? user.id : null,
        teacher: user.level === "teacher" ? user.id : null,
        admin:
          user.level === "admin" ||
          user.level === "tahfiz" ||
          user.level === "center"
            ? user.id
            : null,
        ip: req.ip,
        browser: req.headers["user-agent"],
        islogin: true,
        ispenalty: null,
        isactive: null,
        isdone: null,
        action: "login",
      };

      // Gunakan Promise untuk menjalankan logging secara asynchronous
      client
        .query(
          `INSERT INTO logs 
		(student, teacher, admin, ip, browser, islogin, ispenalty, isactive, isdone, action)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            logData.student,
            logData.teacher,
            logData.admin,
            logData.ip,
            logData.browser,
            logData.islogin,
            logData.ispenalty,
            logData.isactive,
            logData.isdone,
            logData.action,
          ]
        )
        .catch((err) => console.error("Error logging activity:", err));
    }

    // Ambil data tambahan berdasarkan level user
    let userData = { ...user };

    // Tambahkan data tambahan berdasarkan level user
    if (
      user.level === "admin" ||
      user.level === "center" ||
      user.level === "tahfiz"
    ) {
      const adminData = await client.query(
        `SELECT u_admin.id, u_admin.name, u_admin.email,
					u_admin.activation, a_homebase.name AS homebase, 
					u_admin.isactive, u_admin.phone, u_admin.level
				FROM u_admin
				LEFT JOIN a_homebase ON a_homebase.id = u_admin.homebase
				WHERE u_admin.id = $1`,
        [user.id]
      );
      if (adminData.rowCount > 0) {
        userData = { ...userData, ...adminData.rows[0] };
      }
    } else if (user.level === "student") {
      const studentData = await client.query(
        `SELECT 
					u_students.*,
					a_homebase.name AS homebase_name,
					cl_students.id AS student_class_id,
					cl_students.periode,
					a_periode.name AS periode_name,
					a_periode.isactive AS periode_active,
					a_class.id AS class_id,
					a_class.name AS class_name,
					a_grade.id AS grade_id,
					a_grade.name AS grade_name
				FROM u_students 
				LEFT JOIN a_homebase ON u_students.homebase = a_homebase.id
				LEFT JOIN cl_students ON u_students.id = cl_students.student
				LEFT JOIN a_class ON cl_students.classid = a_class.id
				LEFT JOIN a_grade ON a_class.grade = a_grade.id
				LEFT JOIN a_periode ON cl_students.periode = a_periode.id
				WHERE u_students.id = $1`,
        [user.id]
      );
      if (studentData.rowCount > 0) {
        userData = {
          ...userData,
          homebase: studentData.rows[0].homebase_name,
          student_class_id: studentData.rows[0].student_class_id,
          periode: studentData.rows[0].periode,
          periode_name: studentData.rows[0].periode_name,
          periode_active: studentData.rows[0].periode_active,
          class_id: studentData.rows[0].class_id,
          class: studentData.rows[0].class_name,
          grade_id: studentData.rows[0].grade_id,
          grade: studentData.rows[0].grade_name,
        };
      }
    } else if (user.level === "teacher") {
      const teacherData = await client.query(
        `SELECT 
					u_teachers.*,
					a_class.name AS class_name,
					a_class.id AS class_id,
					hb.name AS homebase_name,
					COALESCE(
						json_agg(
							DISTINCT jsonb_build_object(
								'id', a_subject.id,
								'name', a_subject.name,
								'cover', a_subject.cover
							)
						) FILTER (WHERE a_subject.id IS NOT NULL),
						'[]'
					) AS subjects
				FROM u_teachers
				LEFT JOIN a_homebase hb ON u_teachers.homebase = hb.id
				LEFT JOIN a_class ON u_teachers.class = a_class.id
				LEFT JOIN at_subject ON u_teachers.id = at_subject.teacher
				LEFT JOIN a_subject ON at_subject.subject = a_subject.id
				WHERE u_teachers.id = $1
				GROUP BY 
					u_teachers.id, 
					a_class.name,
					a_class.id,
					hb.name`,
        [user.id]
      );
      if (teacherData.rowCount > 0) {
        userData = {
          ...userData,
          homebase: teacherData.rows[0].homebase_name,
          homeroom: teacherData.rows[0].homeroom,
          class: teacherData.rows[0].class_name,
          class_id: teacherData.rows[0].class_id,
          subjects: teacherData.rows[0].subjects,
        };
      }
    } else if (user.level === "parent") {
      const parentData = await client.query(
        `SELECT 
					u_parents.*,
					u_students.name AS student_name,
					u_students.nis,
					u_students.id AS student_id,
					cl_students.periode,
					a_periode.name AS periode_name,
					a_periode.isactive AS periode_active,
					a_class.id AS class_id,
					a_class.name AS class_name,
					a_grade.id AS grade_id,
					a_grade.name AS grade_name,
					a_homebase.name AS homebase_name
				FROM u_parents
				INNER JOIN u_students ON u_parents.student = u_students.id
				LEFT JOIN cl_students ON u_students.id = cl_students.student
				LEFT JOIN a_class ON cl_students.classid = a_class.id
				LEFT JOIN a_grade ON a_class.grade = a_grade.id
				LEFT JOIN a_homebase ON a_class.homebase = a_homebase.id
				LEFT JOIN a_periode ON cl_students.periode = a_periode.id
				WHERE u_parents.id = $1`,
        [user.id]
      );
      if (parentData.rowCount > 0) {
        userData = {
          ...userData,
          student: parentData.rows[0].student_name,
          nis: parentData.rows[0].nis,
          homebase: parentData.rows[0].homebase_name,
          periode: parentData.rows[0].periode,
          periode_name: parentData.rows[0].periode_name,
          periode_active: parentData.rows[0].periode_active,
          grade_id: parentData.rows[0].grade_id,
          grade: parentData.rows[0].grade_name,
          class_id: parentData.rows[0].class_id,
          class: parentData.rows[0].class_name,
        };
      }
    }

    res.status(200).json({ message: "Otentikasi Berhasil", user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get(
  "/load-user",
  authorize("admin", "student", "teacher", "parent", "center", "tahfiz", "cms"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const token = req.cookies.token;
      const { level, id } = req.user;

      if (!token) {
        return res.status(401).json({
          message: "Token tidak ditemukan, login kembali.",
        });
      }

      try {
        jwt.verify(token, process.env.JWT);
      } catch (err) {
        return res.status(401).json({
          message: "Token kadaluarsa, login kembali.",
        });
      }

      // Query untuk setiap level user
      const queries = {
        tahfiz: {
          text: `SELECT * FROM u_admin WHERE id = $1`,
          transform: (row) => row,
        },
        center: {
          text: `SELECT * FROM u_admin WHERE id = $1`,
          transform: (row) => row,
        },
        cms: {
          text: `SELECT * FROM u_admin WHERE id = $1`,
          transform: (row) => row,
        },
        admin: {
          text: `SELECT u_admin.id, u_admin.name, u_admin.email,
						u_admin.activation, a_homebase.name AS homebase, 
						u_admin.isactive, u_admin.phone, u_admin.level
					FROM u_admin
					LEFT JOIN a_homebase ON a_homebase.id = u_admin.homebase
					WHERE u_admin.id = $1`,
          transform: (row) => row,
        },
        student: {
          text: `
						WITH student_data AS (
							SELECT 
								u_students.*,
								a_homebase.name AS homebase_name
							FROM u_students 
							LEFT JOIN a_homebase ON u_students.homebase = a_homebase.id
							WHERE u_students.id = $1
						),
						class_data AS (
							SELECT 
								cl_students.id AS student_class_id,
								cl_students.periode,
								a_periode.name AS periode_name,
								a_periode.isactive AS periode_active,
								a_class.id AS class_id,
								a_class.name AS class_name,
								a_grade.id AS grade_id,
								a_grade.name AS grade_name,
								a_homebase.name AS class_homebase
							FROM cl_students
							INNER JOIN a_class ON cl_students.classid = a_class.id
							INNER JOIN a_grade ON a_class.grade = a_grade.id
							INNER JOIN a_homebase ON a_class.homebase = a_homebase.id
							INNER JOIN a_periode ON cl_students.periode = a_periode.id
							WHERE cl_students.student = $1
						)
						SELECT * FROM student_data
						LEFT JOIN class_data ON true`,
          transform: (row) => ({
            user_id: row.id,
            name: row.name,
            nis: row.nis,
            level: row.level,
            gender: row.gender,
            homebase: row.homebase_name,
            student_class_id: row.student_class_id,
            periode: row.periode,
            periode_name: row.periode_name,
            periode_active: row.periode_active,
            class_id: row.class_id,
            class: row.class_name,
            grade_id: row.grade_id,
            grade: row.grade_name,
            isactive: row.isactive,
          }),
        },
        teacher: {
          text: `
						SELECT 
							u_teachers.*,
							a_class.name AS class_name,
              a_class.id AS class_id,
							hb.name AS homebase_name,
							COALESCE(
								json_agg(
									DISTINCT jsonb_build_object(
										'id', a_subject.id,
										'name', a_subject.name,
										'cover', a_subject.cover
									)
								) FILTER (WHERE a_subject.id IS NOT NULL),
								'[]'
							) AS subjects
						FROM u_teachers
						LEFT JOIN a_homebase hb ON u_teachers.homebase = hb.id
						LEFT JOIN a_class ON u_teachers.class = a_class.id
						LEFT JOIN at_subject ON u_teachers.id = at_subject.teacher
						LEFT JOIN a_subject ON at_subject.subject = a_subject.id
						WHERE u_teachers.id = $1
						GROUP BY 
							u_teachers.id, 
              a_class.name,
							a_class.id,
							hb.name`,
          transform: (row) => ({
            id: row.id,
            nip: row.nip,
            name: row.name,
            email: row.email,
            img: row.img,
            homebase: row.homebase_name,
            homeroom: row.homeroom,
            class: row.class_name,
            class_id: row.class_id,
            phone: row.phone,
            gender: row.gender,
            level: row.level,
            subjects: row.subjects,
          }),
        },
        parent: {
          text: `
						WITH parent_data AS (
							SELECT 
								u_parents.*,
								u_students.name AS student_name,
								u_students.nis,
								u_students.id AS student_id
							FROM u_parents
							INNER JOIN u_students ON u_parents.student = u_students.id
							WHERE u_parents.id = $1
						),
						class_data AS (
							SELECT 
								cl_students.periode,
								a_periode.name AS periode_name,
								a_periode.isactive AS periode_active,
								a_class.id AS class_id,
								a_class.name AS class_name,
								a_grade.id AS grade_id,
								a_grade.name AS grade_name,
								a_homebase.name AS homebase_name
							FROM cl_students
							INNER JOIN a_class ON cl_students.classid = a_class.id
							INNER JOIN a_grade ON a_class.grade = a_grade.id
							INNER JOIN a_homebase ON a_class.homebase = a_homebase.id
							INNER JOIN a_periode ON cl_students.periode = a_periode.id
							WHERE cl_students.student = (SELECT student_id FROM parent_data)
						)
						SELECT * FROM parent_data, class_data`,
          transform: (row) => ({
            id: row.id,
            name: row.username,
            email: row.email,
            phone: row.phone,
            student: row.student_name,
            nis: row.nis,
            homebase: row.homebase_name,
            periode: row.periode,
            periode_name: row.periode_name,
            periode_active: row.periode_active,
            grade_id: row.grade_id,
            grade: row.grade_name,
            class_id: row.class_id,
            class: row.class_name,
            level: "parent",
          }),
        },
      };

      const query = queries[level];
      if (!query) {
        return res.status(403).json({
          message: "Akses tidak diizinkan untuk peran ini.",
        });
      }

      const result = await client.query(query.text, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Data tidak ditemukan.",
        });
      }

      const userData = query.transform(result.rows[0]);

      return res.status(200).json(userData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Terjadi kesalahan pada server.",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

router.post("/logout", async (req, res) => {
  const client = await pool.connect();
  try {
    // Get user information from the token
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT);
        const { id, level } = decoded;

        // Log the logout activity for non-parent users
        if (level !== "parent") {
          const logData = {
            student: level === "student" ? id : null,
            teacher: level === "teacher" ? id : null,
            admin:
              level === "admin" || level === "tahfiz" || level === "center"
                ? id
                : null,
            ip: req.ip,
            browser: req.headers["user-agent"],
            islogin: false,
            ispenalty: null,
            isactive: null,
            isdone: null,
            action: "logout",
          };

          await client.query(
            `INSERT INTO logs (student, teacher, admin, ip, browser, islogin, ispenalty, isactive, isdone, action)
						VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              logData.student,
              logData.teacher,
              logData.admin,
              logData.ip,
              logData.browser,
              logData.islogin,
              logData.ispenalty,
              logData.isactive,
              logData.isdone,
              logData.action,
            ]
          );
        }
      } catch (err) {
        // Token verification failed, but we still want to clear the cookie
        console.error("Token verification failed during logout:", err);
      }
    }

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({ message: "Berhasil keluar" });
  } catch (error) {
    console.error("Kesalahan saat logout:", error);
    return res.status(500).json({ message: "Terjadi kesalahan saat logout" });
  } finally {
    client.release();
  }
});

router.put(
  "/admin-update-profile",
  authorize("admin", "tahfiz", "cms"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.user;
      const { name, email, phone, newPassword, oldPassword } = req.body;

      const user = await client.query(`SELECT * FROM u_admin WHERE id = $1`, [
        id,
      ]);

      if (user.rowCount === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const userData = user.rows[0];

      if (oldPassword) {
        const match = await bcrypt.compare(oldPassword, userData.password);
        if (!match) {
          return res.status(401).json({ message: "Password lama salah" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

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

      return res.status(200).json({ message: "Profile berhasil diubah" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.put(
  "/teacher-update-profile",
  authorize("teacher"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.user;
      const { name, email, phone, newPassword, oldPassword } = req.body;

      const user = await client.query(
        `SELECT * FROM u_teachers WHERE id = $1`,
        [id]
      );

      if (user.rowCount === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const userData = user.rows[0];

      if (oldPassword) {
        const match = await bcrypt.compare(oldPassword, userData.password);
        if (!match) {
          return res.status(401).json({ message: "Password lama salah" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await client.query(
          `UPDATE u_teachers SET name = $1, email = $2, phone = $3, password = $4 WHERE id = $5`,
          [name, email, phone, hashedPassword, id]
        );
      } else {
        await client.query(
          `UPDATE u_teachers SET name = $1, email = $2, phone = $3 WHERE id = $4`,
          [name, email, phone, id]
        );
      }

      return res.status(200).json({ message: "Profile berhasil diubah" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

router.put(
  "/student-update-profile",
  authorize("student"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.user;
      const { name, email, phone, newPassword, oldPassword } = req.body;

      const user = await client.query(
        `SELECT * FROM u_students WHERE id = $1`,
        [id]
      );

      if (user.rowCount === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const userData = user.rows[0];

      if (oldPassword) {
        const match = await bcrypt.compare(oldPassword, userData.password);
        if (!match) {
          return res.status(401).json({ message: "Password lama salah" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await client.query(
          `UPDATE u_students SET name = $1, email = $2, phone = $3, password = $4 WHERE id = $5`,
          [name, email, phone, hashedPassword, id]
        );
      } else {
        await client.query(
          `UPDATE u_students SET name = $1, email = $2, phone = $3 WHERE id = $4`,
          [name, email, phone, id]
        );
      }

      return res.status(200).json({ message: "Profile berhasil diubah" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

export default router;
