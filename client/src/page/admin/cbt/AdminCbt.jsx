import React from "react"
import Layout from "../../../components/layout/Layout"
import CbtBank from "../../cbt/bank/CbtBank"

const AdminCbt = () => {
	return (
		<Layout title={"Daftar Bank Soal"} levels={["admin"]}>
			<CbtBank />
		</Layout>
	)
}

export default AdminCbt
