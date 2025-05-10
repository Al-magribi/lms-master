import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiQuran = createApi({
  reducerPath: "ApiQuran",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/quran", credentials: "include" }),
  tagTypes: ["surah", "juz"],
  endpoints: (builder) => ({
    getSurah: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-surah",
        params: { page, limit, search },
      }),
      providesTags: ["surah"],
    }),
    addSurah: builder.mutation({
      query: (data) => ({
        url: "/add-surah",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["surah"],
    }),
    deleteSurah: builder.mutation({
      query: (id) => ({
        url: "/delete-surah",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["surah"],
    }),
    addJuz: builder.mutation({
      query: (data) => ({
        url: "/add-juz",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["juz"],
    }),
    addSurahToJuz: builder.mutation({
      query: (data) => ({
        url: "/add-surah-to-juz",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["juz"],
    }),
    getJuz: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-juz",
        params: { page, limit, search },
      }),
      providesTags: ["juz"],
    }),
    deleteJuz: builder.mutation({
      query: (id) => ({
        url: "/delete-juz",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["juz"],
    }),
  }),
});

export const {
  useGetSurahQuery,
  useAddSurahMutation,
  useDeleteSurahMutation,
  useGetJuzQuery,
  useAddJuzMutation,
  useDeleteJuzMutation,
  useAddSurahToJuzMutation,
} = ApiQuran;
