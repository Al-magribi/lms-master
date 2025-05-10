import React, { useEffect, useState } from "react"
import {
	useAddIndicatorMutation,
	useGetCategoriesQuery,
} from "../../../controller/api/tahfiz/ApiMetric"
import toast from "react-hot-toast"

const FormInd = ({ indicator, setIndicator }) => {
	const [id, setId] = useState("")
	const [categoryId, setCategoryId] = useState("")
	const [name, setName] = useState("")

	const { data: categories } = useGetCategoriesQuery({
		page: "",
		limit: "",
		search: "",
	})
	const [addIndicator, { isLoading, isSuccess, isError, reset }] =
		useAddIndicatorMutation()

	const addHandler = (e) => {
		e.preventDefault()

		const data = { id, categoryId, name }

		toast.promise(
			addIndicator(data)
				.unwrap()
				.then((res) => res.message),
			{
				loading: "Menambahkan indikator...",
				success: (message) => message,
				error: (error) => error.data.message,
			}
		)
	}

	const cancel = () => {
		setIndicator({})
		setId("")
		setCategoryId("")
		setName("")
	}

	useEffect(() => {
		if (isSuccess || isError) {
			cancel()
			reset()
		}
	}, [isSuccess, isError])

	useEffect(() => {
		if (indicator) {
			setId(indicator.id)
			setName(indicator.name)
			setCategoryId(indicator.category_id)
		}
	}, [indicator])

	return (
		<form
			onSubmit={addHandler}
			className='rounded border bg-white p-2 d-flex flex-column gap-2'>
			<p className='m-0 h6'>Indikator Penilaian</p>

			<select
				name='cetegory'
				id='1'
				className='form-select'
				required
				value={categoryId || ""}
				onChange={(e) => setCategoryId(e.target.value)}>
				<option value='' hidden>
					Pilih Kategori
				</option>
				{categories?.map((item) => (
					<option key={item.id} value={item.id}>
						{item.name}
					</option>
				))}
			</select>

			<input
				type='text'
				className='form-control'
				placeholder='Nama Indikator'
				required
				value={name || ""}
				onChange={(e) => setName(e.target.value)}
			/>

			<div className='text-end'>
				<button
					type='button'
					className='btn btn-sm btn-warning me-2'
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

export default FormInd
