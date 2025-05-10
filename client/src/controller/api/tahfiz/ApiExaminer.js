import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiExaminer = createApi({
  reducerPath: "ApiExaminer",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/examiner",
    credentials: "include",
  }),
  tagTypes: ["examniers"],
  endpoints: (builder) => ({
    getExaminers: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-examiners",
        params: { page, limit, search },
        method: "GET",
      }),
      providesTags: ["examniers"],
    }),
    addExaminer: builder.mutation({
      query: (body) => ({
        url: "/add-examiner",
        method: "POST",
        body,
      }),
      invalidatesTags: ["examniers"],
    }),
    deleteExaminer: builder.mutation({
      query: (id) => ({
        url: `/delete-examiner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["examniers"],
    }),
  }),
});

export const {
  useGetExaminersQuery,
  useAddExaminerMutation,
  useDeleteExaminerMutation,
} = ApiExaminer;
