import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { useGetDatabaseQuery } from "../../controller/api/database/ApiDatabase";
import Table from "../../components/table/Table";
import { useNavigate } from "react-router-dom";

const DbList = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetDatabaseQuery({ page, limit, search });
  const { students = [], totalPages, totalData } = data || {};

  const gotoDatabase = (userid, name) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/database/${userid}/${formattedName}`);
  };

  return (
    <Layout title="Database" levels={["admin"]}>
      <Table
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}
        totalPages={totalPages}
      >
        <table className="mb-0 table table-striped table-hover table-bordered">
          <thead>
            <tr>
              <th className="text-center">No</th>
              <th className="text-center">NIS</th>
              <th className="text-center">Nama</th>
              <th className="text-center">P/L</th>
              <th className="text-center">Tahun Masuk</th>
              <th className="text-center">Tingkat</th>
              <th className="text-center">Kelas</th>
              <th className="text-center">Kelengkapan Data</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.student_id}>
                <td className="text-center align-middle">
                  {index + 1 + (page - 1) * limit}
                </td>
                <td className="text-center align-middle">
                  {student.student_nis}
                </td>
                <td className="align-middle">{student.student_name}</td>
                <td className="text-center align-middle">
                  {student.student_gender || "-"}
                </td>
                <td className="text-center align-middle">
                  {student.student_entry || "-"}
                </td>
                <td className="text-center align-middle">
                  {student.student_grade || "-"}
                </td>
                <td className="text-center align-middle">
                  {student.student_class || "-"}
                </td>
                <td className="text-center align-middle ">
                  <div className="progress" style={{ height: "20px" }}>
                    <div
                      className={`progress-bar ${
                        parseInt(student.completeness) === 100
                          ? "bg-success"
                          : parseInt(student.completeness) >= 50
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                      role="progressbar"
                      style={{ width: `${student.completeness}%` }}
                      aria-valuenow={student.completeness}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {student.completeness}%
                    </div>
                  </div>
                </td>
                <td className="text-center align-middle">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() =>
                      gotoDatabase(student.student_id, student.student_name)
                    }
                  >
                    <i className="bi bi-database"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Table>
    </Layout>
  );
};

export default DbList;
