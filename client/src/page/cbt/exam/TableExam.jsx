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
    <div className='card shadow-sm'>
      <div className='card-body p-0'>
        <Table
          page={page}
          setPage={setPage}
          setLimit={setLimit}
          setSearch={setSearch}
          totalData={totalData}
          totalPages={totalPages}
          isLoading={loading}>
          <div className='table-responsive'>
            <table className='table  table-bordered table-hover align-middle mb-0'>
              <thead className='table-light'>
                <tr>
                  <th className='text-center' style={{ width: "15%" }}>
                    Guru
                  </th>
                  <th className='text-center' style={{ width: "15%" }}>
                    Bank Soal
                  </th>
                  <th className='text-center' style={{ width: "15%" }}>
                    Nama Ujian
                  </th>
                  <th className='text-center' style={{ width: "5%" }}>
                    PG
                  </th>
                  <th className='text-center' style={{ width: "5%" }}>
                    Essay
                  </th>
                  <th className='text-center' style={{ width: "10%" }}>
                    Kelas
                  </th>
                  <th className='text-center' style={{ width: "5%" }}>
                    Acak
                  </th>
                  <th className='text-center' style={{ width: "5%" }}>
                    Durasi
                  </th>
                  <th className='text-center' style={{ width: "5%" }}>
                    Status
                  </th>
                  <th className='text-center' style={{ width: "10%" }}>
                    Token
                  </th>
                  <th className='text-center' style={{ width: "10%" }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams?.length > 0 ? (
                  exams?.map((exam, i) => (
                    <tr key={i}>
                      <td className='align-middle'>{exam.teacher_name}</td>
                      <td className='align-middle'>
                        {exam.banks.map((bank, i) => (
                          <p key={i} className='m-0 mb-1 last:mb-0'>
                            {bank.type !== "paket"
                              ? `${bank.name} - PG ${bank.pg} - Essay ${bank.essay}`
                              : `${bank.name}`}
                          </p>
                        ))}
                      </td>
                      <td className='align-middle'>{exam.name}</td>
                      <td className='text-center align-middle'>
                        <span className='badge bg-success px-3 py-2'>{`${exam.mc_score}%`}</span>
                      </td>
                      <td className='text-center align-middle'>
                        <span className='badge bg-success px-3 py-2'>{`${exam.essay_score}%`}</span>
                      </td>
                      <td className='align-middle'>
                        <div className='d-flex align-items-center justify-content-center flex-wrap gap-1'>
                          {exam.classes?.map((item, index) => (
                            <span
                              key={index}
                              className='badge bg-primary px-2 py-1'>
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className='text-center align-middle'>
                        {exam.isshuffle ? (
                          <span className='badge bg-success px-3 py-2'>Ya</span>
                        ) : (
                          <span className='badge bg-danger px-3 py-2'>
                            Tidak
                          </span>
                        )}
                      </td>
                      <td className='text-center align-middle'>
                        <span className='badge bg-primary px-3 py-2'>{`${exam.duration} Menit`}</span>
                      </td>
                      <td className='text-center align-middle'>
                        <div
                          className='form-check form-switch d-flex justify-content-center'
                          onClick={() => changeStatusHandler(exam.id)}
                          style={{ cursor: "pointer" }}>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='flexSwitchCheckChecked'
                            checked={exam.isactive}
                            readOnly
                          />
                        </div>
                      </td>
                      <td className='text-center align-middle'>
                        <span
                          className='badge bg-secondary px-3 py-2'
                          style={{ cursor: "pointer" }}
                          data-toggle='tooltip'
                          data-placement='top'
                          title='Copy Token'
                          onClick={() => copyTokenHandler(exam.token)}>
                          {exam.token}
                        </span>
                      </td>
                      <td className='text-center align-middle'>
                        <div className='dropdown'>
                          <button
                            className='btn btn-sm btn-outline-primary dropdown-toggle px-3'
                            type='button'
                            data-bs-toggle='dropdown'
                            aria-expanded='false'>
                            Pilih Aksi
                          </button>
                          <ul className='dropdown-menu dropdown-menu-end shadow-sm'>
                            <li>
                              <button
                                onClick={() =>
                                  openNewTab(exam.name, exam.id, exam.token)
                                }
                                className='dropdown-item d-flex align-items-center py-2'>
                                <i className='bi bi-people me-2'></i>
                                <span>Lihat</span>
                              </button>
                            </li>
                            <li>
                              <button
                                className='dropdown-item d-flex align-items-center py-2'
                                data-bs-toggle='modal'
                                data-bs-target='#addexam'
                                onClick={() => setDetail(exam)}>
                                <i className='bi bi-pencil-square me-2'></i>
                                <span>Edit</span>
                              </button>
                            </li>
                            <li>
                              <button
                                className='dropdown-item d-flex align-items-center py-2'
                                disabled={isLoading}
                                onClick={() => deleteHandler(exam.id)}>
                                <i className='bi bi-folder-x me-2'></i>
                                <span>Hapus</span>
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className='text-center py-4'>
                      {loading ? (
                        <div className='d-flex justify-content-center align-items-center'>
                          <div
                            className='spinner-border text-primary'
                            role='status'>
                            <span className='visually-hidden'>Loading...</span>
                          </div>
                          <span className='ms-2'>Memuat data...</span>
                        </div>
                      ) : (
                        "Data belum tersedia"
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Table>
      </div>
    </div>
  );
};

export default TableExam;
