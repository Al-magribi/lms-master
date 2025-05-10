import React from "react";
import Layout from "../../../components/layout/Layout";
import { useSelector } from "react-redux";
import { useGetStudentDashboardQuery } from "../../../controller/api/dashboard/ApiDashboard";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const StudentDash = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetStudentDashboardQuery();

  const goToReport = () => {
    const formattedName = user?.name.replace(/\s+/g, "-");
    navigate(`/tahfiz-laporan-siswa/${user?.user_id}/${formattedName}`);
  };

  if (isLoading) {
    return (
      <Layout title={"Dashboard"} levels={["student"]}>
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={"Dashboard"} levels={["student"]}>
      <div className="container-fluid py-4">
        <div className="row g-4">
          {/* Student Info Card */}
          <div className="col-lg-4 col-md-6 col-12">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-primary text-white py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="bi bi-person-circle me-2"></i>
                  Informasi Siswa
                </h5>
              </div>
              <div className="card-body p-3">
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                    <span className="fw-medium">Kelas</span>
                    <span className="badge bg-primary rounded-pill">
                      {data?.studentInfo?.class_name}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                    <span className="fw-medium">Tingkat</span>
                    <span className="badge bg-info rounded-pill">
                      {data?.studentInfo?.grade_name}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                    <span className="fw-medium">Jurusan</span>
                    <span className="badge bg-secondary rounded-pill">
                      {data?.studentInfo?.major_name || "-"}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                    <span className="fw-medium">Total Mata Pelajaran</span>
                    <span className="badge bg-success rounded-pill">
                      {data?.studentInfo?.total_subjects}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Exams Card */}
          <div className="col-lg-4 col-md-6 col-12">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-warning text-dark py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="bi bi-calendar-check me-2"></i>
                  Ujian Mendatang
                </h5>
              </div>
              <div className="card-body p-3">
                {data?.upcomingExams?.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {data.upcomingExams.map((exam) => (
                      <div key={exam.id} className="list-group-item py-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0 fw-medium">{exam.name}</h6>
                          <span className="badge bg-warning text-dark">
                            {format(new Date(exam.createdat), "dd MMM", {
                              locale: id,
                            })}
                          </span>
                        </div>
                        <div className="small text-muted">
                          <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-book me-2"></i>
                            {exam.subject_name}
                          </div>
                          <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-person me-2"></i>
                            {exam.teacher_name}
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-clock me-2"></i>
                            {exam.duration} menit
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i
                      className="bi bi-calendar-x text-muted"
                      style={{ fontSize: "2.5rem" }}
                    ></i>
                    <p className="mt-2 mb-0 text-muted">
                      Tidak ada ujian mendatang
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Materials Card */}
          <div className="col-lg-4 col-md-6 col-12">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-info text-white py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="bi bi-journal-text me-2"></i>
                  Materi Terbaru
                </h5>
              </div>
              <div className="card-body p-3">
                {data?.recentMaterials?.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {data.recentMaterials.map((material) => (
                      <div key={material.id} className="list-group-item py-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0 fw-medium">{material.title}</h6>
                          <span className="badge bg-info text-dark">
                            {format(new Date(material.createdat), "dd MMM", {
                              locale: id,
                            })}
                          </span>
                        </div>
                        <div className="small text-muted">
                          <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-book me-2"></i>
                            {material.subject_name}
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-person me-2"></i>
                            {material.teacher_name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i
                      className="bi bi-journal-x text-muted"
                      style={{ fontSize: "2.5rem" }}
                    ></i>
                    <p className="mt-2 mb-0 text-muted">
                      Tidak ada materi terbaru
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quran Progress Card */}
          <div className="col-lg-4 col-md-6 col-12">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header d-flex justify-content-between align-items-center bg-success text-white py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="bi bi-book me-2"></i>
                  Progres Hafalan
                </h5>

                <button
                  className="btn btn-sm btn-outline-light"
                  title="Detail"
                  onClick={goToReport}
                >
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
              <div className="card-body p-3">
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                    <span className="fw-medium">Juz yang Selesai</span>
                    <span className="badge bg-success rounded-pill">
                      {data?.quranProgress?.completed_juz || 0}
                    </span>
                  </div>

                  <div className="list-group-item py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-medium">Aktivitas Terakhir</span>
                      <span className="badge bg-success">
                        {data?.quranProgress?.last_activity
                          ? format(
                              new Date(data.quranProgress.last_activity),
                              "dd MMM yyyy",
                              {
                                locale: id,
                              }
                            )
                          : "Belum ada aktivitas"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDash;
