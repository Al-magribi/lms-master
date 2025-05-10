import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiClass = createApi({
  reducerPath: "ApiClass",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/class",
    credentials: "include",
  }),
  tagTypes: ["class", "students"],
  endpoints: (builder) => ({
    getClass: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-class`,
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["class"],
    }),
    addClass: builder.mutation({
      query: (data) => ({
        url: "/add-class",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["class"],
    }),
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/delete-class`,
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["class"],
    }),
    getStudentsInClass: builder.query({
      query: ({ page, limit, search, classid }) => ({
        url: "/get-students",
        method: "GET",
        params: { page, limit, search, classid },
      }),
      providesTags: ["students"],
    }),
    addStudent: builder.mutation({
      query: (body) => ({
        url: "/add-student",
        method: "POST",
        body,
      }),
      invalidatesTags: ["students", "class"],
    }),
    uploadStudents: builder.mutation({
      query: (body) => ({
        url: "/upload-students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["students", "class"],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: "/delete-student",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["students", "class"],
    }),
  }),
});

export const {
  useGetClassQuery,
  useAddClassMutation,
  useDeleteClassMutation,
  useGetStudentsInClassQuery,
  useAddStudentMutation,
  useUploadStudentsMutation,
  useDeleteStudentMutation,
} = ApiClass;
