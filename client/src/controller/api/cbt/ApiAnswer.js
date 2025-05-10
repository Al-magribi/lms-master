import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiAnswer = createApi({
  reducerPath: "ApiAnswer",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/answer` }),
  tagTypes: ["answer"],
  endpoints: (builder) => ({
    addAnswer: builder.mutation({
      query: (body) => ({
        url: "/add-answer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["answer"],
    }),
    getStudentAnswer: builder.query({
      query: ({ student, exam }) => ({
        url: "/get-student-answer",
        params: { student, exam },
      }),
      providesTags: ["answer"],
    }),
    gradeEssay: builder.mutation({
      query: (body) => ({
        url: "/grade-essay",
        method: "POST",
        body,
      }),
      invalidatesTags: ["answer"],
    }),
    getLineChartData: builder.query({
      query: (exam) => ({
        url: "/get-line-chart-data",
        params: { exam },
      }),
      providesTags: ["answer"],
    }),
    getExamScoreList: builder.query({
      query: ({ exam, classid, page, limit, search }) => ({
        url: "/get-exam-score-list",
        params: { exam, classid, page, limit, search },
      }),
      providesTags: ["answer"],
    }),
    getExamAnalysis: builder.query({
      query: ({ exam, classid, page, limit, search }) => ({
        url: "/get-exam-analysis",
        params: { exam, classid, page, limit, search },
      }),
      providesTags: ["answer"],
    }),
  }),
});

export const {
  useAddAnswerMutation,
  useGetStudentAnswerQuery,
  useGradeEssayMutation,
  useGetLineChartDataQuery,
  useGetExamScoreListQuery,
  useGetExamAnalysisQuery,
} = ApiAnswer;
