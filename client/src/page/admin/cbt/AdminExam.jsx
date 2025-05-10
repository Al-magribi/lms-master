import React from "react"
import Layout from "../../../components/layout/Layout"
import CbtExam from "../../cbt/exam/CbtExam"

const AdminExam = () => {
	return (
		<Layout title={"Daftar Ujian"} levels={["admin"]}>
			<CbtExam />
		</Layout>
	)
}

export default AdminExam
