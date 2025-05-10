import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import FormJuz from "./FormJuz";
import FormSurah from "./FormSurah";
import TableData from "./TableData";
import {
  useGetGradesQuery,
  useAddTargetMutation,
} from "../../../controller/api/tahfiz/ApiScoring";
import { useGetJuzQuery } from "../../../controller/api/tahfiz/ApiQuran";

const TahfizTarget = () => {
  const { data: grades } = useGetGradesQuery();
  const { data: juz } = useGetJuzQuery({ page: "", limit: "", search: "" });

  return (
    <Layout title={"Target Hafalan"} levels={["tahfiz"]}>
      <div className="row g-2">
        <div className="col-lg-3 col-12">
          <FormJuz grades={grades} juz={juz} />
        </div>
        <div className="col-lg-9 col-12">
          <TableData />
        </div>
      </div>
    </Layout>
  );
};

export default TahfizTarget;
