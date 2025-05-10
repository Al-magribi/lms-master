import React, { useState } from "react";
import GeographicalChart from "./GeographicalChart";
import GeographicalTable from "./GeographicalTable";

const GeographicalDistribution = ({ data }) => {
  const [activeTab, setActiveTab] = useState("province");
  const geographicalData = data?.geographical_data || {};

  const tabs = [
    { id: "province", title: "Provinsi" },
    { id: "city", title: "Kota" },
    { id: "district", title: "Kecamatan" },
    { id: "village", title: "Desa" },
  ];

  return (
    <div>
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Distribusi Geografis Siswa</h5>
          </div>
          <div className="card-body">
            {/* Navigation Tabs */}
            <ul className="nav nav-tabs mb-4" role="tablist">
              {tabs.map((tab, index) => (
                <li className="nav-item" role="presentation" key={index}>
                  <button
                    className={`nav-link ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                  >
                    {tab.title}
                  </button>
                </li>
              ))}
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "province" && (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <GeographicalChart
                          data={geographicalData.provinces}
                          title="Distribusi Siswa per Provinsi"
                          level="province"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <GeographicalTable
                          data={geographicalData.provinces}
                          level="province"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "city" && (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <GeographicalChart
                          data={geographicalData.cities}
                          title="Distribusi Siswa per Kota"
                          level="city"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <GeographicalTable
                          data={geographicalData.cities}
                          level="city"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "district" && (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <GeographicalChart
                          data={geographicalData.districts}
                          title="Distribusi Siswa per Kecamatan"
                          level="district"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <GeographicalTable
                          data={geographicalData.districts}
                          level="district"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "village" && (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <GeographicalChart
                          data={geographicalData.villages}
                          title="Distribusi Siswa per Desa"
                          level="village"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <GeographicalTable
                          data={geographicalData.villages}
                          level="village"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .nav-tabs {
          border-bottom: 1px solid #dee2e6;
        }
        .nav-tabs .nav-link {
          margin-bottom: -1px;
          border: 1px solid transparent;
          border-top-left-radius: 0.25rem;
          border-top-right-radius: 0.25rem;
          padding: 0.5rem 1rem;
          color: #6c757d;
          cursor: pointer;
          transition: color 0.15s ease-in-out, border-color 0.15s ease-in-out;
        }
        .nav-tabs .nav-link:hover {
          border-color: #e9ecef #e9ecef #dee2e6;
          isolation: isolate;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          background-color: #fff;
          border-color: #dee2e6 #dee2e6 #fff;
        }
        .card {
          transition: box-shadow 0.3s ease-in-out;
        }
        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        .tab-content {
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default GeographicalDistribution;
