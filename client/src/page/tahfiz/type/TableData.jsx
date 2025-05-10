import React, { useState } from "react"
import {
	useGetTypesQuery,
	useDeleteTypeMutation,
} from "../../../controller/api/tahfiz/ApiMetric"
import Table from "../../../components/table/Table"
import { toast } from "react-hot-toast"

const TableData = ({ setDetail }) => {
	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [search, setSearch] = useState("")

	const { data: rawData = {}, isLoading } = useGetTypesQuery({
		page,
		limit,
		search,
	})
	const { types = [], totalData, totalPages } = rawData
	const [deleteType, { isLoading: isDeleting }] = useDeleteTypeMutation()

	const deleteHandler = (id) => {
		toast.promise(
			deleteType(id)
				.unwrap()
				.then((res) => res.message),
			{
				loading: "Memuat data...",
				success: (message) => message,
				error: (err) => err.data.message,
			}
		)
	}

	return (
		<Table
			isLoading={isLoading}
			page={page}
			setPage={setPage}
			totalPages={totalPages}
			limit={limit}
			setLimit={setLimit}
			setSearch={setSearch}
			totalData={totalData}>
			<table className='mb-0 table table-hover table-striped table-bordered'>
				<thead>
					<tr>
						<td className='text-center'>No</td>
						<td className='text-center'>Penilaian</td>
						<td className='text-center'>Aksi</td>
					</tr>
				</thead>
				<tbody>
					{types?.map((item, i) => (
						<tr key={i}>
							<td className='text-center align-middle'>
								{(page - 1) * limit + i + 1}
							</td>
							<td className='align-middle'>{item.name}</td>
							<td className='align-middle'>
								<div className='d-flex justify-content-center gap-2'>
									<button
										className='btn btn-sm btn-warning'
										onClick={() => setDetail(item)}>
										<i className='bi bi-pencil-square'></i>
									</button>
									<button
										className='btn btn-sm btn-danger'
										onClick={() => deleteHandler(item.id)}>
										<i className='bi bi-trash'></i>
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</Table>
	)
}

export default TableData
