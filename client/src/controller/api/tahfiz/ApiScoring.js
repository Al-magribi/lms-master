import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiScoring = createApi({
	reducerPath: "ApiScoring",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/scoring",
		credentials: "include",
	}),
	tagTypes: ["target"],
	endpoints: (builder) => ({
		getGrades: builder.query({
			query: () => "/get-grades",
		}),
		getTargets: builder.query({
			query: () => "/get-targets",
			providesTags: ["target"],
		}),
		addTarget: builder.mutation({
			query: (target) => ({
				url: "/add-target",
				method: "POST",
				body: target,
			}),
			invalidatesTags: ["target"],
		}),
		deleteTarget: builder.mutation({
			query: (id) => ({
				url: "/delete-target",
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["target"],
		}),
		getStudents: builder.query({
			query: ({ page, limit, search, homebaseId, gradeId, classId }) => ({
				url: "/get-students",
				method: "GET",
				params: { page, limit, search, homebaseId, gradeId, classId },
			}),
		}),
		getFilter: builder.query({
			query: () => ({
				url: "/get-filter",
				method: "GET",
			}),
		}),
		getCategories: builder.query({
			query: () => ({
				url: "/get-categories",
				method: "GET",
			}),
		}),
		addscore: builder.mutation({
			query: (body) => ({
				url: "/add-score",
				method: "POST",
				body,
			}),
		}),
	}),
})

export const {
	useGetTargetsQuery,
	useGetGradesQuery,
	useAddTargetMutation,
	useDeleteTargetMutation,
	useGetStudentsQuery,
	useGetFilterQuery,
	useGetCategoriesQuery,
	useAddscoreMutation,
} = ApiScoring
