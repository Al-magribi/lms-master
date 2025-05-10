import React from "react";
import Layout from "../../../components/layout/Layout";
import { useGetCenterDashboardQuery } from "../../../controller/api/dashboard/ApiDashboard";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import StudentDemographics from "./components/StudentDemographics";
import GeographicalDistribution from "../../../components/geographical/GeographicalDistribution";
import EntryYearDistribution from "./components/EntryYearDistribution";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const CenterDash = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useGetCenterDashboardQuery();
  const { user } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <Layout title={"Dashboard Admin"} levels={["center"]}>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Memuat...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={"Dashboard Admin"} levels={["center"]}>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>Gagal memuat data dashboard. Silakan coba lagi nanti.</p>
          <hr />
          <p className="mb-0">Detail error: {error.message}</p>
        </div>
      </Layout>
    );
  }

  const {
    basicStats,
    studentsPerGrade,
    teacherComposition,
    recentActivities,
    homebaseStats,
    activityLogs,
    studentDemographics,
    geographicalDistribution,
    entryStats,
  } = dashboardData || {};

  return (
    <Layout title={"Dashboard Admin"} levels={["center"]}>
      <div className="container-fluid">
        {/* Overview Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Total Siswa</h5>
                <h2 className="card-text">{basicStats?.total_students || 0}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Total Guru</h5>
                <h2 className="card-text">{basicStats?.total_teachers || 0}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">Total Kelas</h5>
                <h2 className="card-text">{basicStats?.total_classes || 0}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h5 className="card-title">Total Homebase</h5>
                <h2 className="card-text">{basicStats?.total_homebase || 0}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Student Demographics */}
        <StudentDemographics studentDemographics={studentDemographics} />

        {/* Geographical Distribution and Entry Year */}
        <div className="row mb-3">
          <GeographicalDistribution data={geographicalDistribution} />
          <EntryYearDistribution
            entryStats={entryStats}
            studentDemographics={studentDemographics}
          />
        </div>

        {/* Homebase Statistics */}
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Statistik Homebase</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Homebase</th>
                        <th>Siswa</th>
                        <th>Guru</th>
                        <th>Kelas</th>
                        <th>Mata Pelajaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {homebaseStats?.map((homebase, index) => (
                        <tr key={`homebase-${index}-${homebase.homebase_name}`}>
                          <td>{homebase.homebase_name}</td>
                          <td>{homebase.total_students}</td>
                          <td>{homebase.total_teachers}</td>
                          <td>{homebase.total_classes}</td>
                          <td>{homebase.total_subjects}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Distribution by Grade */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Siswa per Kelas</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Kelas</th>
                        <th>Total Siswa</th>
                        <th>Laki-laki</th>
                        <th>Perempuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsPerGrade?.map((grade, index) => (
                        <tr key={`grade-${index}-${grade.grade_name}`}>
                          <td>{grade.grade_name}</td>
                          <td>{grade.total_students}</td>
                          <td>{grade.male_count}</td>
                          <td>{grade.female_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Komposisi Guru</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Distribusi Gender</h6>
                    <p>Laki-laki: {teacherComposition?.male_count || 0}</p>
                    <p>Perempuan: {teacherComposition?.female_count || 0}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Guru Wali Kelas</h6>
                    <p>Total: {teacherComposition?.homeroom_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Aktivitas Terbaru</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Tipe</th>
                        <th>Judul</th>
                        <th>Guru</th>
                        <th>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities?.map((activity, index) => (
                        <tr key={`activity-${index}-${activity.id}`}>
                          <td>{activity.type}</td>
                          <td>{activity.title}</td>
                          <td>{activity.teacher_name}</td>
                          <td>
                            {new Date(activity.createdat).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CenterDash;
