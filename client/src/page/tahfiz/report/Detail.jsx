import React, { useRef } from "react"

const Detail = ({ detail, setDetail, id }) => {
	const modalRef = useRef(null)

	const closeModal = () => {
		setDetail("")
	}

	return (
		<div
			ref={modalRef}
			className='modal fade'
			id={`modal-${id}`}
			data-bs-backdrop='static'
			data-bs-keyboard='false'
			tabIndex='-1'
			aria-labelledby='staticBackdropLabel'
			aria-hidden='true'>
			<div className='modal-dialog modal-lg modal-dialog-scrollable'>
				<div className='modal-content'>
					<div className='modal-header bg-primary text-white'>
						<h1 className='modal-title fs-5' id='staticBackdropLabel'>
							{detail?.name}
						</h1>
						<button
							type='button'
							className='btn-close btn-close-white'
							data-bs-dismiss='modal'
							aria-label='Close'
							onClick={closeModal}></button>
					</div>
					<div className='modal-body'>
						<div className='row g-2 mb-3'>
							<div className='col-lg-3 col-6'>
								<div className='card bg-light'>
									<div className='card-body p-2'>
										<small className='text-muted'>Jenis Penilaian</small>
										<p className='mb-0'>{detail?.type}</p>
									</div>
								</div>
							</div>
							<div className='col-lg-3 col-6'>
								<div className='card bg-light'>
									<div className='card-body p-2'>
										<small className='text-muted'>Penguji</small>
										<p className='mb-0'>{detail?.examiner}</p>
									</div>
								</div>
							</div>
							<div className='col-lg-3 col-6'>
								<div className='card bg-light'>
									<div className='card-body p-2'>
										<small className='text-muted'>Nilai</small>
										<p className='mb-0'>{detail?.totalPoints}</p>
									</div>
								</div>
							</div>
							<div className='col-lg-3 col-6'>
								<div className='card bg-light'>
									<div className='card-body p-2'>
										<small className='text-muted'>Tanggal</small>
										<p className='mb-0'>
											{new Date(detail?.date).toLocaleDateString()}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Data Scores */}
						<div className='mb-3'>
							<p className='m-0 h6'>Detail Penilaian</p>
							<div className='table-responsive'>
								<table className='table table-bordered table-hover table-striped'>
									<thead>
										<tr>
											<th className='text-center'>Kategori</th>
											<th className='text-center'>Nilai</th>
											<th className='text-center'>Indikator</th>
										</tr>
									</thead>
									<tbody>
										{detail?.scores?.map((score, index) => (
											<tr key={index}>
												<td className='align-middle'>{score.category}</td>
												<td className='text-center align-middle'>
													{score.poin}
												</td>
												<td>
													{score.indicators?.length > 0 ? (
														<table className='table table-sm mb-0'>
															<tbody>
																{score.indicators.map((indicator, index) => (
																	<tr key={index}>
																		<td>{indicator.indicator}</td>
																		<td className='text-center'>
																			{indicator.poin || "-"}
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													) : (
														<div className='text-center'>-</div>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Data Surah */}
						<div>
							<p className='m-0 h6'>Daftar Surah</p>
							<div className='table-responsive'>
								<table className='table table-bordered table-hover table-striped'>
									<thead>
										<tr>
											<th>Surah</th>
											<th>Ayat</th>
											<th>Baris</th>
										</tr>
									</thead>
									<tbody>
										{detail?.surahs?.map((surah, index) => (
											<tr key={index}>
												<td>{surah.name}</td>
												<td>{`${surah.from_ayat} - ${surah.to_ayat}`}</td>
												<td>{`${surah.from_line} - ${surah.to_line}`}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div className='modal-footer'>
						<button
							type='button'
							className='btn btn-secondary'
							data-bs-dismiss='modal'
							onClick={closeModal}>
							Tutup
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Detail
