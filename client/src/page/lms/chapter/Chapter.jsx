import React from "react"

const createMarkup = (html) => {
	return { __html: html }
}

const Chapter = ({ item }) => {
	return (
		<>
			<h5 className='card-title'>{item.chapter_name}</h5>
			<p
				className='card-text'
				dangerouslySetInnerHTML={createMarkup(item.target)}
			/>
		</>
	)
}

export default Chapter
