import React, { useEffect, useState } from "react"
import { useAddTypeMutation } from "../../../controller/api/tahfiz/ApiMetric"
import { toast } from "react-hot-toast"

const Form = ({ detail, setDetail }) => {
	const [id, setId] = useState("")
	const [name, setName] = useState("")

	const [addType, { isLoading, isSuccess, isError, reset }] =
		useAddTypeMutation()

	const addHandler = (e) => {
		e.preventDefault()

		const data = { id: id ? id : "", name }

		toast.promise(
			addType(data)
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
		setId("")
		setName("")
		setDetail({})
	}

	useEffect(() => {
		if (isSuccess || isError) {
			cancel()
			reset()
		}
	}, [isSuccess, isError])

	useEffect(() => {
		if (detail) {
			setId(detail.id)
			setName(detail.name)
		}
	}, [detail])
	return (
		<form
			onSubmit={addHandler}
			className='rounded border bg-white p-2 d-flex flex-column gap-2'>
			<p className='m-0 h6'>Jenis Penilaian</p>

			<input
				type='text'
				name='name'
				id='name'
				className='form-control'
				placeholder='Nama Ujian'
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
				<button type='submit' className='btn btn-sm btn-success'>
					Simpan
				</button>
			</div>
		</form>
	)
}

export default Form
