import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiCbtReport = createApi({
  reducerPath: "ApiCbtReport",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/cbt/report",
    credentials: "include",
  }),
  tagTypes: ["report"],
  endpoints: (builder) => ({
    getReport: builder.query({
      query: ({ exam, classid, page, limit, search }) => ({
        url: "/get-report",
        method: "GET",
        params: { exam, classid, page, limit, search },
      }),
      providesTags: ["report"],
    }),
  }),
});

export const { useGetReportQuery } = ApiCbtReport;
