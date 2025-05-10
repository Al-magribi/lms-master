import express from "express"
import { pool } from "../../config/config.js"
import { authorize } from "../../middleware/auth.js"
import bcrypt from "bcrypt"

const create = "Berhasil disimpan"
const update = "Berhasil diperbarui"
const remove = "Berhasil dihapus"

const router = express.Router()

router.post("/add-teacher", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id, username, name, homeroom, classid, gender, subjects } = req.body
		const homebase = req.user.homebase
		const password = "12345678"
		const hashedPassword = await bcrypt.hash(password, 10)

		await client.query("BEGIN")

		const checkData = await client.query(
			`SELECT * FROM u_teachers 
			WHERE homebase = $1 AND username = $2 AND name = $3`,
			[homebase, username, name]
		)

		if (checkData.rowCount > 0 && !id) {
			await client.query("ROLLBACK")
			return res
				.status(400)
				.json({ message: "Username dan nama guru sudah digunakan" })
		}

		let teacherId = id

		if (id) {
			await client.query(
				`UPDATE u_teachers 
				SET username = $1, name = $2, homebase = $3,
				homeroom = $4, class = $5, gender = $6
				WHERE id = $7`,
				[username, name, homebase, homeroom, classid || null, gender, id]
			)
		} else {
			const result = await client.query(
				`INSERT INTO u_teachers(username, name, homebase, homeroom, class, password, gender) 
				VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
				[
					username,
					name,
					homebase,
					homeroom,
					classid || null,
					hashedPassword,
					gender,
				]
			)

			teacherId = result.rows[0].id
		}

		// Hapus subject lama
		await client.query(`DELETE FROM at_subject WHERE teacher = $1`, [teacherId])

		// Masukkan subject baru
		if (Array.isArray(subjects) && subjects.length > 0) {
			const values = subjects.map((subject) => [teacherId, subject.value])
			const query =
				"INSERT INTO at_subject (teacher, subject) VALUES " +
				values.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(",")
			const params = values.flat()

			await client.query(query, params)
		}

		await client.query("COMMIT")
		res.status(200).json({
			message: id ? update : create,
		})
	} catch (error) {
		await client.query("ROLLBACK")
		console.error(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.post("/upload-teachers", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const teachers = req.body
		const password = "12345678"
		const hashedPassword = await bcrypt.hash(password, 10)
		const homebase = req.user.homebase

		await client.query("BEGIN")

		await Promise.all(
			teachers.map(async (teacher) => {
				await client.query(
					`INSERT INTO u_teachers(homebase, username, name, gender, password)
					VALUES ($1, $2, $3, $4, $5)`,
					[homebase, teacher[0], teacher[1], teacher[2], hashedPassword]
				)
			})
		)

		await client.query("COMMIT")
		res
			.status(200)
			.json({ message: `${teachers?.length} Guru berhasil disimpan` })
	} catch (error) {
		await client.query("ROLLBACK")
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.get("/get-teachers", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { page = 1, limit = 10, search = "" } = req.query
		const offset = (page - 1) * limit
		const homebase = req.user.homebase

		if (!req.query.page && !req.query.limit) {
			const data = await client.query(
				`SELECT * FROM u_teachers WHERE homebase = $1 ORDER BY name ASC`,
				[homebase]
			)
			return res.status(200).json(data.rows)
		}

		const [count, data] = await Promise.all([
			client.query(
				`SELECT COUNT(*) FROM u_teachers 
				WHERE homebase = $1 AND (name ILIKE $2 OR username ILIKE $2)`,
				[homebase, `%${search}%`]
			),
			client.query(
				`SELECT u_teachers.*, 
					a_class.name AS class_name, 
					a_homebase.name AS homebase,
					COALESCE(json_agg(
						json_build_object('id', a_subject.id, 'name', a_subject.name)
					) FILTER (WHERE a_subject.id IS NOT NULL), '[]') AS subjects
				FROM u_teachers
				LEFT JOIN a_homebase ON u_teachers.homebase = a_homebase.id
				LEFT JOIN a_class ON u_teachers.class = a_class.id
				LEFT JOIN at_subject ON u_teachers.id = at_subject.teacher
				LEFT JOIN a_subject ON at_subject.subject = a_subject.id
				WHERE u_teachers.homebase = $1
				AND (u_teachers.name ILIKE $2 OR u_teachers.username ILIKE $2)
				GROUP BY u_teachers.id, a_class.name, a_homebase.name
				ORDER BY a_homebase.name ASC, u_teachers.name ASC
				LIMIT $3 OFFSET $4`,
				[homebase, `%${search}%`, limit, offset]
			),
		])

		const totalData = parseInt(count.rows[0].count)
		const totalPages = Math.ceil(totalData / limit)
		const teachers = data.rows

		res.status(200).json({ totalData, totalPages, teachers })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.delete("/delete-teacher", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id } = req.query

		await client.query("BEGIN")
		await client.query(`DELETE FROM u_teachers WHERE id = $1`, [id])
		await client.query("COMMIT")

		res.status(200).json({ message: remove })
	} catch (error) {
		await client.query("ROLLBACK")
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

export default router
