import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiHomepage = createApi({
  reducerPath: "ApiHomepage",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/cms/homepage`,
    credentials: "include",
  }),
  tagTypes: ["Homepage"],
  endpoints: (builder) => ({
    getHomepage: builder.query({
      query: () => "/get-data",
      providesTags: ["Homepage"],
    }),
    updateHomepage: builder.mutation({
      query: (data) => ({
        url: "/update-homepage",
        method: "PUT",
        body: data,
        formData: true,
        validateStatus: (response, result) =>
          response.status === 200 && result.success,
      }),
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Gagal menyimpan pengaturan",
      }),
      invalidatesTags: ["Homepage"],
    }),
  }),
});

export const { useGetHomepageQuery, useUpdateHomepageMutation } = ApiHomepage;
