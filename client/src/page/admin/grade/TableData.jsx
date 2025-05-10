import React, { useEffect, useState } from "react";
import {
  useDeleteGradeMutation,
  useGetGradeQuery,
} from "../../../controller/api/admin/ApiGrade";
import { toast } from "react-hot-toast";
import Table from "../../../components/table/Table";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetGradeQuery({
    page,
    limit,
    search,
  });
  const { grades = [], totalData, totalPages } = rawData;
  const [deleteGrade, { isSuccess, isLoading, error, reset }] =
    useDeleteGradeMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data tingkat dan semua data yang terkait dengan tingkat ini?"
    );
    if (confirm) {
      toast.promise(
        deleteGrade(id)
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
            <th className="text-center">Satuan</th>
            <th className="text-center">Tingkat</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {grades?.map((item, i) => (
            <tr key={i}>
              <td className="text-center align-middle">
                {(page - 1) * limit + i + 1}
              </td>
              <td className="align-middle">{item.homebase}</td>
              <td className="text-center align-middle">{item.name}</td>
              <td className="text-center align-middle">
                <div className="d-flex justify-content-center gap-2">
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
    </Table>
  );
};

export default TableData;
