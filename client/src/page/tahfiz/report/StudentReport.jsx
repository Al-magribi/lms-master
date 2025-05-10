import React from "react";
import Layout from "../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import { useGetStudentReportQuery } from "../../../controller/api/tahfiz/ApiReport";

const StudentReport = () => {
  const { userid, name } = useParams();

  const { data, isLoading } = useGetStudentReportQuery(userid, {
    skip: !userid,
  });

  if (isLoading) {
    return (
      <Layout
        title={`Laporan Hafalan ${name.replace(/-/g, " ")}`}
        levels={["tahfiz", "student", "parent"]}
      >
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Laporan Hafalan`} levels={["tahfiz", "student", "parent"]}>
      <div className="print-section container">
        <div className="my-4">
          <h6 className="mb-3">
            <i className="bi bi-person-circle me-2"></i>
            Informasi Siswa
          </h6>
          <div className="ps-4">
            <p className="mb-1">Nama: {data?.student_name}</p>
            <p className="mb-1">NIS: {data?.student_nis}</p>
            <p className="mb-1">
              Kelas: {data?.grade} - {data?.class}
            </p>
            <p className="mb-1">Sekolah: {data?.homebase}</p>
          </div>
        </div>

        <div className="my-2">
          <p className="m-0 h5">Target Hafalan</p>
        </div>

        <div className="row g-4">
          {data?.memorization.map((juz, index) => (
            <div className="col-6" key={index}>
              <div className="card border-primary h-100">
                <div className="card-header bg-primary text-white py-2">
                  <h6 className="mb-0">{juz.juz}</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="progress" style={{ height: "20px" }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${juz.progress}%` }}
                      >
                        {juz.progress}%
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-layout-text-window me-2"></i>
                        <div>
                          <div>Baris</div>
                          <strong>
                            {juz.completed}/{juz.lines}
                          </strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-bookmark me-2"></i>
                        <div>
                          <div>Ayat</div>
                          <strong>
                            {juz.completed}/{juz.verses}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className="mb-2">Detail Surah:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {juz.surah && juz.surah.length > 0 ? (
                        juz.surah.map((surah, idx) => (
                          <p key={idx} className="m-0">
                            {surah.surah_name}
                            <span className="badge bg-info ms-2">
                              {surah.verse} ayat | {surah.line} baris
                            </span>
                          </p>
                        ))
                      ) : (
                        <p className="text-muted">
                          Belum ada surah yang dihafal
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data?.exceed && data.exceed.length > 0 && (
          <>
            <div className="my-2">
              <p className="m-0 h5">Melebihi Target Hafalan</p>
            </div>
            <div className="row g-4">
              {data.exceed.map((juz, index) => (
                <div className="col-6" key={index}>
                  <div className="card border-primary h-100">
                    <div className="card-header bg-primary text-white py-2">
                      <h6 className="mb-0">{juz.juz}</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <div className="progress" style={{ height: "20px" }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${juz.progress}%` }}
                          >
                            {juz.progress}%
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-6">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-layout-text-window me-2"></i>
                            <div>
                              <div>Baris</div>
                              <strong>
                                {juz.completed}/{juz.lines}
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-bookmark me-2"></i>
                            <div>
                              <div>Ayat</div>
                              <strong>
                                {juz.completed}/{juz.verses}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h6 className="mb-2">Detail Surah:</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {juz?.surah && juz.surah.length > 0 ? (
                            juz.surah.map((surah, idx) => (
                              <p key={idx} className="m-0">
                                {surah.surah_name}
                                <span className="badge bg-info ms-2">
                                  {surah.verse} ayat | {surah.line} baris
                                </span>
                              </p>
                            ))
                          ) : (
                            <p className="text-muted">
                              Belum ada surah yang dihafal
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-section,
    .print-section * {
      visibility: visible;
    }
    .print-section {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 20px;
    }
    
    .card {
      border: 1px solid #0d6efd !important;
      break-inside: avoid;
    }
    .progress {
      border: 1px solid #dee2e6;
    }
    .progress-bar {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .bg-primary, .bg-info, .bg-success {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .badge {
      border: 1px solid #0dcaf0;
    }
    hr {
      border-top: 1px solid #000;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
    }
    .col-6 {
      width: 50%;
      padding: 0 15px;
    }
  }
`;

const style = document.createElement("style");
style.innerHTML = printStyles;
document.head.appendChild(style);

export default StudentReport;
