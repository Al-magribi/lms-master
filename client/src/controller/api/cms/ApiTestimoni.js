import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiTestimoni = createApi({
  reducerPath: "ApiTestimoni",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/cms/testimonies` }),
  tagTypes: ["testimonies"],
  endpoints: (builder) => ({
    getTestimonies: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-testimonies",
        params: { page, limit, search },
      }),
      providesTags: ["testimonies"],
    }),
    addTestimony: builder.mutation({
      query: (data) => ({
        url: "/add-testimony",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["testimonies"],
    }),
    deleteTestimony: builder.mutation({
      query: (id) => ({
        url: "/delete-testimony",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["testimonies"],
    }),
  }),
});

export const {
  useGetTestimoniesQuery,
  useAddTestimonyMutation,
  useDeleteTestimonyMutation,
} = ApiTestimoni;
