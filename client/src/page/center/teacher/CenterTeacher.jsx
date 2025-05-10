import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Table from "../../../components/table/Table";
import { useGetTeachersDataQuery } from "../../../controller/api/center/ApiCenterData";
const CenterTeacher = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useGetTeachersDataQuery({
    page,
    limit,
    search,
  });

  const { results = [], totalData, totalPages } = data || {};

  return (
    <Layout title={"Daftar Guru"} levels={["center"]}>
      <Table
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        limit={limit}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}>
        <table className='mb-0 table table-hover table-striped table-bordered'>
          <thead>
            <tr>
              <th className='text-center'>No</th>
              <th className='text-center'>Satuan</th>
              <th className='text-center'>Username</th>
              <th className='text-center'>Nama</th>
              <th className='text-center'>Email</th>
              <th className='text-center'>No HP</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.id}>
                <td className='text-center align-middle'>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className='text-center align-middle'>{result.homebase}</td>
                <td className='text-center align-middle'>{result.username}</td>
                <td className='align-middle'>{result.name}</td>
                <td className='align-middle'>{result.email}</td>
                <td className='text-center align-middle'>{result.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Table>
    </Layout>
  );
};

export default CenterTeacher;
