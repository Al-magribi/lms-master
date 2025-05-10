import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = express.Router();

// ======================================
// Admin Dashboard
// ======================================
router.get("/admin-stats", authorize("admin"), async (req, res) => {
  try {
    const homebaseId = req.user.homebase;

    // Basic counts
    const basicStats = await pool.query(
      `
            SELECT 
                (SELECT COUNT(*) FROM u_students WHERE homebase = $1) as total_students,
                (SELECT COUNT(*) FROM u_teachers WHERE homebase = $1) as total_teachers,
                (SELECT COUNT(*) FROM a_class WHERE homebase = $1) as total_classes,
                (SELECT COUNT(*) FROM c_exam WHERE homebase = $1) as total_exams,
                (SELECT COUNT(*) FROM a_subject WHERE homebase = $1) as total_subjects,
                (SELECT COUNT(*) FROM c_bank WHERE homebase = $1) as total_banks,
                (SELECT COUNT(*) FROM l_chapter WHERE subject IN (SELECT id FROM a_subject WHERE homebase = $1)) as total_chapters,
                (SELECT COUNT(*) FROM l_content WHERE chapter IN (SELECT id FROM l_chapter WHERE subject IN (SELECT id FROM a_subject WHERE homebase = $1))) as total_learning_materials
        `,
      [homebaseId]
    );

    // Students per grade with gender composition
    const studentsPerGrade = await pool.query(
      `
            SELECT 
                g.name as grade_name,
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN s.id END) as male_count,
                COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN s.id END) as female_count
            FROM a_grade g
            LEFT JOIN a_class c ON c.grade = g.id
            LEFT JOIN cl_students s ON s.classid = c.id
            LEFT JOIN u_students us ON us.id = s.student
            WHERE g.homebase = $1
            GROUP BY g.id, g.name
            ORDER BY g.name
        `,
      [homebaseId]
    );

    // Students per class with gender composition
    const studentsPerClass = await pool.query(
      `
            SELECT 
                c.name as class_name,
                g.name as grade_name,
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN s.id END) as male_count,
                COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN s.id END) as female_count
            FROM a_class c
            LEFT JOIN a_grade g ON c.grade = g.id
            LEFT JOIN cl_students s ON s.classid = c.id
            LEFT JOIN u_students us ON us.id = s.student
            WHERE c.homebase = $1
            GROUP BY c.id, c.name, g.name
            ORDER BY g.name, c.name
        `,
      [homebaseId]
    );

    // Teacher composition by gender and homeroom status
    const teacherComposition = await pool.query(
      `
            SELECT 
                COUNT(*) as total_teachers,
                COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
                COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count,
                COUNT(CASE WHEN homeroom = true THEN 1 END) as homeroom_count
            FROM u_teachers
            WHERE homebase = $1
        `,
      [homebaseId]
    );

    // Activity logs
    const activityLogs = await pool.query(
      `
            SELECT 
                l.id,
                l.action,
                l.createdat,
                l.islogin,
                l.ispenalty,
                l.isactive,
                l.isdone,
                l.ip,
                SUBSTRING(l.browser FROM '^[^/]+') as browser_name,
                SUBSTRING(l.browser FROM '/([^ ]+)') as browser_version,
                COALESCE(s.name, t.name, a.name) as user_name,
                CASE 
                    WHEN l.student IS NOT NULL THEN 'Siswa'
                    WHEN l.teacher IS NOT NULL THEN 'Guru'
                    WHEN l.admin IS NOT NULL THEN 'Admin'
                    ELSE 'Unknown'
                END as user_type
            FROM logs l
            LEFT JOIN u_students s ON l.student = s.id
            LEFT JOIN u_teachers t ON l.teacher = t.id
            LEFT JOIN u_admin a ON l.admin = a.id
            WHERE (l.student IN (SELECT id FROM u_students WHERE homebase = $1) OR
                  l.teacher IN (SELECT id FROM u_teachers WHERE homebase = $1) OR
                  l.admin IN (SELECT id FROM u_admin WHERE homebase = $1))
            ORDER BY l.createdat DESC
            LIMIT 10
        `,
      [homebaseId]
    );

    // Recent activities (last 7 days)
    const recentActivities = await pool.query(
      `
            SELECT 
                'exam' as type,
                e.name as title,
                t.name as teacher_name,
                e.createdat
            FROM c_exam e
            JOIN u_teachers t ON e.teacher = t.id
            WHERE e.homebase = $1 AND e.createdat >= NOW() - INTERVAL '7 days'
            UNION ALL
            SELECT 
                'subject' as type,
                s.name as title,
                t.name as teacher_name,
                s.createdat
            FROM a_subject s
            JOIN at_subject ats ON ats.subject = s.id
            JOIN u_teachers t ON ats.teacher = t.id
            WHERE s.homebase = $1 AND s.createdat >= NOW() - INTERVAL '7 days'
            UNION ALL
            SELECT 
                'chapter' as type,
                ch.title as title,
                t.name as teacher_name,
                ch.createdat
            FROM l_chapter ch
            JOIN u_teachers t ON ch.teacher = t.id
            JOIN a_subject s ON ch.subject = s.id
            WHERE s.homebase = $1 AND ch.createdat >= NOW() - INTERVAL '7 days'
            ORDER BY createdat DESC
            LIMIT 10
        `,
      [homebaseId]
    );

    // Exam statistics
    const examStats = await pool.query(
      `
            SELECT 
                COUNT(*) as total_exams,
                COUNT(CASE WHEN e.isactive = true THEN 1 END) as active_exams,
                COUNT(DISTINCT e.teacher) as teacher_count,
                COUNT(DISTINCT c.classid) as class_count,
                COUNT(DISTINCT cb.subject) as subject_count
            FROM c_exam e
            LEFT JOIN c_class c ON c.exam = e.id
            LEFT JOIN c_ebank eb ON eb.exam = e.id
            LEFT JOIN c_bank cb ON cb.id = eb.bank
            WHERE e.homebase = $1
        `,
      [homebaseId]
    );

    // Learning material statistics
    const learningStats = await pool.query(
      `
            SELECT 
                COUNT(DISTINCT ch.id) as total_chapters,
                COUNT(DISTINCT co.id) as total_contents,
                COUNT(DISTINCT f.id) as total_files,
                COUNT(DISTINCT ch.teacher) as teacher_count
            FROM l_chapter ch
            LEFT JOIN l_content co ON co.chapter = ch.id
            LEFT JOIN l_file f ON f.content = co.id
            WHERE ch.createdat >= (
              SELECT createdat 
              FROM l_chapter 
              ORDER BY createdat DESC 
              LIMIT 1 OFFSET 9
            )
        `,
      []
    );

    // Student demographic data untuk admin (filter by homebaseid, ignore null birth_date)
    const studentDemographics = await pool.query(
      `
      WITH valid_students AS (
        SELECT
          id,
          gender,
          birth_date,
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::integer as age
        FROM db_student
        WHERE birth_date IS NOT NULL AND homebaseid = $1
      ),
      age_stats AS (
        SELECT
          MIN(age) as min_age,
          MAX(age) as max_age,
          COUNT(*) as total_students,
          COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
          COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count
        FROM valid_students
      ),
      -- Create dynamic age ranges based on actual data (filtered by homebase)
      age_ranges AS (
        SELECT
          CASE 
            WHEN age < (SELECT MIN(age) + 2 FROM valid_students)
              THEN concat('<', (SELECT MIN(age) + 2 FROM valid_students))
            WHEN age >= (SELECT MAX(age) - 1 FROM valid_students)
              THEN concat('>', (SELECT MAX(age) - 2 FROM valid_students))
            ELSE concat(
              FLOOR(age/2) * 2, '-', 
              FLOOR(age/2) * 2 + 1
            )
          END as age_group,
          CASE 
            WHEN age < (SELECT MIN(age) + 2 FROM valid_students) THEN 1
            WHEN age >= (SELECT MAX(age) - 1 FROM valid_students) THEN 999
            ELSE FLOOR(age/2) * 2
          END as sort_order,
          id,
          gender,
          age
        FROM valid_students
      ),
      age_distribution_calc AS (
        SELECT
          age_group,
          sort_order,
          COUNT(*) as count
        FROM age_ranges
        GROUP BY age_group, sort_order
        ORDER BY sort_order
      )
      SELECT
        COALESCE((SELECT total_students FROM age_stats), 0) as total_students,
        COALESCE((SELECT male_count FROM age_stats), 0) as male_count,
        COALESCE((SELECT female_count FROM age_stats), 0) as female_count,
        COALESCE((SELECT min_age FROM age_stats), 0) as min_age,
        COALESCE((SELECT max_age FROM age_stats), 0) as max_age,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'age_group', age_group,
            'count', count
          ) ORDER BY sort_order)
           FROM age_distribution_calc),
          '[]'::json
        ) as age_distribution;
    `,
      [homebaseId]
    );

    // Geographical distribution of students
    const geographicalDistribution = await pool.query(
      `
      WITH province_stats AS (
        SELECT 
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_province p ON ds.provinceid = p.id
        WHERE ds.homebaseid = $1
        GROUP BY p.id, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      city_stats AS (
        SELECT 
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_city c ON ds.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        WHERE ds.homebaseid = $1
        GROUP BY c.id, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      district_stats AS (
        SELECT 
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_district d ON ds.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        WHERE ds.homebaseid = $1
        GROUP BY d.id, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      village_stats AS (
        SELECT 
          v.name as village_name,
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_village v ON ds.villageid = v.id
        JOIN db_district d ON v.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        WHERE ds.homebaseid = $1
        GROUP BY v.id, v.name, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      )
      SELECT 
        json_build_object(
          'provinces', (SELECT json_agg(province_stats) FROM province_stats),
          'cities', (SELECT json_agg(city_stats) FROM city_stats),
          'districts', (SELECT json_agg(district_stats) FROM district_stats),
          'villages', (SELECT json_agg(village_stats) FROM village_stats)
        ) as geographical_data
      `,
      [homebaseId]
    );

    // Student data completeness by grade
    const studentCompleteness = await pool.query(
      `
      WITH student_data AS (
        SELECT 
          g.name as grade_name,
          COUNT(DISTINCT s.id) as total_students,
          COUNT(DISTINCT CASE 
            WHEN ds.id IS NOT NULL THEN
              CASE 
                WHEN ds.name IS NOT NULL AND
                     ds.nis IS NOT NULL AND
                     ds.nisn IS NOT NULL AND
                     ds.gender IS NOT NULL AND
                     ds.birth_place IS NOT NULL AND
                     ds.birth_date IS NOT NULL AND
                     ds.height IS NOT NULL AND
                     ds.weight IS NOT NULL AND
                     ds.head IS NOT NULL AND
                     ds.order_number IS NOT NULL AND
                     ds.siblings IS NOT NULL AND
                     ds.address IS NOT NULL AND
                     ds.father_name IS NOT NULL AND
                     ds.mother_name IS NOT NULL AND
                     ds.province_name IS NOT NULL AND
                     ds.city_name IS NOT NULL AND
                     ds.district_name IS NOT NULL AND
                     ds.village_name IS NOT NULL AND
                     EXISTS (SELECT 1 FROM db_family df WHERE df.userid = s.id)
                THEN s.id END
            END
          ) as complete_students
        FROM u_students s
        LEFT JOIN db_student ds ON s.id = ds.userid
        LEFT JOIN cl_students cs ON s.id = cs.student
        LEFT JOIN a_class c ON cs.classid = c.id
        LEFT JOIN a_grade g ON c.grade = g.id
        WHERE s.homebase = $1
        GROUP BY g.name
        ORDER BY CAST(g.name AS INTEGER)
      )
      SELECT * FROM student_data
      `,
      [homebaseId]
    );

    // Student entry statistics
    const entryStats = await pool.query(
      `
      SELECT 
        e.name as entry_name,
        COUNT(*) as student_count
      FROM db_student ds
      JOIN a_periode e ON ds.entryid = e.id
      WHERE ds.homebaseid = $1
      GROUP BY e.name
      ORDER BY e.name
      `,
      [homebaseId]
    );

    res.json({
      basicStats: basicStats.rows[0],
      studentsPerGrade: studentsPerGrade.rows,
      studentsPerClass: studentsPerClass.rows,
      teacherComposition: teacherComposition.rows[0],
      activityLogs: activityLogs.rows,
      recentActivities: recentActivities.rows,
      examStats: examStats.rows[0],
      learningStats: learningStats.rows[0],
      studentDemographics: studentDemographics.rows[0],
      geographicalDistribution: geographicalDistribution.rows[0],
      studentCompleteness: studentCompleteness.rows,
      entryStats: entryStats.rows,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ======================================
// Teacher Dashboard
// ======================================

// Teacher Dashboard Stats
router.get("/teacher-stats", authorize("teacher"), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const homebaseId = req.user.homebase;

    // Get teacher's subjects and classes
    const teachingStats = await pool.query(
      `
      SELECT 
        (SELECT COUNT(DISTINCT subject) FROM at_subject WHERE teacher = $1) as total_subjects,
        (SELECT COUNT(DISTINCT lc.classid) 
         FROM l_cclass lc 
         JOIN l_chapter ch ON lc.chapter = ch.id 
         WHERE ch.teacher = $1) as total_classes,
        (SELECT COUNT(*) FROM c_exam WHERE teacher = $1) as total_exams,
        (SELECT COUNT(*) FROM c_bank WHERE teacher = $1) as total_banks,
        (SELECT COUNT(*) FROM l_chapter WHERE teacher = $1) as total_chapters,
        (SELECT COUNT(DISTINCT lc.classid) 
         FROM l_cclass lc 
         JOIN l_chapter ch ON lc.chapter = ch.id 
         WHERE ch.teacher = $1) as total_material_classes
      `,
      [teacherId]
    );

    // Get recent exams
    const recentExams = await pool.query(
      `
      SELECT id, name, duration, isactive, createdat
      FROM c_exam
      WHERE teacher = $1
      ORDER BY createdat DESC
      LIMIT 5
      `,
      [teacherId]
    );

    // Get recent learning materials
    const recentMaterials = await pool.query(
      `
      SELECT id, title, createdat
      FROM l_chapter
      WHERE teacher = $1
      ORDER BY createdat DESC
      LIMIT 5
      `,
      [teacherId]
    );

    res.json({
      teachingStats: teachingStats.rows[0],
      recentExams: recentExams.rows,
      recentMaterials: recentMaterials.rows,
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ======================================
// Student Dashboard
// ======================================
router.get("/student-stats", authorize("student"), async (req, res) => {
  try {
    const studentId = req.user.id;
    const homebaseId = req.user.homebase;

    // Get student's class and subjects
    const studentInfo = await pool.query(
      `
      SELECT 
        c.name as class_name,
        g.name as grade_name,
        m.name as major_name,
        COUNT(DISTINCT ats.subject) as total_subjects
      FROM cl_students cs
      JOIN a_class c ON cs.classid = c.id
      JOIN a_grade g ON c.grade = g.id
      LEFT JOIN a_major m ON c.major = m.id
      LEFT JOIN at_class atc ON atc.class_id = c.id
      LEFT JOIN at_subject ats ON ats.teacher = atc.teacher_id
      WHERE cs.student = $1 AND cs.homebase = $2
      GROUP BY c.name, g.name, m.name
      `,
      [studentId, homebaseId]
    );

    // Get upcoming exams
    const upcomingExams = await pool.query(
      `
      SELECT 
        e.id,
        e.name,
        e.duration,
        e.createdat,
        s.name as subject_name,
        t.name as teacher_name
      FROM c_exam e
      JOIN c_class cc ON cc.exam = e.id
      JOIN cl_students cs ON cs.classid = cc.classid
      JOIN c_ebank eb ON eb.exam = e.id
      JOIN c_bank cb ON cb.id = eb.bank
      JOIN a_subject s ON cb.subject = s.id
      JOIN u_teachers t ON e.teacher = t.id
      WHERE cs.student = $1 
      AND e.isactive = true
      AND e.createdat >= NOW()
      ORDER BY e.createdat ASC
      LIMIT 5
      `,
      [studentId]
    );

    // Get recent learning materials
    const recentMaterials = await pool.query(
      `
      SELECT 
        ch.id,
        ch.title,
        ch.createdat,
        s.name as subject_name,
        t.name as teacher_name
      FROM l_chapter ch
      JOIN a_subject s ON ch.subject = s.id
      JOIN u_teachers t ON ch.teacher = t.id
      JOIN l_cclass lc ON lc.chapter = ch.id
      JOIN cl_students cs ON cs.classid = lc.classid
      WHERE cs.student = $1
      ORDER BY ch.createdat DESC
      LIMIT 5
      `,
      [studentId]
    );

    // Get Quran learning progress
    const quranProgress = await pool.query(
      `
      SELECT 
        COUNT(DISTINCT p.juz_id) as completed_juz,
        COUNT(DISTINCT p.surah_id) as completed_surah,
        MAX(p.createdat) as last_activity
      FROM t_process p
      WHERE p.userid = $1
      `,
      [studentId]
    );

    res.json({
      studentInfo: studentInfo.rows[0],
      upcomingExams: upcomingExams.rows,
      recentMaterials: recentMaterials.rows,
      quranProgress: quranProgress.rows[0],
    });
  } catch (error) {
    console.error("Error fetching student dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ======================================
// Center Dashboard (Admin Pusat)
// ======================================
router.get("/center-stats", authorize("center"), async (req, res) => {
  try {
    // Get basic statistics
    const basicStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM u_students) as total_students,
        (SELECT COUNT(*) FROM u_teachers) as total_teachers,
        (SELECT COUNT(*) FROM a_class) as total_classes,
        (SELECT COUNT(*) FROM a_subject) as total_subjects,
        (SELECT COUNT(*) FROM a_homebase) as total_homebase,
        (SELECT COUNT(*) FROM c_exam) as total_exams,
        (SELECT COUNT(*) FROM c_bank) as total_banks,
        (SELECT COUNT(*) FROM l_chapter) as total_chapters
    `);

    // Get students distribution by grade
    const studentsPerGrade = await pool.query(`
      SELECT 
        g.name as grade_name,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN us.gender = 'L' THEN s.id END) as male_count,
        COUNT(DISTINCT CASE WHEN us.gender = 'P' THEN s.id END) as female_count
      FROM a_grade g
      LEFT JOIN a_class c ON c.grade = g.id
      LEFT JOIN cl_students s ON s.classid = c.id
      LEFT JOIN u_students us ON us.id = s.student
      GROUP BY g.id, g.name
      ORDER BY g.name
    `);

    // Get teacher composition
    const teacherComposition = await pool.query(`
      SELECT 
        COUNT(*) as total_teachers,
        COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
        COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count,
        COUNT(CASE WHEN homeroom = true THEN 1 END) as homeroom_count
      FROM u_teachers
    `);

    // Get exam statistics
    const examStats = await pool.query(`
      SELECT 
        COUNT(*) as total_exams,
        COUNT(CASE WHEN e.isactive = true THEN 1 END) as active_exams,
        COUNT(DISTINCT e.teacher) as teacher_count,
        COUNT(DISTINCT c.classid) as class_count,
        COUNT(DISTINCT cb.subject) as subject_count
      FROM c_exam e
      LEFT JOIN c_class c ON c.exam = e.id
      LEFT JOIN c_ebank eb ON eb.exam = e.id
      LEFT JOIN c_bank cb ON cb.id = eb.bank
    `);

    // Get learning material statistics
    const learningStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT ch.id) as total_chapters,
        COUNT(DISTINCT co.id) as total_contents,
        COUNT(DISTINCT f.id) as total_files,
        COUNT(DISTINCT ch.teacher) as teacher_count
      FROM l_chapter ch
      LEFT JOIN l_content co ON co.chapter = ch.id
      LEFT JOIN l_file f ON f.content = co.id
    `);

    // Get recent activities
    const recentActivities = await pool.query(`
      SELECT 
        'exam' as type,
        e.name as title,
        t.name as teacher_name,
        e.createdat
      FROM c_exam e
      JOIN u_teachers t ON e.teacher = t.id
      WHERE e.createdat >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT 
        'subject' as type,
        s.name as title,
        t.name as teacher_name,
        s.createdat
      FROM a_subject s
      JOIN at_subject ats ON ats.subject = s.id
      JOIN u_teachers t ON ats.teacher = t.id
      WHERE s.createdat >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT 
        'chapter' as type,
        ch.title as title,
        t.name as teacher_name,
        ch.createdat
      FROM l_chapter ch
      JOIN u_teachers t ON ch.teacher = t.id
      WHERE ch.createdat >= NOW() - INTERVAL '7 days'
      ORDER BY createdat DESC
      LIMIT 10
    `);

    // Get homebase statistics
    const homebaseStats = await pool.query(`
      SELECT 
        h.name as homebase_name,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT t.id) as total_teachers,
        COUNT(DISTINCT c.id) as total_classes,
        COUNT(DISTINCT sub.id) as total_subjects
      FROM a_homebase h
      LEFT JOIN u_students s ON s.homebase = h.id
      LEFT JOIN u_teachers t ON t.homebase = h.id
      LEFT JOIN a_class c ON c.homebase = h.id
      LEFT JOIN a_subject sub ON sub.homebase = h.id
      GROUP BY h.id, h.name
      ORDER BY h.name
    `);

    // Get system activity logs
    const activityLogs = await pool.query(`
      SELECT 
        l.id,
        l.action,
        l.createdat,
        l.islogin,
        l.ispenalty,
        l.isactive,
        l.isdone,
        l.ip,
        SUBSTRING(l.browser FROM '^[^/]+') as browser_name,
        SUBSTRING(l.browser FROM '/([^ ]+)') as browser_version,
        COALESCE(s.name, t.name, a.name) as user_name,
        CASE 
          WHEN l.student IS NOT NULL THEN 'Siswa'
          WHEN l.teacher IS NOT NULL THEN 'Guru'
          WHEN l.admin IS NOT NULL THEN 'Admin'
          ELSE 'Unknown'
        END as user_type
      FROM logs l
      LEFT JOIN u_students s ON l.student = s.id
      LEFT JOIN u_teachers t ON l.teacher = t.id
      LEFT JOIN u_admin a ON l.admin = a.id
      ORDER BY l.createdat DESC
      LIMIT 10
    `);

    // Student demographic data untuk center (semua siswa tanpa filter homebase, ignore null birth_date)
    const studentDemographics = await pool.query(`
      WITH valid_students AS (
        SELECT
          id,
          gender,
          birth_date,
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::integer as age
        FROM db_student
        WHERE birth_date IS NOT NULL
      ),
      age_stats AS (
        SELECT
          MIN(age) as min_age,
          MAX(age) as max_age,
          COUNT(*) as total_students,
          COUNT(CASE WHEN gender = 'L' THEN 1 END) as male_count,
          COUNT(CASE WHEN gender = 'P' THEN 1 END) as female_count
        FROM valid_students
      ),
      -- Create dynamic age ranges based on actual data
      age_ranges AS (
        SELECT
          CASE 
            WHEN age < (SELECT MIN(age) + 2 FROM valid_students) 
              THEN concat('<', (SELECT MIN(age) + 2 FROM valid_students))
            WHEN age >= (SELECT MAX(age) - 1 FROM valid_students)
              THEN concat('>', (SELECT MAX(age) - 2 FROM valid_students))
            ELSE concat(
              FLOOR(age/2) * 2, '-', 
              FLOOR(age/2) * 2 + 1
            )
          END as age_group,
          CASE 
            WHEN age < (SELECT MIN(age) + 2 FROM valid_students) THEN 1
            WHEN age >= (SELECT MAX(age) - 1 FROM valid_students) THEN 999
            ELSE FLOOR(age/2) * 2
          END as sort_order,
          id,
          gender,
          age
        FROM valid_students
      ),
      age_distribution_calc AS (
        SELECT
          age_group,
          sort_order,
          COUNT(*) as count
        FROM age_ranges
        GROUP BY age_group, sort_order
        ORDER BY sort_order
      )
      SELECT
        COALESCE((SELECT total_students FROM age_stats), 0) as total_students,
        COALESCE((SELECT male_count FROM age_stats), 0) as male_count,
        COALESCE((SELECT female_count FROM age_stats), 0) as female_count,
        COALESCE((SELECT min_age FROM age_stats), 0) as min_age,
        COALESCE((SELECT max_age FROM age_stats), 0) as max_age,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'age_group', age_group,
            'count', count
          ) ORDER BY sort_order)
           FROM age_distribution_calc),
          '[]'::json
        ) as age_distribution;
    `);

    // Geographical distribution of students
    const geographicalDistribution = await pool.query(`
      WITH province_stats AS (
        SELECT 
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_province p ON ds.provinceid = p.id
        GROUP BY p.id, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      city_stats AS (
        SELECT 
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_city c ON ds.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY c.id, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      district_stats AS (
        SELECT 
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_district d ON ds.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY d.id, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      village_stats AS (
        SELECT 
          v.name as village_name,
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_village v ON ds.villageid = v.id
        JOIN db_district d ON v.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY v.id, v.name, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      )
      SELECT 
        json_build_object(
          'provinces', (SELECT json_agg(province_stats) FROM province_stats),
          'cities', (SELECT json_agg(city_stats) FROM city_stats),
          'districts', (SELECT json_agg(district_stats) FROM district_stats),
          'villages', (SELECT json_agg(village_stats) FROM village_stats)
        ) as geographical_data
    `);

    // Student data completeness by grade
    const studentCompleteness = await pool.query(
      `
      WITH student_data AS (
        SELECT 
          g.name as grade_name,
          COUNT(DISTINCT s.id) as total_students,
          COUNT(DISTINCT CASE 
            WHEN ds.id IS NOT NULL THEN
              CASE 
                WHEN ds.name IS NOT NULL AND
                     ds.homebaseid IS NOT NULL AND
                     ds.homebase_name IS NOT NULL AND
                     ds.entryid IS NOT NULL AND
                     ds.entry_name IS NOT NULL AND
                     ds.nis IS NOT NULL AND
                     ds.nisn IS NOT NULL AND
                     ds.gender IS NOT NULL AND
                     ds.birth_place IS NOT NULL AND
                     ds.birth_date IS NOT NULL AND
                     ds.height IS NOT NULL AND
                     ds.weight IS NOT NULL AND
                     ds.head IS NOT NULL AND
                     ds.order_number IS NOT NULL AND
                     ds.siblings IS NOT NULL AND
                     ds.address IS NOT NULL AND
                     ds.father_nik IS NOT NULL AND
                     ds.father_name IS NOT NULL AND
                     ds.father_birth_place IS NOT NULL AND
                     ds.father_birth_date IS NOT NULL AND
                     ds.father_job IS NOT NULL AND
                     ds.father_phone IS NOT NULL AND
                     ds.mother_nik IS NOT NULL AND
                     ds.mother_name IS NOT NULL AND
                     ds.mother_birth_place IS NOT NULL AND
                     ds.mother_birth_date IS NOT NULL AND
                     ds.mother_job IS NOT NULL AND
                     ds.mother_phone IS NOT NULL AND
                     ds.province_name IS NOT NULL AND
                     ds.city_name IS NOT NULL AND
                     ds.district_name IS NOT NULL AND
                     ds.village_name IS NOT NULL AND
                     ds.postal_code IS NOT NULL AND
                     EXISTS (SELECT 1 FROM db_family df WHERE df.userid = s.id)
                THEN s.id END
            END
          ) as complete_students
        FROM u_students s
        LEFT JOIN db_student ds ON s.id = ds.userid
        LEFT JOIN cl_students cs ON s.id = cs.student
        LEFT JOIN a_class c ON cs.classid = c.id
        LEFT JOIN a_grade g ON c.grade = g.id
        GROUP BY g.name
        ORDER BY CAST(g.name AS INTEGER)
      )
      SELECT * FROM student_data
      `
    );

    // Student entry statistics
    const entryStats = await pool.query(`
      SELECT 
        e.name as entry_name,
        COUNT(*) as student_count
      FROM db_student ds
      JOIN a_periode e ON ds.entryid = e.id
      GROUP BY e.name
      ORDER BY e.name
    `);

    res.json({
      basicStats: basicStats.rows[0],
      studentsPerGrade: studentsPerGrade.rows,
      teacherComposition: teacherComposition.rows[0],
      examStats: examStats.rows[0],
      learningStats: learningStats.rows[0],
      recentActivities: recentActivities.rows,
      homebaseStats: homebaseStats.rows,
      activityLogs: activityLogs.rows,
      studentDemographics: studentDemographics.rows[0],
      geographicalDistribution: geographicalDistribution.rows[0],
      studentCompleteness: studentCompleteness.rows,
      entryStats: entryStats.rows,
    });
  } catch (error) {
    console.error("Error fetching center dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ======================================
// Home Infograpis
// ======================================

router.get("/infografis", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const basicStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM u_students WHERE isactive = true) as total_students,
        (SELECT COUNT(*) FROM u_teachers) as total_teachers
    `);

    const geographicalDistribution = await pool.query(`
      WITH province_stats AS (
        SELECT 
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_province p ON ds.provinceid = p.id
        GROUP BY p.id, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      city_stats AS (
        SELECT 
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_city c ON ds.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY c.id, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      district_stats AS (
        SELECT 
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_district d ON ds.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY d.id, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      ),
      village_stats AS (
        SELECT 
          v.name as village_name,
          d.name as district_name,
          c.name as city_name,
          p.name as province_name,
          COUNT(*) as student_count
        FROM db_student ds
        JOIN db_village v ON ds.villageid = v.id
        JOIN db_district d ON v.districtid = d.id
        JOIN db_city c ON d.cityid = c.id
        JOIN db_province p ON c.provinceid = p.id
        GROUP BY v.id, v.name, d.name, c.name, p.name
        ORDER BY student_count DESC
        LIMIT 5
      )
      SELECT 
        json_build_object(
          'provinces', (SELECT json_agg(province_stats) FROM province_stats),
          'cities', (SELECT json_agg(city_stats) FROM city_stats),
          'districts', (SELECT json_agg(district_stats) FROM district_stats),
          'villages', (SELECT json_agg(village_stats) FROM village_stats)
        ) as geographical_data
    `);

    res.json({
      basicStats: basicStats.rows[0],
      geographicalDistribution: geographicalDistribution.rows[0],
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching infografis:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// CMS Dashboard

router.get("/cms-dashboard", async (req, res) => {
  const client = await pool.connect();

  try {
    // Get current month's start and end dates
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get previous month's start and end dates
    const firstDayOfPrevMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get visitor statistics
    const visitorStats = await client.query(
      `
      WITH current_month_stats AS (
        SELECT 
          page_type,
          COUNT(DISTINCT ip_address) as unique_visitors,
          COUNT(*) as total_visits,
          COUNT(DISTINCT country) as countries_count
        FROM cms_visitors
        WHERE visit_date BETWEEN $1 AND $2
        GROUP BY page_type
      ),
      prev_month_stats AS (
        SELECT 
          page_type,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM cms_visitors
        WHERE visit_date BETWEEN $3 AND $4
        GROUP BY page_type
      ),
      country_stats AS (
        SELECT 
          country,
          COUNT(DISTINCT ip_address) as visitor_count
        FROM cms_visitors
        WHERE visit_date BETWEEN $1 AND $2
        GROUP BY country
        ORDER BY visitor_count DESC
        LIMIT 5
      ),
      daily_stats AS (
        SELECT 
          visit_date,
          COUNT(DISTINCT ip_address) as unique_visitors,
          COUNT(*) as total_visits
        FROM cms_visitors
        WHERE visit_date >= NOW() - INTERVAL '30 days'
        GROUP BY visit_date
        ORDER BY visit_date
      )
      SELECT json_build_object(
        'current_month', (SELECT json_object_agg(page_type, json_build_object(
          'unique_visitors', unique_visitors,
          'total_visits', total_visits,
          'countries_count', countries_count
        )) FROM current_month_stats),
        'prev_month', (SELECT json_object_agg(page_type, json_build_object(
          'unique_visitors', unique_visitors
        )) FROM prev_month_stats),
        'top_countries', (SELECT json_agg(json_build_object(
          'country', country,
          'count', visitor_count
        )) FROM country_stats),
        'daily_trend', (SELECT json_agg(json_build_object(
          'date', visit_date,
          'unique_visitors', unique_visitors,
          'total_visits', total_visits
        )) FROM daily_stats)
      ) as visitor_data
    `,
      [firstDayOfMonth, lastDayOfMonth, firstDayOfPrevMonth, lastDayOfPrevMonth]
    );

    // Get news stats
    const newsStats = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM cms_news WHERE createdat >= $1 AND createdat <= $2) as current_month_news,
        (SELECT COUNT(*) FROM cms_news WHERE createdat >= $3 AND createdat <= $4) as prev_month_news,
        (SELECT COUNT(*) FROM cms_news) as total_news
    `,
      [firstDayOfMonth, lastDayOfMonth, firstDayOfPrevMonth, lastDayOfPrevMonth]
    );

    // Get facilities stats with recently added count
    const facilityStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM cms_facility WHERE createdat >= NOW() - INTERVAL '30 days') as recently_added,
        (SELECT COUNT(*) FROM cms_facility) as total_facilities
    `);

    // Get testimonial stats
    const testimonialStats = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM cms_testimony WHERE createdat >= $1 AND createdat <= $2) as current_month_testimonials,
        (SELECT COUNT(*) FROM cms_testimony WHERE createdat >= $3 AND createdat <= $4) as prev_month_testimonials,
        (SELECT COUNT(*) FROM cms_testimony) as total_testimonials
    `,
      [firstDayOfMonth, lastDayOfMonth, firstDayOfPrevMonth, lastDayOfPrevMonth]
    );

    // Get recent activities
    const recentActivities = await pool.query(`
      SELECT 
        'news' as type,
        title as action,
        title as title,
        createdat
      FROM cms_news
      UNION ALL
      SELECT 
        'testimonial' as type,
        'New testimonial added' as action,
        name as title,
        createdat
      FROM cms_testimony
      ORDER BY createdat DESC
      LIMIT 10
    `);

    res.json({
      stats: {
        total_visitors:
          (visitorStats.rows[0].visitor_data.current_month?.homepage
            ?.unique_visitors || 0) +
          (visitorStats.rows[0].visitor_data.current_month?.news
            ?.unique_visitors || 0),
        total_news: newsStats.rows[0].total_news,
        total_facilities: facilityStats.rows[0].total_facilities,
        total_testimonials: testimonialStats.rows[0].total_testimonials,
        changes: {
          visitors: {
            value: calculatePercentageChange(
              (visitorStats.rows[0].visitor_data.prev_month?.homepage
                ?.unique_visitors || 0) +
                (visitorStats.rows[0].visitor_data.prev_month?.news
                  ?.unique_visitors || 0),
              (visitorStats.rows[0].visitor_data.current_month?.homepage
                ?.unique_visitors || 0) +
                (visitorStats.rows[0].visitor_data.current_month?.news
                  ?.unique_visitors || 0)
            ),
            period: "vs Bulan lalu",
          },
          news: {
            value: newsStats.rows[0].current_month_news,
            period: "Bulan ini",
          },
          facilities: {
            value: facilityStats.rows[0].recently_added,
            period: "Bulan ini",
          },
          testimonials: {
            value: testimonialStats.rows[0].current_month_testimonials,
            period: "Bulan ini",
          },
        },
      },
      recentActivities: recentActivities.rows.map((activity) => ({
        id: activity.type + "_" + activity.createdat,
        action: activity.action,
        title: activity.title,
        time: activity.createdat,
      })),
      websiteAnalytics: {
        pageViews:
          (visitorStats.rows[0].visitor_data.current_month?.homepage
            ?.total_visits || 0) +
          (visitorStats.rows[0].visitor_data.current_month?.news
            ?.total_visits || 0),
        uniqueVisitors:
          (visitorStats.rows[0].visitor_data.current_month?.homepage
            ?.unique_visitors || 0) +
          (visitorStats.rows[0].visitor_data.current_month?.news
            ?.unique_visitors || 0),
      },
      visitorStats: visitorStats.rows[0].visitor_data,
    });
  } catch (error) {
    console.error("Error fetching CMS dashboard:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Helper function to calculate percentage change
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
}

export default router;
