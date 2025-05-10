import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiReason = createApi({
  reducerPath: "ApiReason",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/cms/reasons` }),
  tagTypes: ["Reasons"],
  endpoints: (builder) => ({
    getReasons: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-reasons",
        params: { page, limit, search },
      }),
      providesTags: ["Reasons"],
    }),
    addReason: builder.mutation({
      query: (body) => ({
        url: "/add-reason",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reasons"],
    }),
    deleteReason: builder.mutation({
      query: (id) => ({
        url: `/delete-reason?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reasons"],
    }),
  }),
});

export const {
  useGetReasonsQuery,
  useAddReasonMutation,
  useDeleteReasonMutation,
} = ApiReason;
