import React from "react";
import { useGetHomeInfografisQuery } from "../../controller/api/dashboard/ApiDashboard";

const Infographic = ({ metrics }) => {
  const { data, isLoading, error } = useGetHomeInfografisQuery();

  if (isLoading) {
    return (
      <section id="infografis" className="bg-light py-5">
        <div className="container">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Memuat...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="infografis" className="bg-light py-5">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            Kesalahan saat memuat data infografis:{" "}
            {error.message || "Kesalahan tidak diketahui"}
          </div>
        </div>
      </section>
    );
  }

  // Extract data from the API response
  const basicStats = data?.basicStats || {
    total_students: 0,
    total_teachers: 0,
  };
  const geographicalData = data?.geographicalDistribution
    ?.geographical_data || {
    provinces: [],
    cities: [],
    districts: [],
    villages: [],
  };

  // Calculate student-teacher ratio
  const studentTeacherRatio =
    basicStats.total_teachers > 0
      ? (basicStats.total_students / basicStats.total_teachers).toFixed(1)
      : 0;

  return (
    <section id="infografis" className="bg-light py-5">
      <div className="container">
        <h2 className="text-center mb-5">Infografis Sekolah</h2>

        {/* Basic Stats with Icons */}
        <div className="row mb-5">
          <div className="col-md-4 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <i
                  style={{ color: metrics?.primary_color }}
                  className="bi bi-people-fill display-1 mb-3"
                ></i>
                <h3 className="card-title">
                  {basicStats.total_students.toLocaleString()}
                </h3>
                <p className="card-text">Total Siswa</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <i
                  style={{ color: metrics?.primary_color }}
                  className="bi bi-person-workspace display-1 mb-3"
                ></i>
                <h3 className="card-title">
                  {basicStats.total_teachers.toLocaleString()}
                </h3>
                <p className="card-text">Total Guru</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <i
                  style={{ color: metrics?.primary_color }}
                  className="bi bi-graph-up display-1 mb-3"
                ></i>
                <h3 className="card-title">{studentTeacherRatio}:1</h3>
                <p className="card-text">Rasio Siswa-Guru</p>
              </div>
            </div>
          </div>
        </div>

        {/* Geographical Distribution */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card">
              <div
                style={{
                  backgroundColor: metrics?.primary_color,
                  color: metrics?.secondary_color,
                }}
                className="card-header"
              >
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt-fill me-2"></i>Distribusi
                  Geografis
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Provinces */}
                  <div className="col-md-6 mb-4">
                    <h5 className="border-bottom pb-2">
                      <i className="bi bi-map-fill me-2"></i>Provinsi Teratas
                    </h5>
                    <ul className="list-group">
                      {geographicalData.provinces
                        ?.slice(0, 5)
                        .map((province, index) => (
                          <li
                            key={index}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            {province.province_name}
                            <span
                              style={{
                                backgroundColor: metrics?.secondary_color,
                                color: metrics?.primary_color,
                              }}
                              className="badge rounded-pill"
                            >
                              {province.student_count.toLocaleString()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Cities */}
                  <div className="col-md-6 mb-4">
                    <h5 className="border-bottom pb-2">
                      <i className="bi bi-building-fill me-2"></i>Kota Teratas
                    </h5>
                    <ul className="list-group">
                      {geographicalData.cities
                        ?.slice(0, 5)
                        .map((city, index) => (
                          <li
                            key={index}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            {city.city_name}, {city.province_name}
                            <span
                              style={{
                                backgroundColor: metrics?.secondary_color,
                                color: metrics?.primary_color,
                              }}
                              className="badge rounded-pill"
                            >
                              {city.student_count.toLocaleString()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="row">
                  {/* Districts */}
                  <div className="col-md-6 mb-4">
                    <h5 className="border-bottom pb-2">
                      <i className="bi bi-grid-3x3-gap-fill me-2"></i>Kecamatan
                      Teratas
                    </h5>
                    <ul className="list-group">
                      {geographicalData.districts
                        ?.slice(0, 5)
                        .map((district, index) => (
                          <li
                            key={index}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            {district.district_name}, {district.city_name}
                            <span
                              style={{
                                backgroundColor: metrics?.secondary_color,
                                color: metrics?.primary_color,
                              }}
                              className="badge rounded-pill"
                            >
                              {district.student_count.toLocaleString()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Villages */}
                  <div className="col-md-6 mb-4">
                    <h5 className="border-bottom pb-2">
                      <i className="bi bi-house-fill me-2"></i>Desa/Kelurahan
                      Teratas
                    </h5>
                    <ul className="list-group">
                      {geographicalData.villages
                        ?.slice(0, 5)
                        .map((village, index) => (
                          <li
                            key={index}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            {village.village_name}, {village.district_name}
                            <span
                              style={{
                                backgroundColor: metrics?.secondary_color,
                                color: metrics?.primary_color,
                              }}
                              className="badge rounded-pill"
                            >
                              {village.student_count.toLocaleString()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Infographic;
