import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiTeacher = createApi({
	reducerPath: "ApiTeacher",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/admin/teacher",
		credentials: "include",
	}),
	tagTypes: ["teacher"],
	endpoints: (builder) => ({
		addTeacher: builder.mutation({
			query: (body) => ({
				url: "/add-teacher",
				method: "POST",
				body,
			}),
			invalidatesTags: ["teacher"],
		}),
		getTeachers: builder.query({
			query: ({ page, limit, search }) => ({
				url: "/get-teachers",
				method: "GET",
				params: { page, limit, search },
			}),
			providesTags: ["teacher"],
		}),
		deleteTeacher: builder.mutation({
			query: (id) => ({
				url: "/delete-teacher",
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["teacher"],
		}),
		uploadTeachers: builder.mutation({
			query: (body) => ({
				url: "/upload-teachers",
				method: "POST",
				body,
			}),
			invalidatesTags: ["teacher"],
		}),
	}),
})

export const {
	useAddTeacherMutation,
	useGetTeachersQuery,
	useDeleteTeacherMutation,
	useUploadTeachersMutation,
} = ApiTeacher
