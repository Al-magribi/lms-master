import { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteExamMutation,
  useGetExamsQuery,
  useChangeStatusMutation,
} from "../../../controller/api/cbt/ApiExam";
import { toast } from "react-hot-toast";

const TableExam = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: loading } = useGetExamsQuery({
    page,
    limit,
    search,
  });
  const { exams = [], totalData, totalPages } = rawData;

  const [deleteExam, { isSuccess, isLoading, isError, reset }] =
    useDeleteExamMutation();
  const [
    changeStatus,
    { isSuccess: isSuccessStatus, isError: isErrorStatus, reset: resetStatus },
  ] = useChangeStatusMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus ujian ini dan semua data yang terkait dengan ujian ini?"
    );

    if (confirm) {
      toast.promise(
        deleteExam(id)
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

  const changeStatusHandler = (id) => {
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

  const copyTokenHandler = (token) => {
    navigator.clipboard.writeText(token);
    toast.success("Token berhasil disalin");
  };

  const openNewTab = (name, id, token) => {
    const formatName = name.toUpperCase().replace(/ /g, "-");
    window.open(`/laporan-ujian/${formatName}/${id}/${token}`, "_blank");
  };

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (isSuccessStatus || isErrorStatus) {
      resetStatus();
    }
  }, [isSuccessStatus, isErrorStatus]);

  return (
    <Table
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
      isLoading={loading}
    >
      <table className="table table-striped table-bordered table-hover mb-0">
        <thead>
          <tr>
            <th className="text-center">Guru</th>
            <th className="text-center">Bank Soal</th>
            <th className="text-center">Nama Ujian</th>
            <th className="text-center">PG</th>
            <th className="text-center">Essay</th>
            <th className="text-center">Kelas</th>
            <th className="text-center">Acak</th>
            <th className="text-center">Durasi</th>
            <th className="text-center">Status</th>
            <th className="text-center">Token</th>
            <th style={{ width: 280 }} className="text-center">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {exams?.length > 0 ? (
            exams?.map((exam, i) => (
              <tr key={i}>
                <td className="align-middle">{exam.teacher_name}</td>
                <td className="align-middle">
                  {exam.banks.map((bank, i) => (
                    <p key={i} className="m-0">
                      {bank.type !== "paket"
                        ? `${bank.name} - PG ${bank.pg} - Essay ${bank.essay}`
                        : `${bank.name}`}
                    </p>
                  ))}
                </td>
                <td className="align-middle">{exam.name}</td>
                <td className="text-center align-middle">
                  <p className="m-0 badge bg-success">{`${exam.mc_score}%`}</p>
                </td>
                <td className="text-center align-middle">
                  <p className="m-0 badge bg-success">{`${exam.essay_score}%`}</p>
                </td>
                <td className="align-middle">
                  <div
                    style={{ width: 100 }}
                    className="d-flex align-items-center justify-content-center flex-wrap gap-2"
                  >
                    {exam.classes?.map((item, index) => (
                      <span key={index} className="badge bg-primary">
                        {item.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="text-center align-middle">
                  {exam.isshuffle ? (
                    <p className="m-0 badge bg-success">Ya</p>
                  ) : (
                    <p className="m-0 badge bg-danger">Tidak</p>
                  )}
                </td>
                <td className="text-center align-middle">
                  <p className="m-0 badge bg-primary">{`${exam.duration} Menit`}</p>
                </td>
                <td className="text-center align-middle">
                  <div
                    className="form-check form-switch pointer d-flex justify-content-center"
                    onClick={() => changeStatusHandler(exam.id)}
                  >
                    <input
                      className="form-check-input bg-success"
                      type="checkbox"
                      id="flexSwitchCheckChecked"
                      checked={exam.isactive}
                      readOnly
                    />
                  </div>
                </td>
                <td className="text-center align-middle">
                  <p
                    className="m-0 badge bg-secondary pointer"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="Copy Token"
                    onClick={() => copyTokenHandler(exam.token)}
                  >
                    {exam.token}
                  </p>
                </td>
                <td className="text-center align-middle">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => openNewTab(exam.name, exam.id, exam.token)}
                    >
                      <i className="bi bi-people"></i>
                      <span className="ms-2">Lihat</span>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      data-bs-toggle="modal"
                      data-bs-target="#addexam"
                      onClick={() => setDetail(exam)}
                    >
                      <i className="bi bi-pencil-square"></i>
                      <span className="ms-2">Edit</span>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={isLoading}
                      onClick={() => deleteHandler(exam.id)}
                    >
                      <i className="bi bi-folder-x"></i>
                      <span className="ms-2">Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={11}>Data belum tersedia</td>
            </tr>
          )}
        </tbody>
      </table>
    </Table>
  );
};

export default TableExam;
