import React, { useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteReportMutation,
  useGetReportQuery,
} from "../../../controller/api/tahfiz/ApiReport";
import Detail from "./Detail";
import { toast } from "react-hot-toast";

const TableData = ({ type }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const [detail, setDetail] = useState("");
  const [id, setId] = useState("");

  const { data = {}, isLoading } = useGetReportQuery({
    page,
    limit,
    search,
    type,
  });
  const { report = [], totalData, totalPages } = data;
  const [deleteReport, { isLoading: delLoading }] = useDeleteReportMutation();

  const openModal = (data, id) => {
    setDetail(data);
    setId(id);
  };

  const deleteHandler = (userid, typeId, createdat) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data ini?"
    );
    if (confirm) {
      toast.promise(
        deleteReport({ userid, typeId, createdat })
          .unwrap()
          .then((res) => res.message),
        {
          loading: "Menghapus data...",
          success: (message) => message,
          error: (error) => error.data.message,
        }
      );
    }
  };

  return (
    <Table
      isLoading={isLoading}
      totalData={totalData}
      totalPages={totalPages}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={setLimit}
      setSearch={setSearch}
    >
      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr>
            <th className="align-middle text-center">No</th>
            <th className="align-middle text-center">Tanggal</th>
            <th className="align-middle text-center">NIS</th>
            <th className="align-middle text-center">Nama Siswa</th>
            <th className="align-middle text-center">Tingkat</th>
            <th className="align-middle text-center">Kelas</th>
            <th className="align-middle text-center">Jenis Penilaian</th>
            <th className="align-middle text-center">Nilai</th>
            <th className="align-middle text-center">Penguji</th>
            <th className="align-middle text-center">Aksi</th>
          </tr>
        </thead>
        {report?.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={11}>Belum ada data</td>
            </tr>
          </tbody>
        ) : isLoading ? (
          <tbody>
            <tr>
              <td>Loading..</td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {report?.map((data, index) => (
              <tr key={index}>
                <td className="text-center align-middle">{index + 1}</td>
                <td className="text-center align-middle">
                  {new Date(data.date).toLocaleDateString()}
                </td>
                <td className="text-center align-middle">{data.nis}</td>
                <td className="text-start align-middle">{data.name}</td>
                <td className="text-center align-middle">{data.grade}</td>
                <td className="text-center align-middle">{data.class}</td>
                <td className="text-center align-middle">{data.type}</td>
                <td className="text-center align-middle">{data.totalPoints}</td>
                <td className="text-center align-middle">{data.examiner}</td>
                <td className="align-middle">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      data-bs-toggle="modal"
                      data-bs-target={`#modal-${data.id}`}
                      onClick={() => openModal(data, data.id)}
                      title="Lihat Detail"
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        deleteHandler(
                          data.userid,
                          data.type_id,
                          new Date(data.date).toLocaleDateString()
                        )
                      }
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {report?.map((data, index) => (
        <Detail
          key={index}
          detail={data.id === id ? detail : null}
          setDetail={setDetail}
          id={data.id}
        />
      ))}
    </Table>
  );
};

export default TableData;
