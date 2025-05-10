import express from "express"
import { authorize } from "../../middleware/auth.js"
import { pool } from "../../config/config.js"

const create = "Berhasil disimpan"
const update = "Berhasil diperbarui"
const remove = "Berhasil dihapus"

const router = express.Router()

// =================================
// ENDPOINT TYPE UJIAN
// =================================
router.post("/add-type", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id, name } = req.body

		if (id) {
			await client.query(`UPDATE t_type SET name = $1 WHERE id = $2`, [
				name,
				id,
			])
		} else {
			await client.query(`INSERT INTO t_type(name) VALUES($1) RETURNING *`, [
				name,
			])
		}

		res.status(200).json({ message: id ? update : create })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.get("/get-types", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { page, limit, search } = req.query
		const offset = (page - 1) * limit

		if (!page || !limit) {
			const data = await client.query(`SELECT * FROM t_type`)
			return res.status(200).json(data.rows)
		}

		const count = await client.query(
			`SELECT COUNT(*) FROM t_type WHERE name ILIKE $1
			OFFSET $2 LIMIT $3`,
			[`%${search}%`, offset, limit]
		)

		const data = await client.query(
			`SELECT * FROM t_type WHERE name ILIKE $1 ORDER BY id ASC LIMIT $2 OFFSET $3`,
			[`%${search}%`, limit, offset]
		)

		const totalPages = Math.ceil(count.rows[0].count / limit)
		const totalData = count.rows[0].count

		res.status(200).json({ types: data.rows, totalData, totalPages })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.delete("/delete-type/:id", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		// Cek apakah tipe yang akan dihapus adalah 'Harian'
		const checkType = await client.query(
			`SELECT name FROM t_type WHERE id = $1`,
			[req.params.id]
		)

		if (checkType.rows.length > 0 && checkType.rows[0].name === "Harian") {
			return res
				.status(400)
				.json({ message: "Penilaian ini tidak bisa dihapus" })
		}

		await client.query(`DELETE FROM t_type WHERE id = $1`, [req.params.id])

		res.status(200).json({ message: remove })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

// =================================
// ENDPOINT METRICS PENILAIAN
// =================================
// Category
router.post("/add-category", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id, name } = req.body

		if (id) {
			await client.query(`UPDATE t_categories SET name = $1 WHERE id = $2`, [
				name,
				id,
			])
		} else {
			await client.query(
				`INSERT INTO t_categories(name) VALUES($1) RETURNING *`,
				[name]
			)
		}

		res.status(200).json({ message: id ? update : create })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.get(
	"/get-categories",
	authorize("tahfiz", "student", "parent"),
	async (req, res) => {
		const client = await pool.connect()
		try {
			const { page, limit, search } = req.query
			const offset = (page - 1) * limit

			if (!page || !limit) {
				const data = await client.query(`SELECT * FROM t_categories`)
				return res.status(200).json(data.rows)
			}

			// Query untuk mendapatkan total data
			const countQuery = `
				SELECT COUNT(DISTINCT c.id) 
				FROM t_categories c
				LEFT JOIN t_indicators i ON c.id = i.category_id
				WHERE c.name ILIKE $1
			`
			const countResult = await client.query(countQuery, [`%${search}%`])
			const totalData = parseInt(countResult.rows[0].count)
			const totalPages = Math.ceil(totalData / limit)

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
				WHERE c.name ILIKE $1
				GROUP BY c.id, c.name
				ORDER BY c.id
				LIMIT $2 OFFSET $3
			`

			const result = await client.query(query, [`%${search}%`, limit, offset])

			// Struktur data sesuai kebutuhan
			const categories = result.rows.map((row) => ({
				id: row.category_id,
				name: row.name,
				indicators: row.indicators || [],
			}))

			res.status(200).json({ categories, totalData, totalPages })
		} catch (error) {
			console.error(error)
			res.status(500).json({ message: error.message })
		} finally {
			client.release()
		}
	}
)

router.delete("/delete-category/:id", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		await client.query(`DELETE FROM t_categories WHERE id = $1`, [
			req.params.id,
		])

		res.status(200).json({ message: remove })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

// Indicator
router.post("/add-indicator", authorize("tahfiz"), async (req, res) => {
	const client = await pool.connect()
	try {
		const { id, name, categoryId } = req.body

		if (id) {
			await client.query(
				`UPDATE t_indicators SET name = $1, category_id = $2 WHERE id = $3`,
				[name, categoryId, id]
			)
		} else {
			await client.query(
				`INSERT INTO t_indicators(name, category_id) VALUES($1, $2) RETURNING *`,
				[name, categoryId]
			)
		}

		res.status(200).json({ message: id ? update : create })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: error.message })
	} finally {
		client.release()
	}
})

router.delete(
	"/delete-indicator/:id",
	authorize("tahfiz"),
	async (req, res) => {
		const client = await pool.connect()
		try {
			await client.query(`DELETE FROM t_indicators WHERE id = $1`, [
				req.params.id,
			])

			res.status(200).json({ message: remove })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: error.message })
		} finally {
			client.release()
		}
	}
)

export default router
