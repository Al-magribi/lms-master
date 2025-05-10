import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiNews = createApi({
  reducerPath: "ApiNews",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/cms/news` }),
  tagTypes: ["News", "Visitors"],
  endpoints: (builder) => ({
    getNews: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-news",
        params: { page, limit, search },
      }),
      providesTags: ["News"],
    }),
    getNewsById: builder.query({
      query: (id) => ({
        url: `/get-news/${id}`,
      }),
      providesTags: ["News"],
    }),
    addNews: builder.mutation({
      query: (data) => ({
        url: "/add-news",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["News"],
    }),
    deleteNews: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["News"],
    }),
    trackVisitor: builder.mutation({
      query: (data) => ({
        url: "/track-visitor",
        method: "POST",
        body: data,
      }),
    }),
    getVisitorStats: builder.query({
      query: ({ startDate, endDate } = {}) => ({
        url: "/visitor-stats",
        params: { startDate, endDate },
      }),
      providesTags: ["Visitors"],
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetNewsByIdQuery,
  useAddNewsMutation,
  useDeleteNewsMutation,
  useTrackVisitorMutation,
  useGetVisitorStatsQuery,
} = ApiNews;
