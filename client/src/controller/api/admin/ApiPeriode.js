import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiPeriode = createApi({
  reducerPath: "ApiPeriode",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/periode",
    credentials: "include",
  }),
  tagTypes: ["periode", "students", "class"],
  endpoints: (builder) => ({
    getPeriodes: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-periode",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["periode"],
    }),
    addPeriode: builder.mutation({
      query: (body) => ({
        url: "/add-periode",
        method: "POST",
        body,
      }),
      invalidatesTags: ["periode"],
    }),
    deletePeriode: builder.mutation({
      query: (id) => ({
        url: "/delete-periode",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["periode"],
    }),
    changeStatus: builder.mutation({
      query: (id) => ({
        url: "/change-status",
        method: "PUT",
        params: { id },
      }),
      invalidatesTags: ["periode", "students"],
    }),
  }),
});

export const {
  useAddPeriodeMutation,
  useGetPeriodesQuery,
  useDeletePeriodeMutation,
  useChangeStatusMutation,
} = ApiPeriode;
