import { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useChangeStatusMutation,
  useDeletePeriodeMutation,
  useGetPeriodesQuery,
} from "../../../controller/api/admin/ApiPeriode";
import toast from "react-hot-toast";
import { useGetStudentsQuery } from "../../../controller/api/admin/ApiStudent";
import { useGetClassQuery } from "../../../controller/api/admin/ApiClass";

const TableData = ({ setDetail }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetPeriodesQuery({
    page,
    limit,
    search,
  });
  const { periodes = [], totalData, totalPages } = rawData;
  const [deletePeriode, { isSuccess, isLoading, isError, reset }] =
    useDeletePeriodeMutation();
  const [changeStatus] = useChangeStatusMutation();
  const { refetch } = useGetStudentsQuery({
    page,
    limit,
    search,
  });
  const { refetch: refetchClass } = useGetClassQuery({
    page,
    limit,
    search,
  });

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus periode ini dan semua data yang terkait dengan periode ini?"
    );
    if (confirm) {
      toast.promise(
        deletePeriode(id)
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
    const confirm = window.confirm(
      "Apakah anda yakin ingin mengubah status periode ini?"
    );
    if (confirm) {
      toast.promise(
        changeStatus(id)
          .unwrap()
          .then((res) => {
            refetch();
            refetchClass();
            return res.message;
          }),
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
      <table className="table table-bordered table-striped table-hover">
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th className="text-center">_id</th>
            <th className="text-center">Periode</th>
            <th className="text-center">Status</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {periodes?.map((item, i) => (
            <tr key={i}>
              <td className="text-center align-middle">
                {(page - 1) * limit + i + 1}
              </td>
              <td className="text-center align-middle">{item.id}</td>
              <td className="text-center align-middle">{item.name}</td>
              <td className="text-center align-middle">
                <div
                  className="form-check form-switch d-flex justify-content-center"
                  onClick={() => changeHandler(item.id)}
                >
                  <input
                    className="form-check-input pointer"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckChecked"
                    checked={item.isactive}
                    readOnly
                  />
                </div>
              </td>
              <td className="text-cente align-middle">
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
          ))}
        </tbody>
      </table>
    </Table>
  );
};

export default TableData;
