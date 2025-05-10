import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiBank = createApi({
	reducerPath: "ApiBank",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/bank",
		credentials: "include",
	}),
	tagTypes: ["teachers", "bank", "question"],
	endpoints: (builder) => ({
		getTeachers: builder.query({
			query: () => ({
				url: "/get-teachers",
				method: "GET",
			}),
			providesTags: ["teachers"],
		}),
		addBank: builder.mutation({
			query: (body) => ({
				url: "/add-bank",
				method: "POST",
				body,
			}),
			invalidatesTags: ["bank"],
		}),
		getBank: builder.query({
			query: ({ page, limit, search }) => ({
				url: "/get-bank",
				method: "GET",
				params: { page, limit, search },
			}),
			providesTags: ["bank"],
		}),
		deleteBank: builder.mutation({
			query: (id) => ({
				url: "/delete-bank",
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["bank"],
		}),
		uploadQuestion: builder.mutation({
			query: ({ body, bankid }) => ({
				url: "/upload-question",
				method: "POST",
				body,
				params: { bankid },
			}),
			invalidatesTags: ["question", "bank"],
		}),
		addQuestion: builder.mutation({
			query: (body) => ({
				url: "/add-question",
				method: "POST",
				body,
			}),
			invalidatesTags: ["question", "bank"],
		}),
		getQuestions: builder.query({
			query: ({ page, limit, search, bankid }) => ({
				url: "/get-questions",
				method: "GET",
				params: { page, limit, search, bankid },
			}),
			providesTags: ["question"],
		}),
		getQuestion: builder.query({
			query: (id) => ({
				url: "/get-question",
				method: "GET",
				params: { id },
			}),
			providesTags: ["question"],
		}),
		deleteQuestion: builder.mutation({
			query: (id) => ({
				url: "/delete-question",
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["question", "bank"],
		}),
		clearBank: builder.mutation({
			query: (bankid) => ({
				url: "/clear-bank",
				method: "DELETE",
				params: { bankid },
			}),
			invalidatesTags: ["question", "bank"],
		}),
	}),
})

export const {
	useGetTeachersQuery,
	useAddBankMutation,
	useGetBankQuery,
	useDeleteBankMutation,
	useAddQuestionMutation,
	useGetQuestionsQuery,
	useGetQuestionQuery,
	useDeleteQuestionMutation,
	useClearBankMutation,
	useUploadQuestionMutation,
} = ApiBank
