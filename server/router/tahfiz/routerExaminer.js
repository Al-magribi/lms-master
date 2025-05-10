import { Router } from "express"
import { authorize } from "../../middleware/auth.js"
import { pool } from "../../config/config.js"

const update = "Berhasil disimpan"
const create = "Berhasil ditambahkan"
const remove = "Berhasil dihapus"

const router = Router()

router.post("/add-examiner", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id, name } = req.body

		if (id) {
			await client.query(`UPDATE t_examiner SET name = $1 WHERE id = $2`, [
				name,
				id,
			])
		} else {
			await client.query(`INSERT INTO t_examiner(name) VALUES ($1)`, [name])
		}

		res.status(201).json({ message: id ? update : create })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.get("/get-examiners", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { page, limit, search = "" } = req.query

		const searchQuery = `%${search}%`

		if (!page && !limit) {
			const data = await client.query(
				`SELECT * FROM t_examiner WHERE name ILIKE $1 ORDER BY id`,
				[searchQuery]
			)

			return res.status(200).json(data.rows)
		}

		const pageNum = parseInt(page) || 1
		const limitNumber = parseInt(limit) || 10
		const offset = (pageNum - 1) * limitNumber

		// Get total data count
		const totalDataQuery = await client.query(
			`SELECT COUNT(*) AS total FROM t_examiner WHERE name ILIKE $1`,
			[searchQuery]
		)
		const totalData = parseInt(totalDataQuery.rows[0].total)

		// Fetch paginated data
		const data = await client.query(
			`SELECT * FROM t_examiner WHERE name ILIKE $1 
       ORDER BY name ASC LIMIT $2 OFFSET $3`,
			[searchQuery, limitNumber, offset]
		)

		res.status(200).json({
			examiners: data.rows,
			totalData,
			totalPages: Math.ceil(totalData / limitNumber),
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.delete("/delete-examiner/:id", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		await client.query(`DELETE FROM t_examiner WHERE id = $1`, [req.params.id])

		res.status(200).json({ message: remove })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

export default router
