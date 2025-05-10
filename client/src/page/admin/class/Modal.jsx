import React, { useEffect, useState } from "react";
import Add from "./Add";
import Upload from "./Upload";
import {
  useDeleteStudentMutation,
  useGetStudentsInClassQuery,
} from "../../../controller/api/admin/ApiClass";
import Table from "../../../components/table/Table";
import toast from "react-hot-toast";
import { useGraduatedMutation } from "../../../controller/api/admin/ApiStudent";

const Modal = ({ detail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const classid = detail.id;

  const { data: rawData = {}, refetch } = useGetStudentsInClassQuery(
    { page, limit, search, classid },
    { skip: !classid }
  );
  const { totalData, totalPages, students = [] } = rawData;
  const [deleteStudent, { isSuccess, isLoading, isError, reset }] =
    useDeleteStudentMutation();

  const [
    graduated,
    {
      isSuccess: isSuccessGraduated,
      isLoading: isLoadingGraduated,
      isError: isErrorGraduated,
      reset: resetGraduated,
    },
  ] = useGraduatedMutation();

  const deleteHandler = (id) => {
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
  };

  const changeStatusHandler = () => {
    toast.promise(
      graduated(classid)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const download = () => {
    window.open("/temp/template_kelas_siswa.xlsx", "_blank");
  };

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (isSuccessGraduated || isErrorGraduated) {
      resetGraduated();
    }
  }, [isSuccessGraduated, isErrorGraduated]);

  return (
    <div
      className='modal fade'
      id='modal-add'
      data-bs-backdrop='static'
      data-bs-keyboard='false'
      tabIndex='-1'
      aria-labelledby='staticBackdropLabel'
      aria-hidden='true'>
      <div className='modal-dialog modal-xl modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1 className='modal-title fs-5' id='staticBackdropLabel'>
              Kelas <span>{detail?.name}</span>
            </h1>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'></button>
          </div>
          <div className='modal-body bg-light d-flex flex-column gap-2'>
            <div className='row g-2'>
              <div className='col-lg-6 col-12'>
                <Add classid={detail.id} />
              </div>
              <div className='col-lg-6 col-12'>
                <Upload classid={detail.id} />
              </div>
            </div>

            <Table
              page={page}
              setPage={setPage}
              setLimit={setLimit}
              setSearch={setSearch}
              totalData={totalData}
              totalPages={totalPages}>
              <table className='mb-0 table table-bordered table-striped table-hover'>
                <thead>
                  <tr>
                    <th className='text-center'>No</th>
                    <th className='text-center'>Jurusan</th>
                    <th className='text-center'>Tingkat</th>
                    <th className='text-center'>NIS</th>
                    <th className='text-center'>Nama</th>
                    <th className='text-center'>Status</th>
                    <th className='text-center'>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.length > 0 ? (
                    students?.map((student, i) => (
                      <tr key={i}>
                        <td className='text-center align-middle'>
                          {(page - 1) * limit + i + 1}
                        </td>
                        <td className='text-center align-middle'>
                          {student.major_name}
                        </td>
                        <td className='text-center align-middle'>
                          {student.grade_name}
                        </td>
                        <td className='text-center align-middle'>
                          {student.nis}
                        </td>
                        <td className='align-middle'>{student.student_name}</td>
                        <td className='text-center align-middle'>
                          {student.isactive ? (
                            <span className='badge bg-primary'>Aktif</span>
                          ) : (
                            <span className='badge bg-success'>Lulus</span>
                          )}
                        </td>
                        <td className='text-center align-middle'>
                          <button
                            className='btn btn-sm btn-danger'
                            disabled={isLoading}
                            onClick={() => deleteHandler(student.id)}>
                            <i className='bi bi-person-dash'></i>
                            <span className='ms-2'>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7}>Data tidak tersedia</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Table>
          </div>
          <div className='modal-footer'>
            <button className='btn btn-sm btn-primary' onClick={download}>
              Template
            </button>
            <button
              className='btn btn-sm btn-success'
              disabled={isLoadingGraduated}
              onClick={changeStatusHandler}>
              Luluskan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
