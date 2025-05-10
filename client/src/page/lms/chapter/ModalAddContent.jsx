import React, { useState, useEffect } from "react"
import { useAddContentMutation } from "../../../controller/api/lms/ApiChapter"
import { toast } from "react-hot-toast"

const ModalAddContent = ({ chapter, modalId, selectedContent = null }) => {
	const [title, setTitle] = useState("")
	const [content, setContent] = useState("")
	const [addContent] = useAddContentMutation()

	useEffect(() => {
		if (selectedContent) {
			setTitle(selectedContent.content_title)
			setContent(selectedContent.content_target)
		} else {
			setTitle("")
			setContent("")
		}
	}, [selectedContent])

	const handleSubmit = async (e) => {
		e.preventDefault()

		const saveContent = async () => {
			const contentResult = await addContent({
				chapterid: chapter.chapter_id,
				contentid: selectedContent?.content_id,
				title,
				content,
			}).unwrap()

			// Reset form after successful save
			setTitle("")
			setContent("")

			// Close modal
			document.getElementById(modalId).querySelector(".btn-close").click()

			return contentResult.message
		}

		toast.promise(saveContent(), {
			loading: selectedContent
				? "Memperbarui materi..."
				: "Menyimpan materi...",
			success: (message) => message,
			error: (err) => err.data?.message || "Terjadi kesalahan",
		})
	}

	return (
		<div
			className='modal fade'
			id={modalId}
			data-bs-backdrop='static'
			data-bs-keyboard='false'
			tabIndex='-1'
			aria-labelledby='staticBackdropLabel'
			aria-hidden='true'>
			<div className='modal-dialog'>
				<div className='modal-content'>
					<div className='modal-header'>
						<h1 className='modal-title fs-5' id='staticBackdropLabel'>
							{selectedContent ? "Edit" : "Tambah"} Materi{" "}
							<span>{chapter.chapter_name}</span>
						</h1>
						<button
							type='button'
							className='btn-close'
							data-bs-dismiss='modal'
							aria-label='Close'></button>
					</div>
					<form onSubmit={handleSubmit}>
						<div className='modal-body d-flex flex-column gap-2'>
							<input
								type='text'
								name='title'
								id='title'
								className='form-control'
								placeholder='Judul Materi'
								required
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>

							<div className='form-floating'>
								<textarea
									className='form-control'
									placeholder='Leave a comment here'
									id='floatingTextarea'
									required
									value={content}
									onChange={(e) => setContent(e.target.value)}></textarea>
								<label htmlFor='floatingTextarea' className='text-secondary'>
									Capaian
								</label>
							</div>
						</div>
						<div className='modal-footer'>
							<button
								type='button'
								className='btn btn-danger'
								data-bs-dismiss='modal'>
								Tutup
							</button>
							<button type='submit' className='btn btn-success'>
								{selectedContent ? "Perbarui" : "Simpan"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default ModalAddContent
