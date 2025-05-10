import React, { useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import {
	useGetChaptersQuery,
	useUpdateChapterOrderMutation,
} from "../../../controller/api/lms/ApiChapter"
import ChapterCard from "./ChapterCard"

const Chapters = ({ setDetail }) => {
	const { id } = useParams()
	const { data: initialData, isLoading } = useGetChaptersQuery(id, {
		skip: !id,
	})
	const [chapters, setChapters] = useState([])
	const [updateChapterOrder] = useUpdateChapterOrderMutation()

	React.useEffect(() => {
		if (initialData) {
			setChapters(initialData)
		}
	}, [initialData])

	const moveCard = useCallback(
		(dragIndex, hoverIndex) => {
			setChapters((prevCards) => {
				const newCards = [...prevCards]
				const dragCard = newCards[dragIndex]
				newCards.splice(dragIndex, 1)
				newCards.splice(hoverIndex, 0, dragCard)

				// Format data sesuai dengan kebutuhan backend
				const chaptersData = newCards.map((card) => ({
					chapter_id: card.chapter_id,
				}))

				// Kirim ke backend
				updateChapterOrder({ chapters: chaptersData }).unwrap()

				return newCards
			})
		},
		[updateChapterOrder]
	)

	if (isLoading) return <div>Loading...</div>

	return (
		<DndProvider backend={HTML5Backend}>
			<div className='row g-2'>
				{chapters?.length > 0 ? (
					chapters.map((item, index) => (
						<ChapterCard
							key={item.chapter_id || index}
							index={index}
							id={item.chapter_id}
							item={item}
							moveCard={moveCard}
							setDetail={setDetail}
						/>
					))
				) : (
					<div className='col-12'>
						<div className='card'>
							<div className='card-body'>
								<h5 className='card-title m-0'>Data belum tersedia</h5>
							</div>
						</div>
					</div>
				)}
			</div>
		</DndProvider>
	)
}

export default Chapters
