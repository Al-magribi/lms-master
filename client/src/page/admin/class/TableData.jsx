import React, { useEffect, useState } from "react";
import {
  useDeleteClassMutation,
  useGetClassQuery,
} from "../../../controller/api/admin/ApiClass";
import { toast } from "react-hot-toast";
import Table from "../../../components/table/Table";
import Modal from "./Modal";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedClass, setClass] = useState({});

  const { data: rawData = {}, isLoading: dataLoading } = useGetClassQuery({
    page,
    limit,
    search,
  });
  const { classes = [], totalData, totalPages } = rawData;
  console.log(classes);
  const [deleteClass, { isSuccess, isLoading, error, reset }] =
    useDeleteClassMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data kelas ini dan semua data yang terkait dengan kelas ini?"
    );
    if (confirm) {
      toast.promise(
        deleteClass(id)
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

  useEffect(() => {
    if (isSuccess) {
      reset();
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);

  return (
    <Table
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
      isLoading={dataLoading}>
      <div className='table-responsive'>
        <table className='table table-hover table-striped align-middle'>
          <thead className='table-light'>
            <tr>
              <th className='text-center' style={{ width: "5%" }}>
                No
              </th>
              <th className='text-center' style={{ width: "20%" }}>
                Jurusan
              </th>
              <th className='text-center' style={{ width: "15%" }}>
                Tingkat
              </th>
              <th className='text-center' style={{ width: "20%" }}>
                Kelas
              </th>
              <th className='text-center' style={{ width: "25%" }}>
                Siswa
              </th>
              <th className='text-center' style={{ width: "15%" }}>
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {classes?.map((item, i) => (
              <tr key={i} className='hover-shadow'>
                <td className='text-center fw-medium'>
                  {(page - 1) * limit + i + 1}
                </td>
                <td className='fw-medium'>{item.major_name}</td>
                <td className='text-center'>{item.grade_name}</td>
                <td className='text-center fw-medium'>{item.name}</td>
                <td>
                  <div className='d-flex flex-column gap-2'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <span className='text-muted'>Laki - Laki</span>
                      <span className='badge bg-primary rounded-pill px-3'>
                        {item.male_count}
                      </span>
                    </div>
                    <div className='d-flex justify-content-between align-items-center'>
                      <span className='text-muted'>Perempuan</span>
                      <span className='badge bg-danger rounded-pill px-3'>
                        {item.female_count}
                      </span>
                    </div>
                    <div className='d-flex justify-content-between align-items-center'>
                      <span className='text-muted fw-medium'>Total</span>
                      <span className='badge bg-success rounded-pill px-3'>
                        {item.students}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className='d-flex justify-content-center gap-2'>
                    <button
                      type='button'
                      className='btn btn-sm btn-primary rounded-circle'
                      data-bs-toggle='modal'
                      data-bs-target='#modal-add'
                      onClick={() => setClass(item)}
                      title='Tambah Siswa'>
                      <i className='bi bi-folder-plus'></i>
                    </button>
                    <button
                      className='btn btn-sm btn-warning rounded-circle'
                      onClick={() => setDetail(item)}
                      title='Edit Kelas'>
                      <i className='bi bi-pencil-square'></i>
                    </button>
                    <button
                      className='btn btn-sm btn-danger rounded-circle'
                      disabled={isLoading}
                      onClick={() => deleteHandler(item.id)}
                      title='Hapus Kelas'>
                      <i className='bi bi-folder-minus'></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal detail={selectedClass} />
    </Table>
  );
};

export default TableData;
