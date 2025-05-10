import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiDashboard = createApi({
  reducerPath: "ApiDashboard",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/dash" }),
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => "/admin-stats",
      providesTags: ["AdminDash"],
    }),
    getTeacherDashboard: builder.query({
      query: () => "/teacher-stats",
      providesTags: ["TeacherDash"],
    }),
    getStudentDashboard: builder.query({
      query: () => "/student-stats",
      providesTags: ["StudentDash"],
    }),
    getCenterDashboard: builder.query({
      query: () => "/center-stats",
      providesTags: ["CenterDash"],
    }),
    getHomeInfografis: builder.query({
      query: () => "/infografis",
      providesTags: ["HomeInfografis"],
    }),
    getCmsDashboard: builder.query({
      query: () => "/cms-dashboard",
      providesTags: ["CmsDash"],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetTeacherDashboardQuery,
  useGetStudentDashboardQuery,
  useGetCenterDashboardQuery,
  useGetHomeInfografisQuery,
  useGetCmsDashboardQuery,
} = ApiDashboard;
