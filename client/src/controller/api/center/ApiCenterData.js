import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiCenterData = createApi({
  reducerPath: "ApiCenterData",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/center/data` }),
  endpoints: (builder) => ({
    getTeachersData: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-teachers-data?page=${page}&limit=${limit}&search=${search}`,
      }),
    }),
    getStudentsData: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-students-data?page=${page}&limit=${limit}&search=${search}`,
      }),
    }),
    getFamilyData: builder.query({
      query: ({ page, limit, search, family_age, family_gender }) => ({
        url: `/get-family-data?page=${page}&limit=${limit}&search=${search}${
          family_age ? `&family_age=${family_age}` : ""
        }${family_gender ? `&family_gender=${family_gender}` : ""}`,
      }),
    }),
  }),
});

export const {
  useGetTeachersDataQuery,
  useGetStudentsDataQuery,
  useGetFamilyDataQuery,
} = ApiCenterData;
