import { useState, useEffect } from "react";
import Layout from "../../../components/layout/Layout";
import { useGetAdminDashboardQuery } from "../../../controller/api/dashboard/ApiDashboard";
import { Doughnut, Bar, Pie } from "react-chartjs-2";
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
import GeographicalDistribution from "../../../components/geographical/GeographicalDistribution";

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

const AdminDash = () => {
  const { data, isLoading } = useGetAdminDashboardQuery();

  if (isLoading) {
    return (
      <Layout title={"Dashboard"} levels={["admin"]}>
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  // Prepare Grade Data
  const gradeChartData = {
    labels:
      data?.studentsPerGrade?.map((grade) => `Kelas ${grade.grade_name}`) || [],
    datasets: [
      {
        data:
          data?.studentsPerGrade?.map(
            (grade) => parseInt(grade.total_students) || 0
          ) || [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(75, 192, 192, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare Teacher Data
  const teacherChartData = {
    labels: ["Laki-laki", "Perempuan"],
    datasets: [
      {
        data: [
          parseInt(data?.teacherComposition?.male_count) || 0,
          parseInt(data?.teacherComposition?.female_count) || 0,
        ],
        backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Prepare Class Distribution Data
  const classDistributionData = {
    labels: data?.studentsPerClass?.map((cls) => cls.class_name) || [],
    datasets: [
      {
        label: "Laki-laki",
        data:
          data?.studentsPerClass?.map((cls) => parseInt(cls.male_count) || 0) ||
          [],
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Perempuan",
        data:
          data?.studentsPerClass?.map(
            (cls) => parseInt(cls.female_count) || 0
          ) || [],
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const classDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Distribusi Siswa per Kelas",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            const datasetIndex = context.datasetIndex;
            const index = context.dataIndex;
            const cls = data?.studentsPerClass[index];
            const total =
              (parseInt(cls?.male_count) || 0) +
              (parseInt(cls?.female_count) || 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  // New chart data for db_student information
  // Geographical Distribution Chart

  // Entry Year Distribution Chart
  const entryChartData = {
    labels: data?.entryStats?.map((item) => item.entry_name) || [],
    datasets: [
      {
        label: "Jumlah Siswa",
        data:
          data?.entryStats?.map((item) => parseInt(item.student_count) || 0) ||
          [],
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const entryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Distribusi Siswa per Tahun Masuk",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Family Information Chart
  const familyChartData = {
    labels: [
      "Data Ayah",
      "Data Ibu",
      "Pekerjaan Ayah",
      "Pekerjaan Ibu",
      "Kontak Ayah",
      "Kontak Ibu",
    ],
    datasets: [
      {
        label: "Jumlah Siswa",
        data: [
          parseInt(data?.familyStats?.with_father_info) || 0,
          parseInt(data?.familyStats?.with_mother_info) || 0,
          parseInt(data?.familyStats?.with_father_job) || 0,
          parseInt(data?.familyStats?.with_mother_job) || 0,
          parseInt(data?.familyStats?.with_father_phone) || 0,
          parseInt(data?.familyStats?.with_mother_phone) || 0,
        ],
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Demographic Components
  const DemographicTable = ({ data }) => {
    const totalStudents = parseInt(data?.total_students) || 0;

    const calculatePercentage = (value) => {
      return (((parseInt(value) || 0) / (totalStudents || 1)) * 100).toFixed(1);
    };

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead>
            <tr>
              <th className="text-center">Informasi</th>
              <th className="text-center">Jumlah</th>
              <th className="text-center">Persentase</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">Total Siswa</td>
              <td className="text-center">{totalStudents}</td>
              <td className="text-center">100%</td>
            </tr>
            <tr>
              <td className="text-center">Laki-laki</td>
              <td className="text-center">{parseInt(data?.male_count) || 0}</td>
              <td className="text-center">
                {calculatePercentage(data?.male_count)}%
              </td>
            </tr>
            <tr>
              <td className="text-center">Perempuan</td>
              <td className="text-center">
                {parseInt(data?.female_count) || 0}
              </td>
              <td className="text-center">
                {calculatePercentage(data?.female_count)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const AgeDistributionChart = ({ data }) => {
    const ageDistribution = data?.age_distribution || [];

    const chartData = {
      labels: ageDistribution.map((item) => item.age_group),
      datasets: [
        {
          label: "Jumlah Siswa",
          data: ageDistribution.map((item) => item.count),
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(201, 203, 207, 0.8)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(201, 203, 207, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "Distribusi Usia Siswa (Rentang Dinamis)",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Jumlah Siswa",
          },
        },
        x: {
          title: {
            display: true,
            text: "Rentang Usia (Tahun)",
          },
        },
      },
    };

    return (
      <div style={{ height: "300px", position: "relative" }}>
        <Bar data={chartData} options={options} />
      </div>
    );
  };

  const AgeDistributionTable = ({ data }) => {
    const totalStudents = parseInt(data?.total_students) || 0;
    const ageDistribution = data?.age_distribution || [];

    const calculatePercentage = (value) => {
      return (((parseInt(value) || 0) / (totalStudents || 1)) * 100).toFixed(1);
    };

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead>
            <tr>
              <th className="text-center">Rentang Usia</th>
              <th className="text-center">Jumlah</th>
              <th className="text-center">Persentase</th>
            </tr>
          </thead>
          <tbody>
            {ageDistribution.map((item, index) => (
              <tr key={index}>
                <td className="text-center">{item.age_group}</td>
                <td className="text-center">{item.count}</td>
                <td className="text-center">
                  {calculatePercentage(item.count)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout title={"Dashboard"} levels={["admin"]}>
      <div className="container-fluid p-4">
        {/* Basic Statistics Cards */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Total Siswa</h6>
                <div className="d-flex align-items-center">
                  <i className="bi bi-people fs-2 me-2 text-primary"></i>
                  <h2 className="card-title mb-0">
                    {parseInt(data?.basicStats?.total_students) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Total Guru</h6>
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-video3 fs-2 me-2 text-success"></i>
                  <h2 className="card-title mb-0">
                    {parseInt(data?.basicStats?.total_teachers) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Total Kelas</h6>
                <div className="d-flex align-items-center">
                  <i className="bi bi-book fs-2 me-2 text-info"></i>
                  <h2 className="card-title mb-0">
                    {parseInt(data?.basicStats?.total_classes) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">
                  Total Mata Pelajaran
                </h6>
                <div className="d-flex align-items-center">
                  <i className="bi bi-journal-text fs-2 me-2 text-warning"></i>
                  <h2 className="card-title mb-0">
                    {parseInt(data?.basicStats?.total_subjects) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Statistics Cards */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Total Ujian</h6>
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark-text fs-2 me-2 text-danger"></i>
                  <h2 className="card-title mb-0">
                    {parseInt(data?.basicStats?.total_exams) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">
                  Total Bank Soal
                </h6>
                <div className="d-flex align-items-center">
                  <i className="bi bi-collection fs-2 me-2 text-secondary"></i>
                  <h2 className="card-title mb-0">
                    {parseInt(data?.basicStats?.total_banks) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Total Bab</h6>
                <div className="d-flex align-items-center">
                  <i className="bi bi-bookmark fs-2 me-2 text-primary"></i>
                  <h2 className="card-title mb-0">
                    {parseInt(data?.basicStats?.total_chapters) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">
                  Total Materi Pembelajaran
                </h6>
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark-richtext fs-2 me-2 text-success"></i>
                  <h2 className="card-title mb-0">
                    {parseInt(data?.basicStats?.total_learning_materials) || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row g-4 mb-4">
          {/* Students per Grade Chart */}
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Distribusi Siswa per Tingkat
                </h5>
              </div>
              <div className="card-body">
                <div style={{ height: "300px", position: "relative" }}>
                  <Doughnut data={gradeChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Gender Distribution */}
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">Komposisi Guru</h5>
              </div>
              <div className="card-body">
                <div style={{ height: "300px", position: "relative" }}>
                  <Doughnut data={teacherChartData} options={chartOptions} />
                </div>
                <div className="mt-3">
                  <p className="mb-1">
                    Total Guru: {data?.teacherComposition?.total_teachers || 0}
                  </p>
                  <p className="mb-1">
                    Guru Wali Kelas:{" "}
                    {data?.teacherComposition?.homeroom_count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Demographics Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Data Demografis Siswa</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="mb-3">Informasi Dasar</h6>
                    <DemographicTable data={data?.studentDemographics} />
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-3">Distribusi Gender</h6>
                    <div style={{ height: "300px", position: "relative" }}>
                      <Pie
                        data={{
                          labels: ["Laki-laki", "Perempuan"],
                          datasets: [
                            {
                              data: [
                                parseInt(
                                  data?.studentDemographics?.male_count
                                ) || 0,
                                parseInt(
                                  data?.studentDemographics?.female_count
                                ) || 0,
                              ],
                              backgroundColor: [
                                "rgba(54, 162, 235, 0.8)",
                                "rgba(255, 99, 132, 0.8)",
                              ],
                              borderColor: [
                                "rgba(54, 162, 235, 1)",
                                "rgba(255, 99, 132, 1)",
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={chartOptions}
                      />
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-md-6">
                    <h6 className="mb-3">Distribusi Usia</h6>
                    <AgeDistributionChart data={data?.studentDemographics} />
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-3">Detail Distribusi Usia</h6>
                    <AgeDistributionTable data={data?.studentDemographics} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Geographical Distribution Section */}
        <div className="row g-4 mb-4">
          <GeographicalDistribution data={data?.geographicalDistribution} />
        </div>

        {/* Entry Year Distribution */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Distribusi Siswa per Tahun Masuk
                </h5>
              </div>
              <div className="card-body">
                <div style={{ height: "300px", position: "relative" }}>
                  <Bar data={entryChartData} options={entryChartOptions} />
                </div>
                <div className="table-responsive mt-4">
                  <table className="table table-striped table-hover table-bordered">
                    <thead>
                      <tr>
                        <th className="text-center">Tahun Masuk</th>
                        <th className="text-center">Jumlah Siswa</th>
                        <th className="text-center">Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.entryStats || []).map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{item.entry_name}</td>
                          <td className="text-center">
                            {parseInt(item.student_count) || 0}
                          </td>
                          <td className="text-center">
                            {(
                              ((parseInt(item.student_count) || 0) /
                                (parseInt(
                                  data?.studentDemographics?.total_students
                                ) || 1)) *
                              100
                            ).toFixed(1)}
                            %
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

        {/* Student Data Completeness by Grade */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Kelangkapan Data Siswa per Tingkat
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div style={{ height: "300px", position: "relative" }}>
                      <Bar
                        data={{
                          labels:
                            data?.studentCompleteness?.map(
                              (grade) => `Grade ${grade.grade_name}`
                            ) || [],
                          datasets: [
                            {
                              label: "Total Students",
                              data:
                                data?.studentCompleteness?.map(
                                  (grade) => grade.total_students
                                ) || [],
                              backgroundColor: "rgba(54, 162, 235, 0.8)",
                              borderColor: "rgba(54, 162, 235, 1)",
                              borderWidth: 1,
                            },
                            {
                              label: "Complete Data",
                              data:
                                data?.studentCompleteness?.map(
                                  (grade) => grade.complete_students
                                ) || [],
                              backgroundColor: "rgba(75, 192, 192, 0.8)",
                              borderColor: "rgba(75, 192, 192, 1)",
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                            },
                            title: {
                              display: true,
                              text: "Student Data Completeness by Grade",
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "Number of Students",
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="table-responsive">
                      <table className="table table-striped table-hover table-bordered">
                        <thead>
                          <tr>
                            <th className="text-center align-middle">
                              Tingkat
                            </th>
                            <th className="text-center align-middle">
                              Total Siswa
                            </th>
                            <th className="text-center align-middle">
                              Lengkap
                            </th>
                            <th className="text-center align-middle">
                              Belum Lengkap
                            </th>
                            <th className="text-center align-middle">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.studentCompleteness?.map((grade) => (
                            <tr key={grade.grade_name}>
                              <td className="text-center">
                                {grade.grade_name}
                              </td>
                              <td className="text-center">
                                {grade.total_students}
                              </td>
                              <td className="text-center">
                                {grade.complete_students}
                              </td>
                              <td className="text-center">
                                {grade.total_students - grade.complete_students}
                              </td>
                              <td className="text-center">
                                {(
                                  (grade.complete_students /
                                    grade.total_students) *
                                  100
                                ).toFixed(1)}
                                %
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
        </div>

        {/* Class Distribution Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Distribusi Siswa per Kelas</h5>
              </div>
              <div className="card-body">
                <div style={{ height: "400px", position: "relative" }}>
                  <Bar
                    data={classDistributionData}
                    options={classDistributionOptions}
                  />
                </div>
                <div className="table-responsive mt-4">
                  <table className="table table-striped table-hover table-bordered">
                    <thead>
                      <tr>
                        <th className="text-center">Tingkat</th>
                        <th className="text-center">Kelas</th>
                        <th className="text-center">Total Siswa</th>
                        <th className="text-center">Laki-laki</th>
                        <th className="text-center">Perempuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.studentsPerClass || []).map((cls) => (
                        <tr key={cls.class_name}>
                          <td className="text-center">{cls.grade_name}</td>
                          <td className="text-center">{cls.class_name}</td>
                          <td className="text-center">
                            {parseInt(cls.total_students) || 0}
                          </td>
                          <td className="text-center">
                            {parseInt(cls.male_count) || 0}
                          </td>
                          <td className="text-center">
                            {parseInt(cls.female_count) || 0}
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

        {/* Activity Logs and Recent Activities */}
        <div className="row g-4 mb-4">
          {/* Activity Logs */}
          <div className="col-12 col-lg-7">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Log Aktivitas</h5>
                <small className="text-muted">10 aktivitas terbaru</small>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "15%" }}>Waktu</th>
                        <th style={{ width: "15%" }}>Pengguna</th>
                        <th style={{ width: "10%" }}>Tipe</th>
                        <th style={{ width: "20%" }}>Aksi</th>
                        <th style={{ width: "15%" }}>Status</th>
                        <th style={{ width: "15%" }}>IP</th>
                        <th style={{ width: "10%" }}>Browser</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.activityLogs || []).map((log) => (
                        <tr key={log.id}>
                          <td>{new Date(log.createdat).toLocaleString()}</td>
                          <td>{log.user_name}</td>
                          <td>
                            {log.user_type === "Siswa" && (
                              <span className="badge bg-primary">Siswa</span>
                            )}
                            {log.user_type === "Guru" && (
                              <span className="badge bg-success">Guru</span>
                            )}
                            {log.user_type === "Admin" && (
                              <span className="badge bg-danger">Admin</span>
                            )}
                          </td>
                          <td>{log.action}</td>
                          <td>
                            {log.islogin && (
                              <span className="badge bg-info me-1">Login</span>
                            )}
                            {log.ispenalty && (
                              <span className="badge bg-warning me-1">
                                Penalty
                              </span>
                            )}
                            {log.isactive && (
                              <span className="badge bg-success me-1">
                                Aktif
                              </span>
                            )}
                            {log.isdone && (
                              <span className="badge bg-secondary me-1">
                                Selesai
                              </span>
                            )}
                          </td>
                          <td>{log.ip}</td>
                          <td>
                            {log.browser_name} {log.browser_version}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="col-12 col-lg-5">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Aktivitas Terbaru</h5>
                <small className="text-muted">10 aktivitas terbaru</small>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "20%" }}>Jenis</th>
                        <th style={{ width: "40%" }}>Judul</th>
                        <th style={{ width: "20%" }}>Guru</th>
                        <th style={{ width: "20%" }}>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.recentActivities || []).map((activity, index) => (
                        <tr key={index}>
                          <td>
                            {activity.type === "exam" && (
                              <span className="badge bg-danger">Ujian</span>
                            )}
                            {activity.type === "subject" && (
                              <span className="badge bg-primary">
                                Mata Pelajaran
                              </span>
                            )}
                            {activity.type === "chapter" && (
                              <span className="badge bg-success">Bab</span>
                            )}
                          </td>
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

export default AdminDash;
