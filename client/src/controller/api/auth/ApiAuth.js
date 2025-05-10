import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiAuth = createApi({
  reducerPath: "ApiAuth",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/auth`,
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Cache-Control", "no-cache");
      return headers;
    },
    timeout: 10000,
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    signin: builder.mutation({
      query: (body) => ({
        url: "/signin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    signup: builder.mutation({
      query: (body) => ({
        url: "/signup",
        method: "POST",
        body,
      }),
    }),
    loadUser: builder.mutation({
      query: () => ({
        url: "/load-user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    updateAdminProfile: builder.mutation({
      query: (body) => ({
        url: "/admin-update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateTeacherProfile: builder.mutation({
      query: (body) => ({
        url: "/teacher-update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateParentProfile: builder.mutation({
      query: (body) => ({
        url: "/parent-update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateStudentProfile: builder.mutation({
      query: (body) => ({
        url: "/student-update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useSigninMutation,
  useSignupMutation,
  useLoadUserMutation,
  useLogoutMutation,
  useUpdateAdminProfileMutation,
  useUpdateTeacherProfileMutation,
  useUpdateParentProfileMutation,
  useUpdateStudentProfileMutation,
} = ApiAuth;
