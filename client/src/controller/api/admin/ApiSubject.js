import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiSubject = createApi({
  reducerPath: "ApiSubject",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/subject",
    credentials: "include",
  }),
  tagTypes: ["Subjects"],
  endpoints: (builder) => ({
    getSubject: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-subjects`,
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["Subjects"],
    }),
    addSubject: builder.mutation({
      query: (body) => ({
        url: "/add-subject",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subjects"],
    }),
    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `/delete-subject`,
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["Subjects"],
    }),
    uploadSubjects: builder.mutation({
      query: (body) => ({
        url: "/upload-subjects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subjects"],
    }),
  }),
});

export const {
  useGetSubjectQuery,
  useAddSubjectMutation,
  useDeleteSubjectMutation,
  useUploadSubjectsMutation,
} = ApiSubject;
