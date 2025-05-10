import React, { useState, Fragment } from "react";
import {
  useGetJuzQuery,
  useDeleteJuzMutation,
} from "../../../controller/api/tahfiz/ApiQuran";
import Table from "../../../components/table/Table";
import { toast } from "react-hot-toast";

const TableData = ({
  setDetail,
  juz,
  totalData,
  totalPages,
  page,
  setPage,
  limit,
  setLimit,
  setSearch,
  isLoading,
}) => {
  const [deleteJuz, { isLoading: isDeleting }] = useDeleteJuzMutation();

  const handleDelete = (id) => {
    toast.promise(
      deleteJuz(id)
        .unwrap()
        .then((res) => res.message),
      {
        pending: "Menghapus data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const handleDetail = (detail, juzId) => {
    const data = {
      juz_id: juzId,
      surah_id: detail.surah_id,
      id: detail.id,
      surah: detail.surah,
      from_ayat: detail.from_ayat,
      to_ayat: detail.to_ayat,
      lines: detail.lines,
    };

    setDetail(data);
  };

  return (
    <Table
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      totalData={totalData}
      limit={limit}
      setLimit={setLimit}
      setSearch={setSearch}
      isLoading={isLoading}
    >
      <table className='mb-0 table table-hover table-bordered'>
        <thead>
          <tr>
            <th className='text-center'>No</th>
            <th className='text-center'>Juz</th>
            <th className='text-center'>Surah</th>
            <th className='text-center'>Dari Ayat</th>
            <th className='text-center'>Sampai Ayat</th>
            <th className='text-center'>Baris</th>
            <th className='text-center'>Edit Surah</th>
            <th className='text-center'>Ayat</th>
            <th className='text-center'>Baris</th>
            <th className='text-center'>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {juz?.map((item, i) => (
            <Fragment key={i}>
              <tr>
                <td rowSpan={item.surah.length || 1} className='text-center'>
                  {(page - 1) * limit + i + 1}
                </td>
                <td rowSpan={item.surah.length || 1}>{item.name}</td>
                {item.surah.length > 0 ? (
                  <>
                    <td className='text-center align-middle'>
                      {item.surah[0].surah}
                    </td>
                    <td className='text-center align-middle'>
                      {item.surah[0].from_ayat}
                    </td>
                    <td className='text-center align-middle'>
                      {item.surah[0].to_ayat}
                    </td>
                    <td className='text-center align-middle'>
                      {item.surah[0].lines}
                    </td>
                    <td className='text-center align-middle'>
                      <button
                        className='btn btn-sm btn-warning'
                        onClick={() => handleDetail(item.surah[0], item.id)}
                      >
                        <i className='bi bi-pencil-square'></i>
                      </button>
                    </td>
                  </>
                ) : (
                  <td colSpan={5} className='text-center align-middle'>
                    Data belum tersedia
                  </td>
                )}
                <td rowSpan={item.surah.length || 1} className='text-center'>
                  {item.total_ayat}
                </td>
                <td rowSpan={item.surah.length || 1} className='text-center'>
                  {item.total_line}
                </td>
                <td rowSpan={item.surah.length || 1} className='text-center'>
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
              {item.surah.slice(1).map((s, idx) => (
                <tr key={idx}>
                  <td className='text-center align-middle'>{s.surah}</td>
                  <td className='text-center align-middle'>{s.from_ayat}</td>
                  <td className='text-center align-middle'>{s.to_ayat}</td>
                  <td className='text-center align-middle'>{s.lines}</td>
                  <td className='text-center align-middle'>
                    <button
                      className='btn btn-sm btn-warning'
                      onClick={() => handleDetail(s, item.id)}
                    >
                      <i className='bi bi-pencil-square'></i>
                    </button>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
