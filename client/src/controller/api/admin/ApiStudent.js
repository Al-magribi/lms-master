import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiClass } from "./ApiClass";

export const ApiStudent = createApi({
  reducerPath: "ApiStudent",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/student",
    credentials: "include",
  }),
  tagTypes: ["students"],
  endpoints: (builder) => ({
    addStudent: builder.mutation({
      query: (body) => ({
        url: "/add-student",
        method: "POST",
        body,
      }),
      invalidatesTags: ["students"],
    }),
    getStudents: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-students",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["students"],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: "/delete-student",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["students"],
    }),
    uploadStudents: builder.mutation({
      query: (body) => ({
        url: "/upload-students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["students"],
    }),
    changeStatus: builder.mutation({
      query: (id) => ({
        url: "/change-status",
        method: "PUT",
        params: { id },
      }),
      invalidatesTags: ["students"],
    }),
    graduated: builder.mutation({
      query: (classid) => ({
        url: "/graduated",
        method: "PUT",
        params: { classid },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(ApiClass.util.invalidateTags(["students", "class"]));
        } catch {
          // Handle error if needed
        }
      },
    }),
    changePeriode: builder.mutation({
      query: (body) => ({
        url: "/change-periode",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useAddStudentMutation,
  useGetStudentsQuery,
  useDeleteStudentMutation,
  useUploadStudentsMutation,
  useChangeStatusMutation,
  useGraduatedMutation,
  useChangePeriodeMutation,
} = ApiStudent;
