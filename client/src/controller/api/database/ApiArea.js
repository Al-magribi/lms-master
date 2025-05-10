import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiArea = createApi({
  reducerPath: "ApiArea",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/area`, credentials: "include" }),
  endpoints: (builder) => ({
    getProvince: builder.query({
      query: () => "/province",
    }),
    getCity: builder.query({
      query: (provinceid) => ({
        url: "/city",
        params: { provinceid },
      }),
    }),
    getDistrict: builder.query({
      query: (cityid) => ({
        url: "/district",
        params: { cityid },
      }),
    }),
    getVillage: builder.query({
      query: (districtid) => ({
        url: "/village",
        params: { districtid },
      }),
    }),
  }),
});

export const {
  useGetProvinceQuery,
  useGetCityQuery,
  useGetDistrictQuery,
  useGetVillageQuery,
} = ApiArea;
