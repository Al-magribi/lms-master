import { useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteBankMutation,
  useGetBankQuery,
} from "../../../controller/api/cbt/ApiBank";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const TableBank = ({ setDetail }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetBankQuery({
    page,
    limit,
    search,
  });
  const { banks = [], totalData, totalPages } = rawData;
  const [deleteBank, { isLoading }] = useDeleteBankMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus bank soal ini dan semua data yang terkait dengan bank soal ini?"
    );
    if (confirm) {
      toast.promise(
        deleteBank(id)
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

  const goToLink = (subject, name, id) => {
    const nameFormat = name.replace(/[\s/]/g, "-");
    const subjectFormat = subject.replace(/[\s/]/g, "-");
    navigate(`/admin-cbt-bank/${subjectFormat}/${nameFormat}/${id}`);
  };

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
      <table className="table table-bordered table-striped table-hover m-0">
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">Guru</th>
            <th className="text-center">Mata Pelajaran</th>
            <th className="text-center">Bank Soal</th>
            <th className="text-center">Jenis</th>
            <th className="text-center">Soal</th>
            <th style={{ width: 250 }} className="text-center">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {banks?.length > 0 ? (
            banks?.map((item, i) => (
              <tr key={i}>
                <td className="text-center align-middle">
                  {(page - 1) * limit + i + 1}
                </td>
                <td className="align-middle">{item.teacher_name}</td>
                <td className="align-middle">{item.subject_name}</td>
                <td className="align-middle">{item.name}</td>
                <td className="text-center align-middle">
                  <p className="m-0 badge bg-success">
                    {item.btype.toUpperCase()}
                  </p>
                </td>
                <td className="text-center align-middle">
                  <p className="m-0 badge bg-secondary">
                    {`${item.question_count} Soal`}
                  </p>
                </td>
                <td className="text-center align-middle">
                  <div className="d-flex justify-content-center gap-1">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                        goToLink(item.subject_name, item.name, item.id)
                      }
                    >
                      <i className="bi bi-folder-fill"></i>
                      <span className="ms-2">Lihat</span>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setDetail(item)}
                    >
                      <i className="bi bi-pencil-square"></i>
                      <span className="ms-2">Edit </span>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={isLoading}
                      onClick={() => deleteHandler(item.id)}
                    >
                      <i className="bi bi-folder-minus"></i>
                      <span className="ms-2">Hapus</span>
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

export default TableBank;
