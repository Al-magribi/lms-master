import React, { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteHomebaseMutation,
  useGetHomebaseQuery,
} from "../../../controller/api/center/ApiHomebase";
import toast from "react-hot-toast";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const { data: rawData = {} } = useGetHomebaseQuery({ page, limit, search });
  const { homebase = [], totalPages, totalData } = rawData;
  const [deleteHomebase, { isLoading, isSuccess, error, reset }] =
    useDeleteHomebaseMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin akan menghapus seluruh data satuan ini?"
    );
    if (confirm) {
      toast.promise(
        deleteHomebase(id)
          .unwrap()
          .then((res) => res.message),
        {
          loading: "Memproses...",
          success: (message) => message,
          error: (err) => err.data.message,
        }
      );
    }
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);

  return (
    <Table
      totalData={totalData}
      totalPages={totalPages}
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}>
      <table className='table table-bordered table-striped table-hover'>
        <thead>
          <tr>
            <th className='text-center'>No</th>
            <th className='text-center'>_id</th>
            <th className='text-center'>Satuan Pendidikan</th>
            <th className='text-center'>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {homebase?.map((item, i) => (
            <tr key={item.id}>
              <td className='text-center align-middle'>
                {(page - 1) * limit + i + 1}
              </td>
              <td className='text-center align-middle'>{item.id}</td>
              <td className='text-center align-middle'>{item.name}</td>
              <td>
                <div className='d-flex gap-2 justify-content-center'>
                  <button
                    className='btn btn-sm btn-warning'
                    onClick={() => setDetail(item)}>
                    <i className='bi bi-pencil-square'></i>
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    disabled={isLoading}
                    onClick={() => deleteHandler(item.id)}>
                    <i className='bi bi-folder-minus'></i>
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
