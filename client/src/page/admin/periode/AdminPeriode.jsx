import React, { useState } from "react"
import Layout from "../../../components/layout/Layout"
import Form from "./Form"
import TableData from "./TableData"

const AdminPeriode = () => {
	const [detail, setDetail] = useState("")

	return (
		<Layout title={"Periode Pembelajaran"} levels={["admin"]}>
			<div className='row g-2'>
				<div className='col-lg-3 col-12'>
					<Form detail={detail} setDetail={setDetail} />
				</div>
				<div className='col-lg-9 col-12'>
					<TableData setDetail={setDetail} />
				</div>
			</div>
		</Layout>
	)
}

export default AdminPeriode
