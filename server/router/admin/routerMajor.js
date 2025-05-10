import express from "express"
import { pool } from "../../config/config.js"
import { authorize } from "../../middleware/auth.js"

const create = "Berhasil disimpan"
const update = "Berhasil diperbarui"
const remove = "Berhasil dihapus"

const router = express.Router()

router.post("/add-major", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id, name } = req.body
		const homebase = req.user.homebase

		await client.query("BEGIN")

		if (id) {
			await client.query(
				`UPDATE a_major
                SET homebase = $1, name = $2 WHERE id = $3`,
				[homebase, name, id]
			)
		} else {
			await client.query(
				`INSERT INTO a_major(homebase, name)
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

router.get("/get-major", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { page, limit, search } = req.query
		const offset = (page - 1) * limit
		const homebase = req.user.homebase

		if (!page && !limit) {
			const data = await client.query(
				`SELECT * FROM a_major WHERE homebase = $1`,
				[homebase]
			)

			return res.status(200).json(data.rows)
		}

		const [count, data] = await Promise.all([
			client.query(
				`SELECT COUNT(*) FROM a_major 
				WHERE homebase = $1 AND name ILIKE $2`,
				[homebase, `%${search}%`]
			),
			client.query(
				`SELECT a_major.*, a_homebase.name AS homebase 
				FROM a_major
				LEFT JOIN a_homebase ON a_major.homebase = a_homebase.id
				WHERE a_major.homebase = $1 AND a_major.name ILIKE $2
				ORDER BY a_major.name ASC 
				LIMIT $3 OFFSET $4`,
				[homebase, `%${search}%`, limit, offset]
			),
		])

		const totalData = parseInt(count.rows[0].count)
		const totalPages = Math.ceil(totalData / limit)
		const majors = data.rows

		res.status(200).json({
			totalData,
			totalPages,
			majors,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.delete("/delete-major", authorize("admin"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id } = req.query

		await client.query("BEGIN")
		await client.query(`DELETE FROM a_major WHERE id = $1`, [id])
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
