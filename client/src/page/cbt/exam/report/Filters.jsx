import React, { useState } from "react";
import { useGetFilterQuery } from "../../../../controller/api/log/ApiLog";
import "./Filters.css";

const Filters = ({
  classid,
  setClassid,
  examid,
  name,
  token,
  onRefetch,
  activeView,
  setActiveView,
  onExport,
}) => {
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const { data: classes, refetch: refetchClasses } = useGetFilterQuery(
    { exam: examid },
    { skip: !examid }
  );

  const handleRefetch = () => {
    setLastUpdateTime(new Date().toLocaleString());
    // Refetch all data
    refetchClasses();
    onRefetch();
  };

  return (
    <div className="card my-2 hover-shadow transition-all">
      <div className="card-body p-2">
        <div className="row g-3 align-items-center">
          {/* Title and Token Section */}
          <div className="col-md-4">
            <div className="d-flex gap-2 align-items-center">
              <span className="badge bg-primary px-3 py-2 rounded-pill">
                {token}
              </span>

              {lastUpdateTime && (
                <span className="badge bg-danger px-3 py-2 rounded-pill">
                  <i className="bi bi-clock-history me-1"></i>
                  Terakhir diperbarui: {lastUpdateTime}
                </span>
              )}
            </div>
          </div>

          {/* View Toggle Buttons */}
          <div className="col-md-4">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <button
                className={`btn btn-sm ${
                  activeView === "table" ? "btn-success" : "btn-outline-success"
                } rounded-pill hover-scale`}
                onClick={() => setActiveView("table")}
                title="Log"
              >
                <i className="bi bi-person-lines-fill"></i>
                <span className="ms-2">Log</span>
              </button>

              <button
                className={`btn btn-sm ${
                  activeView === "chart" ? "btn-success" : "btn-outline-success"
                } rounded-pill hover-scale`}
                onClick={() => setActiveView("chart")}
                title="Grafik"
              >
                <i className="bi bi-bar-chart"></i>
                <span className="ms-2">Grafik</span>
              </button>

              <button
                className={`btn btn-sm ${
                  activeView === "analysis"
                    ? "btn-success"
                    : "btn-outline-success"
                } rounded-pill hover-scale`}
                onClick={() => setActiveView("analysis")}
                title="Analisis"
              >
                <i className="bi bi-clipboard2-data-fill"></i>
                <span className="ms-2">Analisis</span>
              </button>

              <button
                className={`btn btn-sm ${
                  activeView === "list" ? "btn-success" : "btn-outline-success"
                } rounded-pill hover-scale`}
                onClick={() => setActiveView("list")}
                title="Nilai"
              >
                <i className="bi bi-file-earmark-excel"></i>
                <span className="ms-2">Nilai</span>
              </button>

              {(activeView === "table" ||
                activeView === "list" ||
                activeView === "analysis") && (
                <button
                  className="btn btn-sm btn-primary rounded-pill hover-scale"
                  onClick={onExport}
                  title="Export to Excel"
                >
                  <i className="bi bi-file-earmark-arrow-down"></i>
                  <span className="ms-2">Export</span>
                </button>
              )}
            </div>
          </div>

          {/* Class Filter Buttons */}
          <div className="col-md-4">
            <div className="d-flex justify-content-end gap-2 flex-wrap">
              {classes?.map((item) => (
                <button
                  key={item.id}
                  className={`btn btn-sm ${
                    classid === item.id
                      ? "btn-secondary"
                      : "btn-outline-secondary"
                  }  hover-scale`}
                  onClick={() => setClassid(item.id)}
                >
                  {item.name}
                </button>
              ))}
              <button
                className="btn btn-sm btn-dark  hover-scale"
                onClick={() => setClassid("")}
                title="Reset Filter"
              >
                <i className="bi bi-recycle"></i>
              </button>
              <button
                className="btn btn-sm btn-danger  hover-scale"
                onClick={handleRefetch}
                title="Refresh Data"
              >
                <i className="bi bi-repeat"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
