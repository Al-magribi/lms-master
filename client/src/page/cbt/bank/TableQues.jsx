import { useState } from "react"
import {
	useDeleteQuestionMutation,
	useGetQuestionsQuery,
} from "../../../controller/api/cbt/ApiBank"
import Table from "../../../components/table/Table"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

const createMarkup = (html) => {
	return { __html: html }
}

const TableQues = ({ subject, name, bankid }) => {
	const navigate = useNavigate()

	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [search, setSearch] = useState("")

	const { data: rawData = {}, isLoading: dataLoading } = useGetQuestionsQuery({
		page,
		limit,
		search,
		bankid: bankid,
	})
	const { totalData, totalPages, questions = [] } = rawData

	const [deleteQuestion, { isLoading }] = useDeleteQuestionMutation()

	const deleteHandler = (id) => {
		toast.promise(
			deleteQuestion(id)
				.unwrap()
				.then((res) => res.message),
			{
				loading: "Memproses...",
				success: (message) => message,
				error: (err) => err.data.message,
			}
		)
	}

	const goToLink = (questionid) => {
		const nameFormat = name.replace(/[\s/]/g, "-")
		const subjectFormat = subject.replace(/[\s/]/g, "-")
		navigate(
			`/admin-cbt-bank/${subjectFormat}/${nameFormat}/${bankid}/${questionid}/edit-soal`
		)
	}

	return (
		<Table
			page={page}
			setPage={setPage}
			setLimit={setLimit}
			setSearch={setSearch}
			totalData={totalData}
			totalPages={totalPages}
			isLoading={dataLoading}>
			<table className='table table-bordered table-striped table-hover mb-0'>
				<thead>
					<tr>
						<th className='text-center'>No</th>
						<th className='text-center'>Jenis</th>
						<th className='text-center'>Pertanyaan</th>
						<th className='text-center'>A</th>
						<th className='text-center'>B</th>
						<th className='text-center'>C</th>
						<th className='text-center'>D</th>
						<th className='text-center'>E</th>
						<th className='text-center'>Jawaban</th>
						<th className='text-center'>Poin</th>
						<th className='text-center'>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{questions?.length > 0 ? (
						questions?.map((item, index) => (
							<tr key={item.id}>
								<td className='text-center'>
									{(page - 1) * limit + index + 1}
								</td>
								<td className='text-center'>
									{item.qtype == 1 ? "PG" : "Essay"}
								</td>
								<td>
									<p dangerouslySetInnerHTML={createMarkup(item.question)} />
								</td>
								<td>
									<p dangerouslySetInnerHTML={createMarkup(item.a)} />
								</td>
								<td>
									<p dangerouslySetInnerHTML={createMarkup(item.b)} />
								</td>
								<td>
									<p dangerouslySetInnerHTML={createMarkup(item.c)} />
								</td>
								<td>
									<p dangerouslySetInnerHTML={createMarkup(item.d)} />
								</td>
								<td>
									<p dangerouslySetInnerHTML={createMarkup(item.e)} />
								</td>
								<td className='text-center'>{item.qkey}</td>
								<td className='text-center'>{item.poin}</td>
								<td className='text-center'>
									<div className='d-flex justify-content-center gap-2'>
										<button
											className='btn btn-sm btn-warning'
											onClick={() => goToLink(item.id)}>
											<i className='bi bi-pencil'></i>
										</button>
										<button
											className='btn btn-sm btn-danger'
											disabled={isLoading}
											onClick={() => deleteHandler(item.id)}>
											<i className='bi bi-trash'></i>
										</button>
									</div>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={11}>Data belum tersedia</td>
						</tr>
					)}
				</tbody>
			</table>
		</Table>
	)
}

export default TableQues
