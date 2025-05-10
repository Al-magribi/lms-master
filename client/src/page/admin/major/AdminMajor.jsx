import { useState } from "react"
import Layout from "../../../components/layout/Layout"
import Form from "./Form"
import TableData from "./TableData"

const AdminMajor = () => {
	const [detail, setDetail] = useState("")
	return (
		<Layout title={"Jurusan"} levels={["admin"]}>
			<div className='row g-2'>
				<div className='col-lg-3 col-2'>
					<Form detail={detail} setDetail={setDetail} />
				</div>
				<div className='col-lg-9 col-2'>
					<TableData setDetail={setDetail} />
				</div>
			</div>
		</Layout>
	)
}

export default AdminMajor
