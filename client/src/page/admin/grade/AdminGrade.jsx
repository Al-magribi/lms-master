import { useState } from "react"
import Layout from "../../../components/layout/Layout"
import Form from "./Form"
import TableData from "./TableData"

const AdminGrade = () => {
	const [detail, setDetai] = useState("")

	return (
		<Layout title={"Tingkat Pendidikan"} levels={["admin"]}>
			<div className='row g-2'>
				<div className='col-lg-3 col-12'>
					<Form detail={detail} setDetail={setDetai} />
				</div>
				<div className='col-lg-9 col-12'>
					<TableData setDetail={setDetai} />
				</div>
			</div>
		</Layout>
	)
}

export default AdminGrade
