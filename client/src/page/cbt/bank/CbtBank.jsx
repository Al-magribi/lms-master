import React, { useState } from "react"
import Form from "./Form"
import TableBank from "./TableBank"

const CbtBank = () => {
	const [detail, setDetail] = useState("")
	return (
		<div className='row g-2'>
			<div className='col-lg-3 col-12'>
				<Form detail={detail} setDetail={setDetail} />
			</div>
			<div className='col-lg-9 col-12'>
				<TableBank setDetail={setDetail} />
			</div>
		</div>
	)
}

export default CbtBank
