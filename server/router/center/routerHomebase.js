import express from "express"
import { pool } from "../../config/config.js"
import { authorize } from "../../middleware/auth.js"

const router = express.Router()
const update = "Berhasil diperbarui"
const create = "Berhasil disimpan"
const remove = "Berhasil dihapus"

router.get("/get-homebase", authorize("center"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { page = 1, limit = 10, search = "" } = req.query
		const offset = (parseInt(page) - 1) * parseInt(limit)

		if (!page && !limit) {
			const data = await client.query(`SELECT * FROM a_homebase`)

			return res.status(200).json(data.rows)
		}

		const [count, data] = await Promise.all([
			client.query(
				`SELECT COUNT(*) AS total FROM a_homebase WHERE name ILIKE $1`,
				[`%${search}%`]
			),
			client.query(
				`SELECT * FROM a_homebase 
        WHERE name ILIKE $1 
        ORDER BY name ASC 
        LIMIT $2 OFFSET $3`,
				[`%${search}%`, parseInt(limit), offset]
			),
		])

		const homebase = data.rows
		const totalData = parseInt(count.rows[0].total)
		const totalPages = Math.ceil(totalData / parseInt(limit))

		res.status(200).json({ homebase, totalData, totalPages })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.post("/add-homebase", authorize("center"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id, name } = req.body

		await client.query("BEGIN")

		if (id) {
			await client.query(`UPDATE a_homebase SET name = $1 WHERE id = $2`, [
				name,
				id,
			])
		} else {
			await client.query(`INSERT INTO a_homebase(name) VALUES($1)`, [name])
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

router.delete("/delete-homebase", authorize("center"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id } = req.query

		await client.query("BEGIN")
		await client.query(`DELETE FROM a_homebase WHERE id = $1`, [id])
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
