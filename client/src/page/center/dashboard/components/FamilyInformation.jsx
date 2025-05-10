import React from "react";
import { Bar } from "react-chartjs-2";
import { barChartOptions } from "./chartOptions";

const FamilyInformation = ({ familyStats, studentDemographics }) => {
  // Parse the data from familyStats
  const data = {
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
          parseInt(familyStats?.with_father_info) || 0,
          parseInt(familyStats?.with_mother_info) || 0,
          parseInt(familyStats?.with_father_job) || 0,
          parseInt(familyStats?.with_mother_job) || 0,
          parseInt(familyStats?.with_father_phone) || 0,
          parseInt(familyStats?.with_mother_phone) || 0,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const totalStudents = parseInt(studentDemographics?.total_students) || 0;

  return (
    <div className="row mb-4">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Informasi Keluarga Siswa</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div style={{ height: "300px", position: "relative" }}>
                  <Bar data={data} options={barChartOptions} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>Informasi</th>
                        <th>Jumlah</th>
                        <th>Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Data Ayah</td>
                        <td>{parseInt(familyStats?.with_father_info) || 0}</td>
                        <td>
                          {(
                            ((parseInt(familyStats?.with_father_info) || 0) /
                              totalStudents) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>Data Ibu</td>
                        <td>{parseInt(familyStats?.with_mother_info) || 0}</td>
                        <td>
                          {(
                            ((parseInt(familyStats?.with_mother_info) || 0) /
                              totalStudents) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>Pekerjaan Ayah</td>
                        <td>{parseInt(familyStats?.with_father_job) || 0}</td>
                        <td>
                          {(
                            ((parseInt(familyStats?.with_father_job) || 0) /
                              totalStudents) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>Pekerjaan Ibu</td>
                        <td>{parseInt(familyStats?.with_mother_job) || 0}</td>
                        <td>
                          {(
                            ((parseInt(familyStats?.with_mother_job) || 0) /
                              totalStudents) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>Kontak Ayah</td>
                        <td>{parseInt(familyStats?.with_father_phone) || 0}</td>
                        <td>
                          {(
                            ((parseInt(familyStats?.with_father_phone) || 0) /
                              totalStudents) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>Kontak Ibu</td>
                        <td>{parseInt(familyStats?.with_mother_phone) || 0}</td>
                        <td>
                          {(
                            ((parseInt(familyStats?.with_mother_phone) || 0) /
                              totalStudents) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
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

export default FamilyInformation;
