import React from "react";
import { Bar } from "react-chartjs-2";

const EntryYearDistribution = ({
  entryStats,
  studentDemographics,
  entryChartOptions,
}) => {
  return (
    <div className='col-md-6 mt-4'>
      <div className='card h-100'>
        <div className='card-header'>
          <h5 className='card-title mb-0'>Distribusi Siswa per Tahun Masuk</h5>
        </div>
        <div className='card-body'>
          <div className='d-flex align-items-center justify-content-center h-50'>
            <Bar
              data={{
                labels: entryStats?.map((item) => item.entry_name) || [],
                datasets: [
                  {
                    label: "Jumlah Siswa",
                    data:
                      entryStats?.map(
                        (item) => parseInt(item.student_count) || 0
                      ) || [],
                    backgroundColor: "rgba(54, 162, 235, 0.8)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={entryChartOptions}
            />
          </div>
          <div className='table-responsive mt-4'>
            <table className='table table-striped'>
              <thead>
                <tr>
                  <th>Tahun Masuk</th>
                  <th>Jumlah Siswa</th>
                  <th>Persentase</th>
                </tr>
              </thead>
              <tbody>
                {(entryStats || []).map((item, index) => (
                  <tr key={index}>
                    <td>{item.entry_name}</td>
                    <td>{parseInt(item.student_count) || 0}</td>
                    <td>
                      {(
                        ((parseInt(item.student_count) || 0) /
                          (parseInt(studentDemographics?.total_students) ||
                            1)) *
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
  );
};

export default EntryYearDistribution;
