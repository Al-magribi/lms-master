import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import Table from "../../../../components/table/Table";
import {
  useFinishCbtMutation,
  useGetExamLogQuery,
  useRejoinExamMutation,
  useRetakeExamMutation,
} from "../../../../controller/api/log/ApiLog";
import { toast } from "react-hot-toast";
import AnswerSheet from "./AnswerSheet";

const TableData = forwardRef(({ classid, examid }, ref) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const tableRef = useRef();

  const {
    data = {},
    isLoading,
    refetch,
  } = useGetExamLogQuery({
    exam: examid,
    classid: classid,
    page,
    limit,
    search,
  });
  const { result = [], totalData, totalPages } = data;
  const [detail, setDetail] = useState({});

  const [finishCbt, { isLoading: finishLoad }] = useFinishCbtMutation();
  const [rejoinExam, { isLoading: rejoinLoad }] = useRejoinExamMutation();
  const [retakeExam, { isLoading: retakeLoad }] = useRetakeExamMutation();

  useImperativeHandle(ref, () => ({
    refetch,
    getTableElement: () => tableRef.current,
  }));

  const hanldeFinish = (id) => {
    toast.promise(
      finishCbt({ id, exam: examid })
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  const handleRejoin = (id) => {
    toast.promise(
      rejoinExam({ id })
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  const handleRetake = (id, student) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin mengulang ujian dan menghapus seluruh data jawaban siswa? "
    );

    if (confirm) {
      toast.promise(
        retakeExam({ id, student, exam: examid })
          .unwrap()
          .then((res) => res.message),
        {
          loading: "Memuat data...",
          success: (message) => message,
          error: (error) => error.data.message,
        }
      );
    }
  };

  console.log(result);

  return (
    <>
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
        <table
          ref={tableRef}
          className="table table-striped table-hover table-bordered"
        >
          <thead className="table-light">
            <tr>
              <th scope="col" className="text-center">
                No
              </th>
              <th scope="col" className="text-center">
                NIS
              </th>
              <th scope="col" className="text-center">
                Nama Siswa
              </th>
              <th scope="col" className="text-center">
                Kelas
              </th>
              <th scope="col" className="text-center">
                Tingkat
              </th>
              <th scope="col" className="text-center">
                IP Address
              </th>
              <th scope="col" className="text-center">
                Browser
              </th>
              <th scope="col" className="text-center">
                Waktu Mulai
              </th>
              <th scope="col" className="text-center">
                Status
              </th>
              <th scope="col" className="text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {result.length > 0 ? (
              result.map((item, index) => (
                <tr key={item.student_id || index}>
                  <td className="text-center align-middle">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="text-center align-middle">{item.nis}</td>
                  <td className="align-middle">{item.student_name}</td>
                  <td className="text-center align-middle">
                    {item.class_name}
                  </td>
                  <td className="text-center align-middle">
                    {item.grade_name}
                  </td>
                  <td className="text-center align-middle">{item.ip || "-"}</td>
                  <td className="text-center align-middle">
                    {item.browser || "-"}
                  </td>
                  <td className="text-center align-middle">
                    {item.createdat ? (
                      <span className="badge bg-success">
                        {new Date(item.createdat).toLocaleString()}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="text-center align-middle">
                    {item.ispenalty ? (
                      <span className="badge bg-danger">Melanggar</span>
                    ) : item.isactive ? (
                      <span className="badge bg-warning">Mengerjakan</span>
                    ) : item.isdone ? (
                      <span className="badge bg-success">Selesai</span>
                    ) : (
                      <span className="badge bg-secondary">Belum Masuk</span>
                    )}
                  </td>
                  <td className="text-center align-middle">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        title="Lihat Detail"
                        data-bs-toggle="modal"
                        data-bs-target="#answerSheet"
                        onClick={() => setDetail(item)}
                      >
                        <i className="bi bi-eye"></i>
                        <span className="ms-2">Lihat</span>
                      </button>

                      <button
                        className="btn btn-sm btn-warning"
                        title="Izinkan Masuk"
                        onClick={() => handleRejoin(item.log_id)}
                        disabled={rejoinLoad || !item.isactive}
                      >
                        <i className="bi bi-arrow-repeat"></i>
                        <span className="ms-2">Izinkan</span>
                      </button>

                      <button
                        className="btn btn-sm btn-success"
                        title="Selesaikan"
                        onClick={() => hanldeFinish(item.log_id)}
                        disabled={finishLoad || item.isdone || !item.isactive}
                      >
                        <i className="bi bi-check-circle"></i>
                        <span className="ms-2">Selesaikan</span>
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        title="Ulangi Ujian"
                        onClick={() =>
                          handleRetake(item.log_id, item.student_id)
                        }
                        disabled={retakeLoad || !item.isdone}
                      >
                        <i className="bi bi-recycle"></i>
                        <span className="ms-2">Ulangi</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  {isLoading
                    ? "Memuat data..."
                    : "Tidak ada data yang ditemukan"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      <AnswerSheet detail={detail} />
    </>
  );
});

export default TableData;
