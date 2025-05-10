import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiHomebase = createApi({
	reducerPath: "ApiHomebase",
	baseQuery: fetchBaseQuery({
		baseUrl: `/api/center/homebase`,
		credential: "include",
	}),
	tagTypes: ["homebase"],
	endpoints: (builder) => ({
		getHomebase: builder.query({
			query: ({ page, limit, search }) => ({
				url: "/get-homebase",
				method: "GET",
				params: { page, limit, search },
			}),
			providesTags: ["homebase"],
		}),
		addHomebase: builder.mutation({
			query: (body) => ({
				url: "/add-homebase",
				method: "POST",
				body,
			}),
			invalidatesTags: ["homebase"],
		}),
		deleteHomebase: builder.mutation({
			query: (id) => ({
				url: "/delete-homebase",
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["homebase"],
		}),
	}),
})

export const {
	useGetHomebaseQuery,
	useAddHomebaseMutation,
	useDeleteHomebaseMutation,
} = ApiHomebase
