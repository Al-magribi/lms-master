import React, { useCallback } from "react"
import { useUpdateContentOrderMutation } from "../../../controller/api/lms/ApiChapter"
import ContentCard from "./ContentCard"
import update from "immutability-helper"

const ContentList = ({ contents, chapterId }) => {
	const [updateContentOrder] = useUpdateContentOrderMutation()
	const [contentList, setContentList] = React.useState(contents)

	React.useEffect(() => {
		setContentList(contents)
	}, [contents])

	const moveContent = useCallback((dragIndex, hoverIndex) => {
		setContentList((prevCards) =>
			update(prevCards, {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, prevCards[dragIndex]],
				],
			})
		)
	}, [])

	const handleDrop = async () => {
		try {
			await updateContentOrder({
				contents: contentList,
			}).unwrap()
		} catch (error) {
			console.error("Failed to update content order:", error)
		}
	}

	return (
		<div className='d-flex flex-column gap-2' onDragEnd={handleDrop}>
			{contentList?.length > 0 ? (
				contentList?.map((content, index) => (
					<ContentCard
						key={content.content_id}
						id={content.content_id}
						index={index}
						moveContent={moveContent}
						chapterId={chapterId}
						content={{
							content_id: content.content_id,
							content_title: content.content_title,
							content_target: content.content_target,
							files: content.files || [],
							videos: content.videos || [],
						}}
					/>
				))
			) : (
				<div className='text-secondary'>Materi Belum Tesedia</div>
			)}
		</div>
	)
}

export default ContentList
