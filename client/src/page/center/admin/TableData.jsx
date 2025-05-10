import React, { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteAdminMutation,
  useGetAdminQuery,
} from "../../../controller/api/center/ApiAdmin";
import { toast } from "react-hot-toast";

const TableData = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {} } = useGetAdminQuery({ page, limit, search });
  const { admin = [], totalData, totalPages } = rawData;

  console.log(admin);

  const [deleteAdmin, { isLoading, isSuccess, error, reset }] =
    useDeleteAdminMutation();

  const deleteHandler = (id) => {
    toast.promise(
      deleteAdmin(id)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/aktivasi-akun/${code}`;
    navigator.clipboard
      .writeText(link)
      .then(() => toast.success("Berhasil di copy"));
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
    >
      <table className="table table-bordered table-striped table-hover">
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">Level</th>
            <th className="text-center">Nama</th>
            <th className="text-center">Email</th>
            <th className="text-center">Whatsapp</th>
            <th className="text-center">Status</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {admin?.map((item, i) => (
            <tr key={i}>
              <td className="align-middle text-center">
                {(page - 1) * limit + i + 1}
              </td>
              <td className="align-middle">{item.level}</td>
              <td className="align-middle">{item.username}</td>
              <td className="align-middle">{item.email}</td>
              <td className="align-middle">{item.phone}</td>
              <td className="align-middle text-center">
                {item.isactive ? (
                  <span className="badge text-bg-success">aktif</span>
                ) : (
                  <span className="badge text-bg-danger">non-aktif</span>
                )}
              </td>
              <td className="align-middle text-center">
                <div className="d-flex justify-content-center gap-2">
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => copyLink(item.activation)}
                    >
                      <i className="bi bi-link-45deg"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={isLoading}
                      onClick={() => deleteHandler(item.id)}
                    >
                      <i className="bi bi-folder-minus"></i>
                    </button>
                  </div>
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
