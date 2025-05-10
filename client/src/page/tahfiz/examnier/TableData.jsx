import React, { useState } from "react";
import {
  useGetExaminersQuery,
  useDeleteExaminerMutation,
} from "../../../controller/api/tahfiz/ApiExaminer";
import Table from "../../../components/table/Table";
import { toast } from "react-hot-toast";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading } = useGetExaminersQuery({
    page,
    limit,
    search,
  });
  const { examiners = [], totalData, totalPages } = rawData;
  const [deleteExaminer, { isLoading: isDeleting }] =
    useDeleteExaminerMutation();

  const deleteHandler = (id) => {
    toast.promise(
      deleteExaminer(id)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat...",
        success: (message) => message,
        error: (error) => error.data?.message,
      }
    );
  };

  return (
    <Table
      isLoading={isLoading}
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
    >
      <table className='mb-0 table table-bordered table-striped table-hover'>
        <thead>
          <tr>
            <td className='text-center align-middle'>No</td>
            <td className='text-center align-middle'>Nama Penguji</td>
            <td className='text-center align-middle'>Aksi</td>
          </tr>
        </thead>
        <tbody>
          {examiners?.map((item, i) => (
            <tr key={i}>
              <td className='text-center align-middle'>
                {(page - 1) * limit + i + 1}
              </td>
              <td className='align-middle'>{item.name}</td>
              <td className='text-center align-middle'>
                <div className='d-flex justify-content-center gap-2'>
                  <button
                    className='btn btn-sm btn-warning'
                    onClick={() => setDetail(item)}
                  >
                    <i className='bi bi-pencil-square'></i>
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    disabled={isDeleting}
                    onClick={() => deleteHandler(item.id)}
                  >
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
