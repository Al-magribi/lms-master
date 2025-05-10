import React, { useState } from "react"
import {
	useDeleteCategoryMutation,
	useDeleteIndicatorMutation,
	useGetCategoriesQuery,
} from "../../../controller/api/tahfiz/ApiMetric"
import Table from "../../../components/table/Table"
import toast from "react-hot-toast"

const TableData = ({ setCategory, setIndicator }) => {
	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [search, setSearch] = useState("")

	const { data = {}, isLoading } = useGetCategoriesQuery({
		page,
		limit,
		search,
	})
	const { categories = [], totalData, totalPage } = data
	const [deleteCategory, { isLoading: catLoading }] =
		useDeleteCategoryMutation()
	const [deleteIndicator, { isLoading: indiLoading }] =
		useDeleteIndicatorMutation()

	const removeCat = (id) => {
		toast.promise(
			deleteCategory(id)
				.unwrap()
				.then((res) => res.message),
			{
				loading: "Menghapus kategori...",
				success: (message) => message,
				error: (error) => error.data.message,
			}
		)
	}

	const removeIndi = (id) => {
		toast.promise(
			deleteIndicator(id)
				.unwrap()
				.then((res) => res.message),
			{
				loading: "Menghapus indikator...",
				success: (message) => message,
				error: (error) => error.data.message,
			}
		)
	}

	return (
		<Table
			isLoading={isLoading}
			page={page}
			setPage={setPage}
			totalPage={totalPage}
			totalData={totalData}
			limit={limit}
			setLimit={setLimit}
			search={search}
			setSearch={setSearch}>
			<table className='mb-0 table table-bordered table-hover table-striped'>
				<thead>
					<tr>
						<th className='text-center'>No</th>
						<th className='text-center'>Kategori</th>
						<th className='text-center'>Indikator</th>
						<th className='text-center'>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{categories?.map((item, i) => (
						<tr key={i}>
							<th scope='col' className='text-center align-middle'>
								{(page - 1) * limit + i + 1}
							</th>
							<td className='align-middle'>{item.name}</td>

							<td className='align-middle'>
								<div className='d-flex flex-column gap-2'>
									{item.indicators.filter((indi) => indi !== null).length >
									0 ? (
										item.indicators
											.filter((indi) => indi !== null)
											.map((indi, i) => (
												<div
													key={i}
													className='d-flex align-items-center justify-content-between p-2 rounded border border-2 pointer'>
													<p className='m-0'>{indi.name}</p>

													<div className='d-flex align-items-center gap-2'>
														{/* Edit Button */}
														<button
															className='btn btn-sm btn-warning'
															onClick={() => setIndicator(indi)}>
															<i className='bi bi-pencil-square'></i>
														</button>

														{/* Delete Button */}
														<button
															className='btn btn-sm btn-danger'
															onClick={() => removeIndi(indi.id)}>
															<i className='bi bi-x text-white'></i>
														</button>
													</div>
												</div>
											))
									) : (
										<p className='m-0 text-muted'>
											Belum ada indikator untuk kategori ini
										</p>
									)}
								</div>
							</td>

							<td className='align-middle'>
								<div className='d-flex justify-content-center gap-2'>
									<button
										className='btn btn-sm btn-warning'
										onClick={() => setCategory(item)}>
										<i className='bi bi-pencil-square'></i>
									</button>
									<button
										className='btn btn-sm btn-danger'
										onClick={() => removeCat(item.id)}>
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
