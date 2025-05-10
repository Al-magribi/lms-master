import React from "react";
import { Pie, Bar } from "react-chartjs-2";
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

const StudentDemographics = ({ studentDemographics }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Distribusi Usia Siswa",
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
          text: "Usia (Tahun)",
        },
      },
    },
  };

  return (
    <div className='row mb-4'>
      <div className='col-md-'>
        <div className='card'>
          <div className='card-header'>
            <h5 className='card-title mb-0'>Data Demografis Siswa</h5>
          </div>
          <div className='card-body'>
            <div className='row'>
              <div className='col-md-6'>
                <div className='table-responsive'>
                  <table className='table table-striped'>
                    <thead>
                      <tr>
                        <th>Informasi</th>
                        <th>Jumlah</th>
                        <th>Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr key='total'>
                        <td>Total Siswa</td>
                        <td>
                          {parseInt(studentDemographics?.total_students) || 0}
                        </td>
                        <td>100%</td>
                      </tr>
                      <tr key='male'>
                        <td>Laki-laki</td>
                        <td>
                          {parseInt(studentDemographics?.male_count) || 0}
                        </td>
                        <td>
                          {(
                            ((parseInt(studentDemographics?.male_count) || 0) /
                              (parseInt(studentDemographics?.total_students) ||
                                1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr key='female'>
                        <td>Perempuan</td>
                        <td>
                          {parseInt(studentDemographics?.female_count) || 0}
                        </td>
                        <td>
                          {(
                            ((parseInt(studentDemographics?.female_count) ||
                              0) /
                              (parseInt(studentDemographics?.total_students) ||
                                1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr key='age_range'>
                        <td>Rentang Usia</td>
                        <td colSpan='2'>
                          {studentDemographics?.min_age || 0} -{" "}
                          {studentDemographics?.max_age || 0} Tahun
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='col-md-6 d-flex align-items-center justify-content-center'>
                <div className='d-flex align-items-center justify-content-center h-100'>
                  <Pie
                    data={{
                      labels: ["Laki-laki", "Perempuan"],
                      datasets: [
                        {
                          data: [
                            parseInt(studentDemographics?.male_count) || 0,
                            parseInt(studentDemographics?.female_count) || 0,
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
            <div className='row mt-4'>
              <div className='col-md-6'>
                <h6 className='mb-3'>Distribusi Usia</h6>
                <div style={{ height: "300px", position: "relative" }}>
                  <Bar
                    data={{
                      labels:
                        studentDemographics?.age_distribution?.map(
                          (item) => item.age_group
                        ) || [],
                      datasets: [
                        {
                          label: "Jumlah Siswa",
                          data:
                            studentDemographics?.age_distribution?.map(
                              (item) => item.count
                            ) || [],
                          backgroundColor: "rgba(54, 162, 235, 0.8)",
                          borderColor: "rgba(54, 162, 235, 1)",
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={barChartOptions}
                  />
                </div>
              </div>
              <div className='col-md-6'>
                <div className='table-responsive mt-4'>
                  <table className='table table-striped'>
                    <thead>
                      <tr>
                        <th>Rentang Usia (Tahun)</th>
                        <th>Jumlah Siswa</th>
                        <th>Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDemographics?.age_distribution?.map(
                        (item, index) => (
                          <tr key={index}>
                            <td>{item.age_group}</td>
                            <td>{item.count}</td>
                            <td>
                              {(
                                ((item.count || 0) /
                                  (parseInt(
                                    studentDemographics?.total_students
                                  ) || 1)) *
                                100
                              ).toFixed(1)}
                              %
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDemographics;
