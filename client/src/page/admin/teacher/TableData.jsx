import React, { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteTeacherMutation,
  useGetTeachersQuery,
} from "../../../controller/api/admin/ApiTeacher";
import toast from "react-hot-toast";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetTeachersQuery({
    page,
    limit,
    search,
  });
  const { teachers = [], totalData, totalPages } = rawData;
  const [deleteTeacher, { isSuccess, isLoading, isError, reset }] =
    useDeleteTeacherMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data guru ini dan semua data yang terkait dengan guru ini?"
    );
    if (confirm) {
      toast.promise(
        deleteTeacher(id)
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

    if (isError) {
      reset();
    }
  }, [isSuccess, isError]);

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
      <table className="m-0 table table-bordered table-striped table-hover">
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">Satuan</th>
            <th className="text-center">Username</th>
            <th className="text-center">Nama</th>
            <th className="text-center">Jenis Kelamin</th>
            <th className="text-center">Mata Pelajaran</th>
            <th className="text-center">Wali Kelas</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {teachers?.length > 0 ? (
            teachers?.map((teacher, i) => (
              <tr key={i}>
                <td className="text-center align-middle">
                  {(page - 1) * limit + i + 1}
                </td>
                <td className="text-center align-middle">{teacher.homebase}</td>
                <td className="text-center align-middle">{teacher.username}</td>
                <td className="align-middle">{teacher.name}</td>
                <td className="text-center align-middle">
                  {teacher.gender == "L" ? "Laki Laki" : "Perempuan"}
                </td>
                <td className="align-middle">
                  {teacher.subjects?.map((item) => (
                    <p key={item.id} className="m-0">
                      {item.name}
                    </p>
                  ))}
                </td>
                <td className="text-center align-middle">
                  {teacher.homeroom ? teacher.class_name : "-"}
                </td>
                <td className="text-cente align-middle">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setDetail(teacher)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={isLoading}
                      onClick={() => deleteHandler(teacher.id)}
                    >
                      <i className="bi bi-folder-minus"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="">
                Data Belum tersedia
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
