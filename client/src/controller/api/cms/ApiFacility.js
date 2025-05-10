import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiFacility = createApi({
  reducerPath: "ApiFacility",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/cms/facilities` }),
  tagTypes: ["facility"],
  endpoints: (builder) => ({
    getFacilities: builder.query({
      query: ({ page, search, limit }) => ({
        url: "/get-facilities",
        params: { page, search, limit },
      }),
      providesTags: ["facility"],
    }),
    addFacility: builder.mutation({
      query: (facility) => ({
        url: "/add-facility",
        method: "POST",
        body: facility,
      }),
      invalidatesTags: ["facility"],
    }),
    deleteFacility: builder.mutation({
      query: (id) => ({
        url: "/delete-facility",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["facility"],
    }),
  }),
});

export const {
  useGetFacilitiesQuery,
  useAddFacilityMutation,
  useDeleteFacilityMutation,
} = ApiFacility;
