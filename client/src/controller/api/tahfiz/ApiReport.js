import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiReport = createApi({
  reducerPath: "ApiReport",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/report`, credentials: "include" }),
  tagTypes: ["report"],
  endpoints: (builder) => ({
    getReport: builder.query({
      query: ({ page, limit, search, type }) => ({
        url: "/get-all",
        method: "GET",
        params: { page, limit, search, type },
      }),
      providesTags: ["reports"],
    }),
    deleteReport: builder.mutation({
      query: ({ userid, typeId, createdat }) => ({
        url: `/delete-report`,
        params: { userid, typeId, createdat },
        method: "DELETE",
      }),
      invalidatesTags: ["reports"],
    }),
    StudentReport: builder.query({
      query: (nis) => ({
        url: `/get-report/${nis}`,
        method: "GET",
      }),
      providesTags: ["reports"],
    }),
    getAchievement: builder.query({
      query: () => ({
        url: "/get-report-target",
        method: "GET",
      }),
      providesTags: ["reports"],
    }),
    getReportDashboard: builder.query({
      query: () => ({
        url: "/get-report-dashboard",
        method: "GET",
      }),
      providesTags: ["reports"],
    }),
    getStudentReport: builder.query({
      query: (userid) => ({
        url: `/get-student-report`,
        method: "GET",
        params: { userid },
      }),
      providesTags: ["reports"],
    }),
  }),
});

export const {
  useGetReportQuery,
  useDeleteReportMutation,
  useStudentReportQuery,
  useGetAchievementQuery,
  useGetReportDashboardQuery,
  useGetStudentReportQuery,
} = ApiReport;
