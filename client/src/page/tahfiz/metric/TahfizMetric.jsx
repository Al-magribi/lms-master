import React, { useState } from "react"
import Layout from "../../../components/layout/Layout"
import FormCat from "./FormCat"
import FormInd from "./FormInd"
import TableData from "./TableData"

const TahfizMetric = () => {
	const [category, setCategory] = useState({})
	const [indicator, setIndicator] = useState({})

	return (
		<Layout title={"Metrik Penilaian"} levels={["tahfiz"]}>
			<div className='row g-2'>
				<div className='col-lg-3 col-12'>
					<FormCat category={category} setCategory={setCategory} />

					<FormInd indicator={indicator} setIndicator={setIndicator} />
				</div>
				<div className='col-lg-9 col-12'>
					<TableData setCategory={setCategory} setIndicator={setIndicator} />
				</div>
			</div>
		</Layout>
	)
}

export default TahfizMetric
