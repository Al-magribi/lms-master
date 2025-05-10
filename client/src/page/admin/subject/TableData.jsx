import { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteSubjectMutation,
  useGetSubjectQuery,
} from "../../../controller/api/admin/ApiSubject";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGetAppQuery } from "../../../controller/api/center/ApiApp";

const TableData = ({ setDetail }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetSubjectQuery({
    page,
    limit,
    search,
  });
  const { data: app } = useGetAppQuery();

  const { totalData, totalPages, subjects = [] } = rawData;
  const [deleteSubject, { isSuccess, isLoading, isError, reset }] =
    useDeleteSubjectMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data mata pelajaran ini dan semua data yang terkait dengan mata pelajaran ini?"
    );
    if (confirm) {
      toast.promise(
        deleteSubject(id)
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

  const goToLink = (name, id) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/pelajaran/${formattedName}/${id}`);
  };

  useEffect(() => {
    if (isSuccess || isError) {
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
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">Cover</th>
            <th className="text-center">Mata Pelajaran</th>
            <th className="text-center">Guru Pengampu</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {subjects?.length > 0 ? (
            subjects?.map((subject, i) => (
              <tr key={i}>
                <td className="text-center align-middle">
                  {(page - 1) * limit + i + 1}
                </td>
                <td className="text-center align-middle">
                  <img
                    src={subject.cover ? subject.cover : app?.logo}
                    alt={`cover-${subject.name}`}
                    width={65}
                    height={80}
                    className="overflow-hidden rounded"
                    style={{ objectFit: "cover" }}
                  />
                </td>
                <td className="align-middle">{subject.name}</td>
                <td className="align-middle d-flex flex-column gap-2">
                  {subject.teachers.map((teacher, i) => (
                    <div key={i} className="d-flex flex-column">
                      <p className="m-0">
                        {teacher.name}{" "}
                        <span className="text-secondary">{`(${
                          teacher.class?.length > 0
                            ? teacher.class?.map((item) => item.name).join(", ")
                            : "Data belum tersedia"
                        })`}</span>
                      </p>
                      <div className="d-flex gap-2 text-secondary">
                        <p className="m-0">{teacher.chapters} Chapter</p>
                        <p className="m-0">{teacher.contents} Materi</p>
                      </div>
                    </div>
                  ))}
                </td>
                <td className="text-cente align-middle">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => goToLink(subject.name, subject.id)}
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setDetail(subject)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={isLoading}
                      onClick={() => deleteHandler(subject.id)}
                    >
                      <i className="bi bi-folder-minus"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>Data tidak tersedia</td>
            </tr>
          )}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
