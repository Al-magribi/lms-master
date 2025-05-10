import React from "react";
import Layout from "../../../components/layout/Layout";
import { useGetAchievementQuery } from "../../../controller/api/tahfiz/ApiReport";
import GaugeChart from "react-gauge-chart";

const TahfizDash = () => {
  const { data, isLoading } = useGetAchievementQuery();

  const renderLoadingSkeleton = () => {
    return (
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <div
              className="skeleton-text"
              style={{
                width: "200px",
                height: "24px",
                background: "#eee",
                borderRadius: "4px",
              }}
            ></div>
          </div>
          <div className="card-body">
            <div className="row">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div
                        className="skeleton-text mb-3"
                        style={{
                          width: "120px",
                          height: "20px",
                          background: "#eee",
                          borderRadius: "4px",
                          margin: "0 auto",
                        }}
                      ></div>
                      <div
                        className="skeleton-gauge mb-3"
                        style={{
                          width: "200px",
                          height: "200px",
                          background: "#eee",
                          borderRadius: "50%",
                          margin: "0 auto",
                        }}
                      ></div>
                      <div
                        className="skeleton-text mb-2"
                        style={{
                          width: "150px",
                          height: "16px",
                          background: "#eee",
                          borderRadius: "4px",
                          margin: "0 auto",
                        }}
                      ></div>
                      <div className="d-flex gap-2 justify-content-center flex-wrap mb-2">
                        {[1, 2].map((_, idx) => (
                          <div
                            key={idx}
                            className="skeleton-badge"
                            style={{
                              width: "120px",
                              height: "24px",
                              background: "#eee",
                              borderRadius: "12px",
                            }}
                          ></div>
                        ))}
                      </div>
                      <div
                        className="skeleton-text"
                        style={{
                          width: "180px",
                          height: "20px",
                          background: "#eee",
                          borderRadius: "4px",
                          margin: "0 auto",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGradeGauges = () => {
    if (!data) return null;

    return data.map((item, index) => (
      <div key={index} className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              {item.homebase} {item.periode}
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              {item.grade.map((grade, gradeIndex) => {
                const percentage = grade.achievement;

                return (
                  <div key={gradeIndex} className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <h6 className="card-title">Tingkat {grade.name}</h6>
                        <GaugeChart
                          id={`gauge-chart-${index}-${gradeIndex}`}
                          percent={percentage / 100}
                          arcWidth={0.1}
                          colors={["#ff0048", "#ff7809", "#66ff2e"]}
                          textColor="#000000"
                          needleColor="#345243"
                          needleBaseColor="#345243"
                          animate={true}
                          formatTextValue={(value) =>
                            `${grade.achievement.toFixed(1)}%`
                          }
                        />
                        <div className="mt-2">
                          <p className="mb-1">
                            Pencapaian: {grade.achievement.toFixed(1)}%
                          </p>
                          <div className="border-top p-2 d-flex gap-2 justify-content-center flex-wrap">
                            {grade.target.map((target, idx) => (
                              <p
                                key={idx}
                                className="m-0 small badge bg-primary"
                              >
                                {target.juz} ({target.verses} ayat -{" "}
                                {target.lines} Baris)
                              </p>
                            ))}
                          </div>
                          <div className="border-top p-2 d-flex gap-2 justify-content-center">
                            <p className="m-0 h6">
                              Tuntas:{" "}
                              <span className="badge bg-success">
                                {grade.completed}
                              </span>{" "}
                              dari{" "}
                              <span className="badge bg-danger">
                                {grade.uncompleted}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Layout title={"Tahfiz - Dashboard"} levels={["tahfiz"]}>
      <div className="row g-2">
        {isLoading ? renderLoadingSkeleton() : renderGradeGauges()}
      </div>
    </Layout>
  );
};

export default TahfizDash;
