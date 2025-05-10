import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useGetTypesQuery } from "../../../controller/api/tahfiz/ApiMetric";
import TableData from "./TableData";
import Achievement from "./Achievement";

const TahfizReport = () => {
  const [typeId, setTypeId] = useState("");
  const [achievement, setAchievement] = useState(false);

  const { data: types } = useGetTypesQuery({ page: "", limit: "", search: "" });

  return (
    <Layout title={"Laporan Hafalan Siswa"} levels={["tahfiz"]}>
      <div className='container-fluid card p-2 mb-2'>
        <div className='card-body p-0 text-end'>
          <div className='btn-group'>
            {types?.map((type) => (
              <button
                key={type.id}
                className={`btn btn-sm ${
                  typeId === type.id ? "btn-secondary" : "btn-outline-secondary"
                }`}
                onClick={() => setTypeId(type.id)}>
                {type.name}
              </button>
            ))}
            <button
              className='btn btn-sm btn-danger'
              onClick={() => setTypeId("")}>
              <i className='bi bi-recycle'></i>
            </button>
            <button
              className='btn btn-sm btn-success'
              onClick={() => setAchievement(!achievement)}>
              {achievement ? "Laporan" : "Capaian"}
            </button>
          </div>
        </div>
      </div>

      {achievement ? <Achievement /> : <TableData type={typeId} />}
    </Layout>
  );
};

export default TahfizReport;
