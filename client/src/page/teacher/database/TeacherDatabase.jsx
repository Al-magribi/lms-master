import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import {
  useGetDatabaseByClassQuery,
  useGetPeriodeQuery,
} from "../../../controller/api/database/ApiDatabase";
import Table from "../../../components/table/Table";
import { useNavigate } from "react-router-dom";
import { useChangePeriodeMutation } from "../../../controller/api/admin/ApiStudent";
import toast from "react-hot-toast";
import { useChangeStatusMutation } from "../../../controller/api/admin/ApiStudent";
const TeacherDatabase = () => {
  const navigate = useNavigate();
  const { classname, classid } = useParams();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedPeriode, setSelectedPeriode] = useState("");

  const { data, isLoading, isError, refetch } = useGetDatabaseByClassQuery({
    page,
    limit,
    search,
    classid,
  });
  const { students = [], totalData, totalPages } = data || {};
  const { data: periodes } = useGetPeriodeQuery();

  const [changePeriode, { isLoading: isChanging }] = useChangePeriodeMutation();
  const [changeStatus, { isLoading: isChangingStatus }] =
    useChangeStatusMutation();

  const gotoDatabase = (userid, name) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/database/${userid}/${formattedName}`);
  };

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

  const updatePeriode = (e) => {
    const periodeId = e.target.value;
    setSelectedPeriode(periodeId);
  };

  const handleSavePeriode = async () => {
    if (!selectedPeriode) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    try {
      // Update each student's period
      const updatePromises = students.map((student) =>
        changePeriode({ userid: student.student, periodeid: selectedPeriode })
      );

      await Promise.all(updatePromises);
      toast.success("Berhasil mengganti tahun ajaran");
      setSelectedPeriode("");
      refetch();
    } catch (err) {
      console.error("Error updating periods:", err);
      toast.error("Gagal mengganti tahun ajaran");
    }
  };

  return (
    <Layout
      title={`Database Kelas ${classname.replace(/-/g, " ")}`}
      levels={["teacher"]}
    >
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
              <th className="text-center">Tahun Ajaran</th>
              <th className="text-center">Satuan</th>
              <th className="text-center">Nama</th>
              <th className="text-center">Kelas</th>
              <th className="text-center">L/P</th>
              <th className="text-center">Kelengkapan</th>
              <th className="text-center">Status</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="text-center align-middle">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="text-center align-middle">
                  {student.periode_name === student.active_periode ? (
                    student.periode_name
                  ) : (
                    <div className="d-flex justify-content-center gap-2">
                      <span className="badge bg-danger">
                        {student.periode_name}
                      </span>
                      <i className="bi bi-arrow-right"></i>
                      <span className="badge bg-success">
                        {student.active_periode}
                      </span>
                    </div>
                  )}
                </td>
                <td className="text-center align-middle">
                  {student.homebase_name}
                </td>
                <td className="align-middle">{student.student_name}</td>
                <td className="text-center align-middle">
                  {student.class_name}
                </td>
                <td className="text-center align-middle">
                  {student.student_gender}
                </td>
                <td className="text-center align-middle">
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
                  <div
                    className="form-check form-switch d-flex justify-content-center"
                    onClick={() => changeHandler(student.student)}
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

                <td className="text-center align-middle">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                      gotoDatabase(student.student, student.student_name)
                    }
                  >
                    <i className="bi bi-database"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={9}>
                <div className="d-flex align-items-center justify-content-end gap-2">
                  <select
                    style={{ width: "20%" }}
                    className="form-select"
                    value={selectedPeriode}
                    onChange={updatePeriode}
                  >
                    <option value="" hidden>
                      Ganti Tahun Ajaran
                    </option>
                    {periodes?.map((periode) => (
                      <option key={periode.id} value={periode.id}>
                        {periode.name}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn btn-sm btn-success"
                    onClick={handleSavePeriode}
                    disabled={isChanging || !selectedPeriode}
                  >
                    <i className="bi bi-save"></i>
                    <span className="ms-2">
                      {isChanging ? "Menyimpan..." : "Simpan"}
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </Table>
    </Layout>
  );
};

export default TeacherDatabase;
