import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiGrade = createApi({
	reducerPath: "ApiGrade",
	baseQuery: fetchBaseQuery({
		baseUrl: `/api/admin/grade`,
		credentials: "include",
	}),
	tagTypes: ["grade"],
	endpoints: (builder) => ({
		addGrade: builder.mutation({
			query: (body) => ({
				url: `/add-grade`,
				method: "POST",
				body,
			}),
			invalidatesTags: ["grade"],
		}),
		getGrade: builder.query({
			query: ({ page, limit, search }) => ({
				url: `/get-grade`,
				method: "GET",
				params: { page, limit, search },
			}),
			providesTags: ["grade"],
		}),
		deleteGrade: builder.mutation({
			query: (id) => ({
				url: `/delete-grade`,
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["grade"],
		}),
	}),
})

export const { useAddGradeMutation, useGetGradeQuery, useDeleteGradeMutation } =
	ApiGrade
