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

  return (
    <div className='card shadow-sm'>
      <div className='card-body p-0'>
        <Table
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
          setSearch={setSearch}
          totalData={totalData}>
          <div className='table-responsive'>
            <table
              ref={tableRef}
              className='table table-striped table-hover table-bordered align-middle mb-0'>
              <thead className='table-light'>
                <tr>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "5%" }}>
                    No
                  </th>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "10%" }}>
                    NIS
                  </th>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "15%" }}>
                    Nama Siswa
                  </th>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "10%" }}>
                    Kelas
                  </th>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "10%" }}>
                    Tingkat
                  </th>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "10%" }}>
                    IP Address
                  </th>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "10%" }}>
                    Browser
                  </th>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "15%" }}>
                    Waktu Mulai
                  </th>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "10%" }}>
                    Status
                  </th>
                  <th
                    scope='col'
                    className='text-center'
                    style={{ width: "15%" }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.length > 0 ? (
                  result.map((item, index) => (
                    <tr key={item.student_id || index}>
                      <td className='text-center'>
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className='text-center'>{item.nis}</td>
                      <td>{item.student_name}</td>
                      <td className='text-center'>{item.class_name}</td>
                      <td className='text-center'>{item.grade_name}</td>
                      <td className='text-center'>{item.ip || "-"}</td>
                      <td className='text-center'>{item.browser || "-"}</td>
                      <td className='text-center'>
                        {item.createdat ? (
                          <span className='badge bg-success px-3 py-2'>
                            {new Date(item.createdat).toLocaleString()}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className='text-center'>
                        {item.ispenalty ? (
                          <span className='badge bg-danger px-3 py-2'>
                            Melanggar
                          </span>
                        ) : item.isactive ? (
                          <span className='badge bg-warning px-3 py-2'>
                            Mengerjakan
                          </span>
                        ) : item.isdone ? (
                          <span className='badge bg-success px-3 py-2'>
                            Selesai
                          </span>
                        ) : (
                          <span className='badge bg-secondary px-3 py-2'>
                            Belum Masuk
                          </span>
                        )}
                      </td>
                      <td className='text-center'>
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
                                className='dropdown-item d-flex align-items-center py-2'
                                title='Lihat Detail'
                                data-bs-toggle='modal'
                                data-bs-target='#answerSheet'
                                onClick={() => setDetail(item)}>
                                <i className='bi bi-eye me-2'></i>
                                <span>Lihat</span>
                              </button>
                            </li>
                            <li>
                              <button
                                className='dropdown-item d-flex align-items-center py-2'
                                title='Izinkan Masuk'
                                onClick={() => handleRejoin(item.log_id)}
                                disabled={rejoinLoad || !item.isactive}>
                                <i className='bi bi-arrow-repeat me-2'></i>
                                <span>Izinkan</span>
                              </button>
                            </li>
                            <li>
                              <button
                                className='dropdown-item d-flex align-items-center py-2'
                                title='Selesaikan'
                                onClick={() => hanldeFinish(item.log_id)}
                                disabled={
                                  finishLoad || item.isdone || !item.isactive
                                }>
                                <i className='bi bi-check-circle me-2'></i>
                                <span>Selesaikan</span>
                              </button>
                            </li>
                            <li>
                              <button
                                className='dropdown-item d-flex align-items-center py-2'
                                title='Ulangi Ujian'
                                onClick={() =>
                                  handleRetake(item.log_id, item.student_id)
                                }
                                disabled={retakeLoad || !item.isdone}>
                                <i className='bi bi-recycle me-2'></i>
                                <span>Ulangi</span>
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='10' className='text-center py-4'>
                      {isLoading ? (
                        <div className='d-flex justify-content-center align-items-center'>
                          <div
                            className='spinner-border text-primary'
                            role='status'>
                            <span className='visually-hidden'>Loading...</span>
                          </div>
                          <span className='ms-2'>Memuat data...</span>
                        </div>
                      ) : (
                        "Tidak ada data yang ditemukan"
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Table>
      </div>

      <AnswerSheet detail={detail} />
    </div>
  );
});

export default TableData;
