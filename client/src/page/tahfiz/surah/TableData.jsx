import React, { useState } from "react";
import Table from "../../../components/table/Table";
import {
  useGetSurahQuery,
  useDeleteSurahMutation,
} from "../../../controller/api/tahfiz/ApiQuran";
import { toast } from "react-hot-toast";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading } = useGetSurahQuery({
    page,
    limit,
    search,
  });
  const { result = [], totalData, totalPages } = rawData;
  const [deleteSurah, { isLoading: isDeleting }] = useDeleteSurahMutation();

  const handleDelete = async (id) => {
    toast.promise(
      deleteSurah(id)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menghapus...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  return (
    <Table
      isLoading={isLoading}
      totalData={totalData}
      totalPages={totalPages}
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
    >
      <table className='mb-0 table table-hover table-striped table-bordered'>
        <thead>
          <tr>
            <th className='text-center'>No</th>
            <th className='text-center'>Nama Surah</th>
            <th className='text-center'>Jumlah Ayat</th>
            <th className='text-center'>Jumlah Baris</th>
            <th className='text-center'>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {result.map((item, index) => (
            <tr key={item.id}>
              <td className='text-center align-middle'>
                {(page - 1) * limit + index + 1}
              </td>
              <td className='align-middle'>{item.name}</td>
              <td className='text-center align-middle'>{item.ayat}</td>
              <td className='text-center align-middle'>{item.lines}</td>
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
                    onClick={() => handleDelete(item.id)}
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
