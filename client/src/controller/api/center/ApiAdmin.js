import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiAdmin = createApi({
	reducerPath: "ApiAdmin",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/center/admin",
		credentials: "include",
	}),
	tagTypes: ["admin"],
	endpoints: (builder) => ({
		getAdmin: builder.query({
			query: ({ page, limit, search }) => ({
				url: "/get-admin",
				method: "GET",
				params: { page, limit, search },
			}),
			providesTags: ["admin"],
		}),
		addAdmin: builder.mutation({
			query: (body) => ({
				url: "/add-admin",
				method: "POST",
				body,
			}),
			invalidatesTags: ["admin"],
		}),
		deleteAdmin: builder.mutation({
			query: (id) => ({
				url: "/delete-admin",
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["admin"],
		}),
		activate: builder.mutation({
			query: (code) => ({
				url: "/activation",
				method: "PUT",
				params: { code },
			}),
		}),
	}),
})

export const {
	useGetAdminQuery,
	useAddAdminMutation,
	useDeleteAdminMutation,
	useActivateMutation,
} = ApiAdmin
