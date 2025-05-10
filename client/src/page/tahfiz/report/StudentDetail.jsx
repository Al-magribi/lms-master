import React, { useState } from "react";
import {
  FaChartLine,
  FaUserGraduate,
  FaInfoCircle,
  FaBook,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const StudentDetail = ({ students, gradename }) => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("progress");

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-success";
    if (percentage >= 75) return "bg-info";
    if (percentage >= 50) return "bg-warning";
    return "bg-danger";
  };

  const goToDetail = (userid, name) => {
    const closeButton = document.querySelector('[data-bs-dismiss="modal"]');
    if (closeButton) {
      closeButton.click();
    }

    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/tahfiz-laporan-siswa/${userid}/${formattedName}`);
  };

  return (
    <div
      className="modal fade"
      id="detail-student"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              <FaUserGraduate className="me-2" />
              Tingkat - {gradename}
            </h1>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">
                      <FaInfoCircle className="me-2" />
                      Informasi Kelas
                    </h5>
                    <p className="card-text">
                      Total Siswa: {students.length} | Tingkat: {gradename}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3">
              {students.map((student, studentIndex) => (
                <div className="col-12" key={studentIndex}>
                  <div
                    className={`card ${
                      selectedStudent === studentIndex ? "border-primary" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedStudent(studentIndex)}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h5 className="card-title mb-1">{student.name}</h5>
                          <p className="card-subtitle text-muted">
                            NIS: {student.nis} | Kelas: {student.class}
                          </p>
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            goToDetail(student.userid, student.name)
                          }
                        >
                          <FaChartLine className="me-1" />
                          Detail
                        </button>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="card bg-light">
                            <div className="card-body">
                              <h6 className="card-title">
                                <FaBook className="me-2" />
                                Progress Target
                              </h6>
                              <div className="d-flex flex-column gap-2">
                                {student.progress.map((p, pIndex) => (
                                  <div key={pIndex} className="progress-item">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                      <span className="badge bg-secondary">
                                        Juz {p.juz}
                                      </span>
                                      <span className="badge bg-primary">
                                        {p.persentase}%
                                      </span>
                                    </div>
                                    <div
                                      className="progress"
                                      style={{ height: "8px" }}
                                    >
                                      <div
                                        className={`progress-bar ${getProgressColor(
                                          p.persentase
                                        )}`}
                                        role="progressbar"
                                        style={{ width: `${p.persentase}%` }}
                                        aria-valuenow={p.persentase}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card bg-light">
                            <div className="card-body">
                              <h6 className="card-title">
                                <FaCheckCircle className="me-2" />
                                Progress Melebihi Target
                              </h6>
                              {student.exceed && student.exceed.length > 0 ? (
                                <div className="d-flex flex-column gap-2">
                                  {student.exceed.map((e, eIndex) => (
                                    <div key={eIndex} className="progress-item">
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="badge bg-success">
                                          Juz {e.juz}
                                        </span>
                                        <span className="badge bg-info">
                                          {e.persentase}%
                                        </span>
                                      </div>
                                      <div
                                        className="progress"
                                        style={{ height: "8px" }}
                                      >
                                        <div
                                          className={`progress-bar ${getProgressColor(
                                            e.persentase
                                          )}`}
                                          role="progressbar"
                                          style={{ width: `${e.persentase}%` }}
                                          aria-valuenow={e.persentase}
                                          aria-valuemin="0"
                                          aria-valuemax="100"
                                        ></div>
                                      </div>
                                      <div className="d-flex justify-content-between mt-1">
                                        <small className="text-muted">
                                          <i className="fas fa-book-open me-1"></i>
                                          Ayat: {e.verses.completed}/
                                          {e.verses.target}
                                        </small>
                                        <small className="text-muted">
                                          <i className="fas fa-align-left me-1"></i>
                                          Baris: {e.lines.completed}/
                                          {e.lines.target}
                                        </small>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="alert alert-info py-2 mb-0">
                                  <small>
                                    <i className="fas fa-info-circle me-1"></i>
                                    Belum ada hafalan melebihi target
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedStudent !== null && (
              <div className="mt-4">
                <div className="card">
                  <div className="card-header">
                    <ul className="nav nav-tabs card-header-tabs">
                      <li className="nav-item">
                        <button
                          className={`nav-link ${
                            activeTab === "progress" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("progress")}
                        >
                          Progress
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${
                            activeTab === "statistics" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("statistics")}
                        >
                          Statistik
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div className="card-body">
                    {activeTab === "progress" && (
                      <div className="student-detail-content">
                        <h5 className="mb-3">Detail Progress Siswa</h5>
                        <div className="row">
                          <div className="col-md-6">
                            <h6>Target Hafalan</h6>
                            {students[selectedStudent].progress.map(
                              (p, index) => (
                                <div key={index} className="mb-3">
                                  <div className="d-flex justify-content-between">
                                    <span>Juz {p.juz}</span>
                                    <span className="badge bg-primary">
                                      {p.persentase}%
                                    </span>
                                  </div>
                                  <div
                                    className="progress mt-1"
                                    style={{ height: "10px" }}
                                  >
                                    <div
                                      className={`progress-bar ${getProgressColor(
                                        p.persentase
                                      )}`}
                                      style={{ width: `${p.persentase}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                          <div className="col-md-6">
                            <h6>Hafalan Melebihi Target</h6>
                            {students[selectedStudent].exceed &&
                            students[selectedStudent].exceed.length > 0 ? (
                              students[selectedStudent].exceed.map(
                                (e, index) => (
                                  <div key={index} className="mb-3">
                                    <div className="d-flex justify-content-between">
                                      <span>Juz {e.juz}</span>
                                      <span className="badge bg-success">
                                        {e.persentase}%
                                      </span>
                                    </div>
                                    <div
                                      className="progress mt-1"
                                      style={{ height: "10px" }}
                                    >
                                      <div
                                        className={`progress-bar ${getProgressColor(
                                          e.persentase
                                        )}`}
                                        style={{ width: `${e.persentase}%` }}
                                      ></div>
                                    </div>
                                    <div className="mt-2">
                                      <small className="text-muted">
                                        Ayat: {e.verses.completed}/
                                        {e.verses.target} | Baris:{" "}
                                        {e.lines.completed}/{e.lines.target}
                                      </small>
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="alert alert-info">
                                Belum ada hafalan melebihi target
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === "statistics" && (
                      <div className="student-detail-content">
                        <h5 className="mb-3">Statistik Hafalan</h5>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="card bg-light">
                              <div className="card-body">
                                <h6 className="card-title">
                                  Rata-rata Progress
                                </h6>
                                <p className="card-text">
                                  {(
                                    students[selectedStudent].progress.reduce(
                                      (acc, curr) => acc + curr.persentase,
                                      0
                                    ) /
                                    students[selectedStudent].progress.length
                                  ).toFixed(1)}
                                  %
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="card bg-light">
                              <div className="card-body">
                                <h6 className="card-title">Juz Terbanyak</h6>
                                <p className="card-text">
                                  Juz{" "}
                                  {
                                    students[selectedStudent].progress.reduce(
                                      (max, curr) =>
                                        curr.persentase > max.persentase
                                          ? curr
                                          : max,
                                      students[selectedStudent].progress[0]
                                    ).juz
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Tutup
            </button>
            <button type="button" className="btn btn-primary">
              <i className="fas fa-download me-1"></i>
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
