import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiMetric = createApi({
	reducerPath: "ApiMetric",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/metrics",
		credentials: "include",
	}),
	tagTypes: ["metrics", "types"],
	endpoints: (builder) => ({
		getCategories: builder.query({
			query: ({ page, limit, search }) => ({
				url: "/get-categories",
				method: "GET",
				params: { page, limit, search },
			}),
			providesTags: ["metrics"],
		}),
		addCategory: builder.mutation({
			query: (body) => ({
				url: "/add-category",
				method: "POST",
				body,
			}),
			invalidatesTags: ["metrics"],
		}),
		deleteCategory: builder.mutation({
			query: (id) => ({
				url: `/delete-category/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["metrics"],
		}),
		addIndicator: builder.mutation({
			query: (body) => ({
				url: "/add-indicator",
				method: "POST",
				body,
			}),
			invalidatesTags: ["metrics"],
		}),
		deleteIndicator: builder.mutation({
			query: (id) => ({
				url: `/delete-indicator/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["metrics"],
		}),
		getTypes: builder.query({
			query: ({ page, limit, search }) => ({
				url: "/get-types",
				method: "GET",
				params: { page, limit, search },
			}),
			providesTags: ["types"],
		}),
		addType: builder.mutation({
			query: (body) => ({
				url: "/add-type",
				method: "POST",
				body,
			}),
			invalidatesTags: ["types"],
		}),
		deleteType: builder.mutation({
			query: (id) => ({
				url: `/delete-type/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["types"],
		}),
	}),
})

export const {
	useGetCategoriesQuery,
	useAddCategoryMutation,
	useDeleteCategoryMutation,
	useAddIndicatorMutation,
	useDeleteIndicatorMutation,
	useGetTypesQuery,
	useAddTypeMutation,
	useDeleteTypeMutation,
} = ApiMetric
