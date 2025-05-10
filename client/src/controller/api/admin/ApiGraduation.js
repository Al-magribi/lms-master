import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiGraduation = createApi({
  reducerPath: "ApiGraduation",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/admin/graduation` }),
  tagTypes: ["graduation"],
  endpoints: (builder) => ({
    getGraduation: builder.query({
      query: ({ page, limit, search }) =>
        `/get-data?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["graduation"],
    }),
    addGraduation: builder.mutation({
      query: (data) => ({
        url: "/add-data",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["graduation"],
    }),
    deleteGraduation: builder.mutation({
      query: (id) => ({
        url: `/delete-data?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["graduation"],
    }),
    getStudents: builder.query({
      query: () => "/get-students",
      providesTags: ["graduation"],
    }),
  }),
});

export const {
  useGetGraduationQuery,
  useAddGraduationMutation,
  useDeleteGraduationMutation,
  useGetStudentsQuery,
} = ApiGraduation;
