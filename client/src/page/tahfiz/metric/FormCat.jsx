import React, { useEffect, useState } from "react"
import { useAddCategoryMutation } from "../../../controller/api/tahfiz/ApiMetric"
import toast from "react-hot-toast"

const FormCat = ({ category, setCategory }) => {
	const [id, setId] = useState("")
	const [name, setName] = useState("")

	const [addCategory, { isLoading, isSuccess, isError, reset }] =
		useAddCategoryMutation()

	const addHandler = (e) => {
		e.preventDefault()

		const data = { id, name }

		toast.promise(
			addCategory(data)
				.unwrap()
				.then((res) => res.message),
			{
				loading: "Memuat data...",
				success: (message) => message,
				error: (err) => err.data.message,
			}
		)
	}

	const cancel = () => {
		setCategory({})
		setId("")
		setName("")
	}

	useEffect(() => {
		if (isSuccess || isError) {
			cancel()
			reset()
		}
	}, [isSuccess, isError])

	useEffect(() => {
		if (category) {
			setId(category.id)
			setName(category.name)
		}
	}, [category])

	return (
		<form
			onSubmit={addHandler}
			className='rounded border bg-white p-2 d-flex flex-column gap-2 mb-2'>
			<p className='m-0 h6'>Kategori Penilaian</p>

			<input
				type='text'
				name='name'
				id='name'
				className='form-control'
				placeholder='Penilaian'
				value={name || ""}
				onChange={(e) => setName(e.target.value)}
			/>

			<div className='d-flex justify-content-end gap-2'>
				<button
					type='button'
					className='btn btn-sm btn-warning'
					onClick={cancel}>
					Batal
				</button>
				<button
					type='submit'
					className='btn btn-sm btn-success'
					disabled={isLoading}>
					Simpan
				</button>
			</div>
		</form>
	)
}

export default FormCat
