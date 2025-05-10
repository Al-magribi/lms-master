import React, { useState } from "react"
import Layout from "../../../components/layout/Layout"
import TableData from "./TableData"
import { useGetFilterQuery } from "../../../controller/api/tahfiz/ApiScoring"

const TahfizMemo = () => {
	const [homebaseId, setHomebase] = useState("")
	const [gradeId, setGrade] = useState("")
	const [classId, setClass] = useState("")

	const { data = {} } = useGetFilterQuery()
	const { homebases = [], grades = [], classes = [] } = data

	const handleReset = () => {
		setHomebase("")
		setGrade("")
		setClass("")
	}

	return (
		<Layout title={"Hafalan"} levels={["tahfiz"]}>
			<div className='row g-2'>
				<div className='col-12'>
					<div className='row g-2'>
						<div className='col-lg-3 col-12'>
							<select
								name='homebase'
								id='homebase'
								className='form-select bg-white'
								value={homebaseId || ""}
								onChange={(e) => setHomebase(e.target.value)}>
								<option value='' hidden>
									Pilih Satuan
								</option>
								{homebases.map((item) => (
									<option value={item.id} key={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</div>

						<div className='col-lg-3 col-12'>
							<select
								name='grade'
								id='grade'
								className='form-select bg-white'
								value={gradeId || ""}
								onChange={(e) => setGrade(e.target.value)}>
								<option value='' hidden>
									Pilih Tingkat
								</option>
								{grades.map((item) => (
									<option value={item.id} key={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</div>

						<div className='col-lg-3 col-6'>
							<select
								name='class'
								id='class'
								className='form-select bg-white'
								value={classId || ""}
								onChange={(e) => setClass(e.target.value)}>
								<option value='' hidden>
									Pilih Kelas
								</option>
								{classes.map((item) => (
									<option value={item.id} key={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</div>

						<div className='col-lg-3 col-6 d-flex justify-content-start align-items-center'>
							<button className='btn btn-sm btn-danger' onClick={handleReset}>
								<i className='bi bi-recycle'></i>
							</button>
						</div>
					</div>
				</div>

				<div className='col-12'>
					<TableData
						homebaseId={homebaseId}
						gradeId={gradeId}
						classId={classId}
					/>
				</div>
			</div>
		</Layout>
	)
}

export default TahfizMemo
