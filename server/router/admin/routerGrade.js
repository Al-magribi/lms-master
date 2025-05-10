import express from "express"
import { pool } from "../../config/config.js"
import { authorize } from "../../middleware/auth.js"

const router = express.Router()
const create = "Berhasil disimpan"
const update = "Berhasil diperbarui"
const remove = "Berhasil dihapus"

router.post("/add-grade", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id, name } = req.body
		const homebase = req.user.homebase

		await client.query("BEGIN")

		if (id) {
			await client.query(
				`UPDATE a_grade
                SET name = $1, homebase = $2 WHERE id = $3`,
				[name, homebase, id]
			)
		} else {
			await client.query(
				`INSERT INTO
                 a_grade(homebase, name) 
                 VALUES($1, $2)`,
				[homebase, name]
			)
		}

		await client.query("COMMIT")
		res.status(200).json({ message: id ? update : create })
	} catch (error) {
		await client.query("ROLLBACK")
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.get("/get-grade", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { page, limit, search } = req.query
		const offset = (page - 1) * limit
		const homebase = req.user.homebase

		if (!page && !limit) {
			const data = await client.query(
				`SELECT * FROM a_grade WHERE homebase = $1`,
				[homebase]
			)

			return res.status(200).json(data.rows)
		}

		const [count, data] = await Promise.all([
			client.query(
				`SELECT COUNT(*) AS total 
				FROM a_grade WHERE name ILIKE $1 AND homebase = $2`,
				[`%${search}%`, homebase]
			),
			client.query(
				`SELECT a_grade.*, a_homebase.name AS homebase
				FROM a_grade
				INNER JOIN a_homebase ON a_grade.homebase = a_homebase.id
				WHERE a_grade.name ILIKE $1 AND a_grade.homebase = $2
				ORDER BY CAST(a_grade.name AS INTEGER) ASC
				LIMIT $3 OFFSET $4`,
				[`%${search}%`, homebase, limit, offset]
			),
		])

		const totalData = parseInt(count.rows[0].total, 10)
		const totalPages = Math.ceil(totalData / limit)
		const grades = data.rows

		res.status(200).json({ totalData, totalPages, grades })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.delete("/delete-grade", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id } = req.query

		await client.query("BEGIN")
		await client.query(`DELETE FROM a_grade WHERE id = $1`, [id])
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
