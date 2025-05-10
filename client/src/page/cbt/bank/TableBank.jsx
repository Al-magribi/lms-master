import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";

// Components
import Table from "../../../components/table/Table";

// API Hooks
import {
  useDeleteBankMutation,
  useGetBankQuery,
} from "../../../controller/api/cbt/ApiBank";

// Constants
const TABLE_COLUMNS = [
  { key: "no", label: "No", className: "text-center" },
  { key: "teacher", label: "Guru", className: "align-middle" },
  { key: "subject", label: "Mata Pelajaran", className: "align-middle" },
  { key: "bank", label: "Bank Soal", className: "align-middle" },
  { key: "type", label: "Jenis", className: "text-center align-middle" },
  { key: "questions", label: "Soal", className: "text-center align-middle" },
  { key: "actions", label: "Aksi", className: "text-center align-middle" },
];

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

  const renderTableHeader = () => (
    <thead>
      <tr>
        {TABLE_COLUMNS.map((column) => (
          <th key={column.key} className={column.className}>
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderTableBody = () => (
    <tbody>
      {banks?.length > 0 ? (
        banks?.map((item, i) => (
          <tr key={item.id || i}>
            <td className='text-center align-middle'>
              {(page - 1) * limit + i + 1}
            </td>
            <td className='align-middle'>{item.teacher_name}</td>
            <td className='align-middle'>{item.subject_name}</td>
            <td className='align-middle'>{item.name}</td>
            <td className='text-center align-middle'>
              <span className='badge bg-success'>
                {item.btype.toUpperCase()}
              </span>
            </td>
            <td className='text-center align-middle'>
              <span className='badge bg-secondary'>
                {`${item.question_count} Soal`}
              </span>
            </td>
            <td className='text-center align-middle'>
              <div className='dropdown'>
                <button
                  className='btn btn-sm btn-outline-primary dropdown-toggle'
                  type='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'>
                  Pilih Aksi
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <button
                      className='dropdown-item text-primary'
                      onClick={() =>
                        goToLink(item.subject_name, item.name, item.id)
                      }>
                      <i className='bi bi-folder-fill me-2'></i>
                      Lihat
                    </button>
                  </li>
                  <li>
                    <button
                      className='dropdown-item text-warning'
                      onClick={() => setDetail(item)}>
                      <i className='bi bi-pencil-square me-2'></i>
                      Edit
                    </button>
                  </li>
                  <li>
                    <button
                      className='dropdown-item text-danger'
                      disabled={isLoading}
                      onClick={() => deleteHandler(item.id)}>
                      <i className='bi bi-folder-minus me-2'></i>
                      Hapus
                    </button>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={TABLE_COLUMNS.length} className='text-center'>
            Data belum tersedia
          </td>
        </tr>
      )}
    </tbody>
  );

  return (
    <Table
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
      isLoading={dataLoading}>
      <table className='table table-bordered table-striped table-hover m-0'>
        {renderTableHeader()}
        {renderTableBody()}
      </table>
    </Table>
  );
};

TableBank.propTypes = {
  setDetail: PropTypes.func.isRequired,
};

export default TableBank;
