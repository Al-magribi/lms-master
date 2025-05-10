import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useGetStudentsDataQuery } from "../../../controller/api/center/ApiCenterData";
import Table from "../../../components/table/Table";
import { useChangeStatusMutation } from "../../../controller/api/admin/ApiStudent";
import toast from "react-hot-toast";

const CenterStudents = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, error, refetch } = useGetStudentsDataQuery({
    page,
    limit,
    search,
  });

  const { results = [], totalData, totalPages } = data || {};
  const [changeStatus] = useChangeStatusMutation();

  const changeHandler = (id) => {
    toast.promise(
      changeStatus(id)
        .unwrap()
        .then((res) => {
          refetch();
          return res.message;
        }),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  return (
    <Layout title={"Daftar Siswa"} levels={["center"]}>
      <Table
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        limit={limit}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}
      >
        <table className="mb-0 table table-hover table-striped table-bordered">
          <thead>
            <tr>
              <th className="text-center">No</th>
              <th className="text-center">Satuan</th>
              <th className="text-center">Tahun Masuk</th>
              <th className="text-center">NIS</th>
              <th className="text-center">Nama</th>
              <th className="text-center">P/L</th>
              <th className="text-center">Status</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {results.map((student, index) => (
              <tr key={student.id}>
                <td className="text-center align-middle">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="text-center align-middle">{student.homebase}</td>
                <td className="text-center align-middle">{student.periode}</td>
                <td className="text-center align-middle">{student.nis}</td>
                <td className="align-middle">{student.name}</td>
                <td className="text-center align-middle">{student.gender}</td>
                <td className="text-center align-middle">
                  {student.isactive ? (
                    <span className="badge bg-primary">Aktif</span>
                  ) : (
                    <span className="badge bg-success">Lulus</span>
                  )}
                </td>
                <td className="text-center align-middle">
                  <div
                    className="form-check form-switch d-flex justify-content-center"
                    onClick={() => changeHandler(student.id)}
                  >
                    <input
                      className="form-check-input pointer"
                      type="checkbox"
                      role="switch"
                      id="flexSwitchCheckChecked"
                      checked={student.isactive}
                      readOnly
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Table>
    </Layout>
  );
};

export default CenterStudents;
