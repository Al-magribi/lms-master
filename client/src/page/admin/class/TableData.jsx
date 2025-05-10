import React, { useEffect, useState } from "react";
import {
  useDeleteClassMutation,
  useGetClassQuery,
} from "../../../controller/api/admin/ApiClass";
import { toast } from "react-hot-toast";
import Table from "../../../components/table/Table";
import Modal from "./Modal";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedClass, setClass] = useState({});

  const { data: rawData = {}, isLoading: dataLoading } = useGetClassQuery({
    page,
    limit,
    search,
  });
  const { classes = [], totalData, totalPages } = rawData;
  const [deleteClass, { isSuccess, isLoading, error, reset }] =
    useDeleteClassMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data kelas ini dan semua data yang terkait dengan kelas ini?"
    );
    if (confirm) {
      toast.promise(
        deleteClass(id)
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
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
      isLoading={dataLoading}
    >
      <table className="table table-bordered table-striped table-hover">
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">Jurusan</th>
            <th className="text-center">Tingkat</th>
            <th className="text-center">Nama Kelas</th>
            <th className="text-center">Siswa</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {classes?.map((item, i) => (
            <tr key={i}>
              <td className="text-center align-middle">
                {(page - 1) * limit + i + 1}
              </td>
              <td className="align-middle">{item.major_name}</td>
              <td className="text-center align-middle">{item.grade_name}</td>
              <td className="text-center align-middle">{item.name}</td>
              <td className="text-center align-middle">{item.students}</td>
              <td className="text-center align-middle">
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#modal-add"
                    onClick={() => setClass(item)}
                  >
                    <i className="bi bi-folder-plus"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => setDetail(item)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    disabled={isLoading}
                    onClick={() => deleteHandler(item.id)}
                  >
                    <i className="bi bi-folder-minus"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal detail={selectedClass} />
    </Table>
  );
};

export default TableData;
