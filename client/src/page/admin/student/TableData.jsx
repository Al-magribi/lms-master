import React, { useEffect, useState } from "react";
import {
  useChangePeriodeMutation,
  useChangeStatusMutation,
  useDeleteStudentMutation,
  useGetStudentsQuery,
} from "../../../controller/api/admin/ApiStudent";
import Table from "../../../components/table/Table";
import toast from "react-hot-toast";
import { useGetPeriodeQuery } from "../../../controller/api/database/ApiDatabase";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedPeriode, setSelectedPeriode] = useState("");

  const {
    data: rawData = {},
    isLoading: dataLoading,
    refetch,
  } = useGetStudentsQuery({
    page,
    limit,
    search,
  });
  const { students = [], totalData, totalPages } = rawData;
  const { data: periodes } = useGetPeriodeQuery();

  const [deleteStudent, { isSuccess, isLoading, isError, reset }] =
    useDeleteStudentMutation();
  const [changeStatus] = useChangeStatusMutation();
  const [changePeriode, { isLoading: isChanging }] = useChangePeriodeMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus siswa ini dan semua data yang terkait dengan siswa ini?"
    );
    if (confirm) {
      toast.promise(
        deleteStudent(id)
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

  const changeHandler = (id) => {
    toast.promise(
      changeStatus(id)
        .unwrap()
        .then((res) => res.message),
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
        changePeriode({ userid: student.id, periodeid: selectedPeriode })
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
            <th className="text-center">Tahun Ajaran</th>
            <th className="text-center">Satuan</th>
            <th className="text-center">Tahun Masuk</th>
            <th className="text-center">NIS</th>
            <th className="text-center">Nama</th>
            <th className="text-center">L/P</th>
            <th className="text-center">Status</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students?.map((student, i) => (
            <tr key={i}>
              <td className="text-center align-middle">
                {(page - 1) * limit + i + 1}
              </td>
              <td className="text-center align-middle">
                {student.periode_name}
              </td>
              <td className="text-center align-middle">{student.homebase}</td>
              <td className="text-center align-middle">{student.entry}</td>
              <td className="text-center align-middle">{student.nis}</td>
              <td className="align-middle">{student.name}</td>
              <td className="text-center align-middle">{student.gender}</td>
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
              <td className="text-cente align-middle">
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => setDetail(student)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    disabled={isLoading}
                    onClick={() => deleteHandler(student.id)}
                  >
                    <i className="bi bi-person-x-fill"></i>
                  </button>
                </div>
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
  );
};

export default TableData;
