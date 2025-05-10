import React from "react";
import { useGetTeacherDashboardQuery } from "../../../controller/api/dashboard/ApiDashboard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Layout from "../../../components/layout/Layout";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const TeacherDash = () => {
  const { data: dashboardData, isLoading } = useGetTeacherDashboardQuery();

  if (isLoading) {
    return <div className='text-center p-5'>Loading...</div>;
  }

  const { teachingStats, recentExams, recentMaterials } = dashboardData;

  // Prepare data for teaching stats doughnut chart
  const teachingStatsData = {
    labels: [
      "Mata Pelajaran",
      "Kelas",
      "Ujian",
      "Bank Soal",
      "Materi Pembelajaran",
      "Kelas Materi",
    ],
    datasets: [
      {
        data: [
          teachingStats.total_subjects,
          teachingStats.total_classes,
          teachingStats.total_exams,
          teachingStats.total_banks,
          teachingStats.total_chapters,
          teachingStats.total_material_classes,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Layout title={"Dashboard Guru"} levels={["teacher"]}>
      <div className='container-fluid p-0'>
        {/* Statistics Cards */}
        <div className='row g-4 mb-4'>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='card h-100'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <i className='bi bi-book fs-4 me-3 text-primary'></i>
                  <div>
                    <div className='text-muted'>Total Mata Pelajaran</div>
                    <h4 className='mb-0'>{teachingStats.total_subjects}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='card h-100'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <i className='bi bi-people fs-4 me-3 text-success'></i>
                  <div>
                    <div className='text-muted'>Total Kelas</div>
                    <h4 className='mb-0'>{teachingStats.total_classes}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='card h-100'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <i className='bi bi-file-text fs-4 me-3 text-warning'></i>
                  <div>
                    <div className='text-muted'>Total Ujian</div>
                    <h4 className='mb-0'>{teachingStats.total_exams}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='card h-100'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <i className='bi bi-bank fs-4 me-3 text-info'></i>
                  <div>
                    <div className='text-muted'>Bank Soal</div>
                    <h4 className='mb-0'>{teachingStats.total_banks}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activities */}
        <div className='row g-4 mb-4'>
          {/* Teaching Statistics Chart */}
          <div className='col-12 col-lg-4'>
            <div className='card h-100'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Statistik Pengajaran</h5>
              </div>
              <div className='card-body' style={{ height: "500px" }}>
                <Doughnut
                  data={teachingStatsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className='col-12 col-lg-4'>
            <div className='card h-100'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Aktivitas Terbaru</h5>
              </div>
              <div
                className='card-body'
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <div className='list-group list-group-flush'>
                  {recentExams?.length > 0 ? (
                    recentExams.map((exam) => (
                      <div key={exam.id} className='list-group-item'>
                        <div className='d-flex w-100 justify-content-between'>
                          <h6 className='mb-1'>{exam.name}</h6>
                          <small className='text-muted'>
                            {new Date(exam.createdat).toLocaleDateString()}
                          </small>
                        </div>
                        <p className='mb-1'>
                          Durasi: {exam.duration} menit | Status:{" "}
                          <span
                            className={`badge ${
                              exam.isactive ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {exam.isactive ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className='text-muted'>Data Belum tersedia</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Learning Materials */}
          <div className='col-12 col-lg-4'>
            <div className='card h-100'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Materi Pembelajaran Terbaru</h5>
              </div>
              <div
                className='card-body'
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <div className='list-group list-group-flush'>
                  {recentMaterials.map((material) => (
                    <div key={material.id} className='list-group-item'>
                      <div className='d-flex w-100 justify-content-between'>
                        <h6 className='mb-1'>{material.title}</h6>
                        <small className='text-muted'>
                          {new Date(material.createdat).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDash;
