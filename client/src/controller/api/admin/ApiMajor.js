import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiMajor = createApi({
	reducerPath: "ApiMajor",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/admin/major",
		credentials: "include",
	}),
	tagTypes: ["major"],
	endpoints: (builder) => ({
		addMajor: builder.mutation({
			query: (body) => ({
				url: "/add-major",
				method: "POST",
				body,
			}),
			invalidatesTags: ["major"],
		}),
		getMajor: builder.query({
			query: ({ page, limit, search }) => ({
				url: "/get-major",
				method: "GET",
				params: { page, limit, search },
			}),
			providesTags: ["major"],
		}),
		deleteMajor: builder.mutation({
			query: (id) => ({
				url: "/delete-major",
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["major"],
		}),
	}),
})

export const { useAddMajorMutation, useGetMajorQuery, useDeleteMajorMutation } =
	ApiMajor
