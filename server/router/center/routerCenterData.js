import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = Router();

router.get("/get-teachers-data", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;

    const count = await client.query(
      "SELECT COUNT(*) FROM u_teachers WHERE name ILIKE $1",
      [`%${search}%`]
    );

    const data = await client.query(
      `SELECT u_teachers.*, a_homebase.name AS homebase
        FROM u_teachers
      LEFT JOIN a_homebase ON a_homebase.id = u_teachers.homebase
      WHERE u_teachers.name ILIKE $1
      ORDER BY u_teachers.name ASC
      LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const totalPages = Math.ceil(count.rows[0].count / limit);
    const totalData = count.rows[0].count;

    res.status(200).json({
      results: data.rows,
      totalPages,
      totalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.get("/get-students-data", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;

    const count = await client.query(
      "SELECT COUNT(*) FROM u_students WHERE name ILIKE $1",
      [`%${search}%`]
    );

    const data = await client.query(
      `SELECT u_students.*, a_homebase.name AS homebase,
      a_periode.name AS periode
        FROM u_students
      LEFT JOIN a_homebase ON a_homebase.id = u_students.homebase
      LEFT JOIN a_periode ON a_periode.id = u_students.entry
      WHERE u_students.name ILIKE $1
      ORDER BY u_students.name ASC
      LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const totalPages = Math.ceil(count.rows[0].count / limit);
    const totalData = count.rows[0].count;

    res.status(200).json({
      results: data.rows,
      totalPages,
      totalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ... existing code ...

router.get("/get-family-data", authorize("center"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { page, limit, search, family_age, family_gender } = req.query;
    const offset = (page - 1) * limit;

    let ageCondition =
      "AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.birth_date))::integer BETWEEN 10 AND 15";
    if (family_age) {
      ageCondition = `AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.birth_date))::integer = $2`;
    }

    let genderCondition = "";
    if (family_gender) {
      genderCondition = `AND f.gender = $${family_age ? "3" : "2"}`;
    }

    const countQuery = `
      SELECT COUNT(*)
      FROM db_family f
      LEFT JOIN u_students s ON s.id = f.userid
      WHERE (s.name ILIKE $1 OR f.name ILIKE $1)
      ${ageCondition}
      ${genderCondition}
    `;

    const countParams = [];
    countParams.push(`%${search}%`);
    if (family_age) countParams.push(family_age);
    if (family_gender) countParams.push(family_gender);

    const count = await client.query(countQuery, countParams);

    const dataQuery = `
      SELECT 
        s.id as student_id,
        s.name as student_name,
        s.nis,
        f.id as family_id,
        f.name as family_name,
        f.gender as family_gender,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.birth_date))::integer as family_age,
        st.father_phone,
        st.mother_phone,
        st.father_name,
        st.mother_name
      FROM db_family f
      LEFT JOIN u_students s ON s.id = f.userid
      LEFT JOIN db_student st ON st.userid = s.id
      WHERE (s.name ILIKE $1 OR f.name ILIKE $1)
      ${ageCondition}
      ${genderCondition}
      ORDER BY s.name ASC, f.name ASC
      LIMIT $${countParams.length + 1} OFFSET $${countParams.length + 2}
    `;

    const dataParams = [...countParams, limit, offset];
    const data = await client.query(dataQuery, dataParams);

    const totalPages = Math.ceil(count.rows[0].count / limit);
    const totalData = count.rows[0].count;

    res.status(200).json({
      results: data.rows,
      totalPages,
      totalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ... existing code ...

export default router;

const result = [
  {
    student_id: "Id siswa dari u_students",
    student_name: "Nama siswa dari u_students",
    family_id: "Id keluarga dari db_family",
    family_name: "Nama keluarga dari db_family",
    family_age: "Umur keluarga dari db_family",
    father_phone: "No HP Ayah dari db_student",
    mother_phone: "No HP Ibu dari db_student",
    father_name: "Nama Ayah dari db_student",
    mother_name: "Nama Ibu dari db_student",
  },
];
