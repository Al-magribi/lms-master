import { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteMajorMutation,
  useGetMajorQuery,
} from "../../../controller/api/admin/ApiMajor";
import toast from "react-hot-toast";

const columns = [
  { label: "No" },
  { label: "Satuan" },
  { label: "Jurusan" },
  { label: "aksi" },
];

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetMajorQuery({
    page,
    limit,
    search,
  });
  const { majors = [], totalData, totalPages } = rawData;
  const [deleteMajor, { isSuccess, isLoading, error, reset }] =
    useDeleteMajorMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data jurusan ini dan semua data yang terkait dengan jurusan ini?"
    );
    if (confirm) {
      toast.promise(
        deleteMajor(id)
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
      isLoading={dataLoading}
    >
      <table className="table table-bordered table-striped table-hover">
        <thead>
          <tr>
            {columns.map((item) => (
              <th key={item.label} className="text-center">
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {majors?.length > 0 ? (
            majors?.map((item, i) => (
              <tr key={i}>
                <td className="text-center align-middle">
                  {(page - 1) * limit + i + 1}
                </td>

                <td className="align-middle">{item.homebase}</td>
                <td className="align-middle">{item.name}</td>
                <td className="text-center align-middle">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setDetail(item)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={isLoading}
                      onClick={() => deleteHandler(item.id)}
                    >
                      <i className="bi bi-folder-minus"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>Data tidak tersedia</td>
            </tr>
          )}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
