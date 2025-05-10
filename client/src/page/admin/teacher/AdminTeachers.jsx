import { useState } from "react"
import Layout from "../../../components/layout/Layout"
import Form from "./Form"
import Upload from "./Upload"
import TableData from "./TableData"

const AdminTeachers = () => {
	const [detail, setDetail] = useState({})

	return (
		<Layout title={"Guru"} levels={["admin"]}>
			<div className='row g-2'>
				<div className='col-lg-3 col-12'>
					<Form detail={detail} setDetail={setDetail} />

					<Upload />
				</div>
				<div className='col-lg-9 col-12'>
					<TableData setDetail={setDetail} />
				</div>
			</div>
		</Layout>
	)
}

export default AdminTeachers
