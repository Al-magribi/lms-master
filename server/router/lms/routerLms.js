import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = Router();

router.get("/get-subjects-on-class", authorize("student"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { classid, search } = req.query;

    // Base query to get all subjects that have chapters for the specified class
    let query = `
      SELECT DISTINCT s.id, s.name, s.cover
      FROM a_subject s
      JOIN l_chapter c ON s.id = c.subject
      JOIN l_cclass cc ON c.id = cc.chapter
      WHERE cc.classid = $1
    `;

    // Add search condition if search parameter is provided
    const queryParams = [classid];
    if (search && search.trim() !== "") {
      query += ` AND LOWER(s.name) LIKE LOWER($2)`;
      queryParams.push(`%${search}%`);
    }

    // Add ordering
    query += ` ORDER BY s.name`;

    const result = await client.query(query, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// New endpoint to get subject details with chapters, content, and files
router.get("/get-subject", authorize("student", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { subjectid, classid } = req.query;
    const userLevel = req.user.level;

    // Base query to get subject details
    let query = `
      SELECT s.id, s.name, s.cover
      FROM a_subject s
      WHERE s.id = $1
    `;

    const subjectResult = await client.query(query, [subjectid]);

    if (subjectResult.rows.length === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const subject = subjectResult.rows[0];

    // Query to get chapters based on user level
    let chaptersQuery = `
      SELECT c.id, c.title, c.target, c.order_number, t.name as teacher_name
      FROM l_chapter c
      LEFT JOIN u_teachers t ON c.teacher = t.id
      WHERE c.subject = $1
    `;

    const queryParams = [subjectid];

    // If user is a student, filter chapters by class
    if (userLevel === "student" && classid) {
      chaptersQuery += ` AND c.id IN (
        SELECT cc.chapter 
        FROM l_cclass cc 
        WHERE cc.classid = $2
      )`;
      queryParams.push(classid);
    }

    chaptersQuery += ` ORDER BY c.order_number`;

    const chaptersResult = await client.query(chaptersQuery, queryParams);
    const chapters = chaptersResult.rows;

    // Get content and files for each chapter
    for (let chapter of chapters) {
      // Get classes for this chapter
      const classesQuery = `
        SELECT c.id, c.name, g.id as grade_id, g.name as grade_name
        FROM a_class c
        JOIN l_cclass cc ON c.id = cc.classid
        LEFT JOIN a_grade g ON c.grade = g.id
        WHERE cc.chapter = $1
      `;

      const classesResult = await client.query(classesQuery, [chapter.id]);
      chapter.classes = classesResult.rows;

      // Get content for this chapter
      const contentQuery = `
        SELECT id, title, target, order_number
        FROM l_content
        WHERE chapter = $1
        ORDER BY order_number
      `;

      const contentResult = await client.query(contentQuery, [chapter.id]);
      chapter.contents = contentResult.rows;

      // Get files for each content
      for (let content of chapter.contents) {
        const filesQuery = `
          SELECT id, title, file, video
          FROM l_file
          WHERE content = $1
        `;

        const filesResult = await client.query(filesQuery, [content.id]);
        content.files = filesResult.rows;
      }
    }

    // If user is admin, sort chapters by grade level (highest first)
    if (userLevel === "admin") {
      // Get all grades to determine their order
      const gradesQuery = `
        SELECT id, name
        FROM a_grade
        ORDER BY name DESC
      `;

      const gradesResult = await client.query(gradesQuery);
      const grades = gradesResult.rows;

      // Create a map of grade ID to its position in the sorted list
      const gradeOrderMap = {};
      grades.forEach((grade, index) => {
        gradeOrderMap[grade.id] = index;
      });

      // Sort chapters based on the highest grade level of their classes
      chapters.sort((a, b) => {
        // Get the highest grade level for each chapter
        const aHighestGrade =
          a.classes.length > 0
            ? Math.min(
                ...a.classes.map((c) => gradeOrderMap[c.grade_id] || 999)
              )
            : 999;

        const bHighestGrade =
          b.classes.length > 0
            ? Math.min(
                ...b.classes.map((c) => gradeOrderMap[c.grade_id] || 999)
              )
            : 999;

        // Sort by grade level (highest first)
        return aHighestGrade - bHighestGrade;
      });
    }

    // Add chapters to subject
    subject.chapters = chapters;

    res.status(200).json(subject);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

export default router;
