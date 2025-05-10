import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiChapter = createApi({
	reducerPath: "ApiChapter",
	baseQuery: fetchBaseQuery({ baseUrl: "/api/chapter" }),
	tagTypes: ["chapter"],
	endpoints: (builder) => ({
		getClasses: builder.query({
			query: () => ({
				url: "/get-class",
				method: "GET",
			}),
		}),
		getChapters: builder.query({
			query: (id) => ({
				url: "/get-chapters",
				method: "GET",
				params: { id },
			}),
			providesTags: ["chapter"],
		}),
		addChapter: builder.mutation({
			query: (data) => ({
				url: "/add-chapter",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["chapter"],
		}),
		deleteChapter: builder.mutation({
			query: (id) => ({
				url: `/delete-chapter`,
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["chapter"],
		}),
		updateChapterOrder: builder.mutation({
			query: (data) => ({
				url: "/update-chapter-order",
				method: "POST",
				body: data,
			}),
		}),
		updateContentOrder: builder.mutation({
			query: (data) => ({
				url: "/update-content-order",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["chapter"],
		}),
		addContent: builder.mutation({
			query: (data) => ({
				url: "/add-content",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["chapter"],
		}),
		addContentFile: builder.mutation({
			query: (formData) => ({
				url: "/add-content-file",
				method: "POST",
				body: formData,
			}),
			invalidatesTags: ["chapter"],
		}),
		deleteFile: builder.mutation({
			query: (id) => ({
				url: `/delete-file`,
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["chapter"],
		}),
		deleteContent: builder.mutation({
			query: (id) => ({
				url: `/delete-content`,
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["chapter"],
		}),
	}),
})

export const {
	useGetClassesQuery,
	useGetChaptersQuery,
	useAddChapterMutation,
	useDeleteChapterMutation,
	useUpdateChapterOrderMutation,
	useUpdateContentOrderMutation,
	useAddContentMutation,
	useAddContentFileMutation,
	useDeleteFileMutation,
	useDeleteContentMutation,
} = ApiChapter
