import React, { useState } from "react";
import { useGetExamsByClassQuery } from "../../../controller/api/cbt/ApiExam";
import Modal from "./Modal";

const ExamList = ({ classid }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data = {}, isLoading } = useGetExamsByClassQuery(
    { classid, page, limit, search },
    { skip: !classid }
  );
  const { exams = [], totalData, totalPages } = data;
  const [exam, setExam] = useState({});

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to first page on limit change
  };

  return (
    <div className='container-fluid py-4'>
      {/* Search and Limit Controls */}
      <div className='row mb-4'>
        <div className='col-md-6 col-lg-4 mb-3 mb-md-0'>
          <div className='input-group'>
            <span className='input-group-text bg-white border-end-0'>
              <i className='bi bi-search'></i>
            </span>
            <input
              type='text'
              className='form-control border-start-0 ps-0'
              placeholder='Cari ujian...'
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className='col-md-6 col-lg-2'>
          <select
            className='form-select'
            value={limit}
            onChange={handleLimitChange}>
            <option value='5'>5 per halaman</option>
            <option value='10'>10 per halaman</option>
            <option value='25'>25 per halaman</option>
            <option value='50'>50 per halaman</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className='text-center py-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Exam Cards */}
          <div className='row g-3 mb-4'>
            {exams?.length > 0 ? (
              exams?.map((item, index) => (
                <div key={item.id} className='col-12 col-md-6 col-lg-4'>
                  <div className='card h-100 shadow-sm border hover-shadow'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-start mb-3'>
                        <h5 className='card-title text-primary mb-0 fw-bold'>
                          {item.name}
                        </h5>
                        {item.isactive ? (
                          <span className='badge rounded-pill bg-success px-3 py-2'>
                            <i className='bi bi-check-circle me-1'></i>
                            Aktif
                          </span>
                        ) : (
                          <span className='badge rounded-pill bg-danger px-3 py-2'>
                            <i className='bi bi-x-circle me-1'></i>
                            Nonaktif
                          </span>
                        )}
                      </div>

                      <div className='mb-3'>
                        <div className='d-flex align-items-center text-muted mb-2'>
                          <i className='bi bi-person-circle me-2'></i>
                          <span>{item.teacher_name}</span>
                        </div>
                        <div className='d-flex align-items-center text-muted'>
                          <i className='bi bi-clock me-2'></i>
                          <span>{item.duration} Menit</span>
                        </div>
                      </div>

                      <div className='d-grid'>
                        <button
                          className='btn btn-sm btn-primary rounded-pill'
                          data-bs-toggle='modal'
                          data-bs-target='#token'
                          disabled={!item.isactive}
                          onClick={() => setExam(item)}>
                          <i className='bi bi-reception-4 me-2'></i>
                          Ikuti Ujian
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='col-12'>
                <div className='text-center py-5 text-muted'>
                  <i className='bi bi-inbox fs-1 d-block mb-3'></i>
                  <h5>Data Belum Tersedia</h5>
                  <p className='text-muted mb-0'>
                    {search
                      ? "Tidak ada ujian yang sesuai dengan pencarian Anda"
                      : "Belum ada ujian yang tersedia saat ini"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <nav
              aria-label='Page navigation'
              className='d-flex justify-content-between align-items-center'>
              <div className='text-muted'>{totalData} Ujian Tersedia</div>
              <ul className='pagination pagination-sm mb-0'>
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className='page-link'
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}>
                    <i className='bi bi-chevron-left'></i>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${
                      page === index + 1 ? "active" : ""
                    }`}>
                    <button
                      className='page-link'
                      onClick={() => handlePageChange(index + 1)}>
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    page === totalPages ? "disabled" : ""
                  }`}>
                  <button
                    className='page-link'
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}>
                    <i className='bi bi-chevron-right'></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      <Modal exam={exam} setExam={setExam} />
    </div>
  );
};

export default ExamList;

// Add this CSS to your stylesheet
/*
.hover-shadow {
  transition: all 0.3s ease;
}
.hover-shadow:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.page-link {
  border-radius: 0.5rem;
  margin: 0 0.2rem;
  padding: 0.5rem 0.75rem;
  border: none;
  color: #6c757d;
}

.page-link:hover {
  background-color: #e9ecef;
  color: #000;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  color: white;
}

.page-item.disabled .page-link {
  background-color: transparent;
  color: #6c757d;
  opacity: 0.5;
}
*/
