import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import FormJuz from "./FormJuz";
import TableData from "./TableData";
import { useGetJuzQuery } from "../../../controller/api/tahfiz/ApiQuran";
import FormSurah from "./FormSurah";

const TahfizJuz = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const [detail, setDetail] = useState({});

  const { data: rawData = {}, isLoading } = useGetJuzQuery({
    page,
    limit,
    search,
  });
  const { juz = [], totalData, totalPages } = rawData;

  return (
    <Layout title={"Tahfiz - Daftar Juz"} levels={["tahfiz"]}>
      <div className='row g-2'>
        <div className='col-lg-3 col-12'>
          <FormJuz detail={detail} setDetail={() => setDetail({})} />

          <FormSurah detail={detail} setDetail={() => setDetail({})} />
        </div>
        <div className='col-lg-9 col-12'>
          <TableData
            setDetail={setDetail}
            juz={juz}
            totalData={totalData}
            totalPages={totalPages}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            setSearch={setSearch}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default TahfizJuz;
