import React, { useState } from "react";
import { useGetStudentsQuery } from "../../../controller/api/tahfiz/ApiScoring";
import Table from "../../../components/table/Table";
import { useNavigate } from "react-router-dom";
const TableData = ({ homebaseId, gradeId, classId }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading } = useGetStudentsQuery({
    page,
    limit,
    search,
    homebaseId,
    gradeId,
    classId,
  });
  const { students = [], totalData, totalPages } = rawData;

  const goToLink = (name, userid, periodeId) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/tahfiz-hafalan-siswa/${periodeId}/${formattedName}/${userid}`);
  };

  const goToReport = (userid, name) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/tahfiz-laporan-siswa/${userid}/${formattedName}`);
  };

  return (
    <Table
      isLoading={isLoading}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={setLimit}
      search={search}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
    >
      <table className="mb-0 table table-bordered table-striped table-hover">
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">Satuan</th>
            <th className="text-center">NIS</th>
            <th className="text-center">Nama</th>
            <th className="text-center">Tingkat</th>
            <th className="text-center">Kelas</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students?.length > 0 ? (
            students.map((student, index) => (
              <tr key={index}>
                <td className="text-center">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="text-center align-middle">{student.homebase}</td>
                <td className="text-center align-middle">{student.nis}</td>
                <td className="align-middle">{student.name}</td>
                <td className="text-center align-middle">{student.grade}</td>
                <td className="text-center align-middle">{student.class}</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() =>
                        goToReport(
                          student.userid,
                          student.name,
                          student.grade,
                          student.class
                        )
                      }
                    >
                      <i className="bi bi-journal"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => goToLink(student.name, student.userid)}
                    >
                      <i className="bi bi-journal-check"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>Data belum tersedia</td>
            </tr>
          )}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
