import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiApp = createApi({
  reducerPath: "ApiApp",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/center/app` }),
  tagTypes: ["App"],
  endpoints: (builder) => ({
    getApp: builder.query({
      query: () => "/get-app",
      providesTags: ["App"],
    }),
    getAppData: builder.query({
      query: () => "/get-app-data",
      providesTags: ["App"],
    }),
    updateApp: builder.mutation({
      query: (data) => ({
        url: "/update-app",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["App"],
    }),
    updateSmtp: builder.mutation({
      query: (data) => ({
        url: "/update-smtp",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["App"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/update-profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["App", "User"],
    }),
  }),
});

export const {
  useGetAppQuery,
  useGetAppDataQuery,
  useUpdateAppMutation,
  useUpdateSmtpMutation,
  useUpdateProfileMutation,
} = ApiApp;
