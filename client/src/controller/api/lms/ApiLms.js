import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiLms = createApi({
  reducerPath: "ApiLms",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/lms", credentials: "include" }),
  endpoints: (builder) => ({
    getSubjectsOnClass: builder.query({
      query: ({ classid, search }) => ({
        url: "/get-subjects-on-class",
        method: "GET",
        params: { classid, search },
      }),
    }),
    getSubject: builder.query({
      query: ({ subjectid, classid }) => ({
        url: "/get-subject",
        method: "GET",
        params: { subjectid, classid },
      }),
    }),
  }),
});

export const { useGetSubjectsOnClassQuery, useGetSubjectQuery } = ApiLms;
