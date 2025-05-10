import React, { useState } from "react";
import Table from "../../../components/table/Table";
import { useGetGraduationQuery } from "../../../controller/api/admin/ApiGraduation";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetGraduationQuery({ page, limit, search });
  const { result, totalData, totalPages } = data || {};

  return (
    <Table
      isLoading={isLoading}
      totalData={totalData}
      totalPages={totalPages}
      page={page}
      limit={limit}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}>
      <table className='mb-0 table table-hover table-striped table-bordered'>
        <thead>
          <tr>
            <th className='text-center'>No</th>
            <th className='text-center'>Nis</th>
            <th className='text-center'>Nama</th>
            <th className='text-center'>Instansi</th>
            <th className='text-center'>Deskripsi</th>
            <th className='text-center'>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {result?.map((item, index) => (
            <tr key={item.id}>
              <td className='align-middle text-center'>
                {(page - 1) * limit + index + 1}
              </td>
              <td className='align-middle text-center'>{item.nis}</td>
              <td className='align-middle '>{item.student_name}</td>
              <td className='align-middle '>{item.agency}</td>
              <td className='align-middle '>{item.description}</td>
              <td className='align-middle text-center'>
                <div className='d-flex justify-content-center gap-2'>
                  <button
                    className='btn btn-sm btn-warning'
                    onClick={() => setDetail(item)}>
                    <i className='bi bi-pencil-square'></i>
                  </button>
                  <button className='btn btn-sm btn-danger'>
                    <i className='bi bi-trash'></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
