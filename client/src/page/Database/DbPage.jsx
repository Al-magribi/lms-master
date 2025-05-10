import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { useParams, useNavigate } from "react-router-dom";
import Biodata from "./Biodata";
import Parent from "./Parent";
import Family from "./Family";
import { useGetStudentDataQuery } from "../../controller/api/database/ApiDatabase";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const DbPage = () => {
  const navigate = useNavigate();
  const { name, nis, periode, userid } = useParams();
  const [activeTab, setActiveTab] = useState("biodata");

  const { data, isLoading, isError, refetch } = useGetStudentDataQuery(userid);
  const { user } = useSelector((state) => state.auth);

  const studentData = data?.data;

  const handleTab = (tab) => {
    setActiveTab(tab);
  };

  const goToDatabase = () => {
    navigate("/database");
  };

  const handleRefetch = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Layout
        title={`Database ${name.replace(/-/g, " ")}`}
        levels={["admin", "teacher", "student", "parent"]}
      >
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // if (!studentData) {
  //   return (
  //     <Layout
  //       title={`Database ${name.replace(/-/g, " ")}`}
  //       levels={["admin", "teacher", "student", "parent"]}
  //     >
  //       <div className="alert alert-danger text-center">
  //         Data siswa tidak ditemukan
  //       </div>
  //     </Layout>
  //   );
  // }

  return (
    <Layout
      title={`Database ${name.replace(/-/g, " ")}`}
      levels={["admin", "teacher", "student", "parent"]}
    >
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-secondary">
                      <i className="bi bi-calendar me-1"></i>
                      {studentData?.periode_name}
                    </span>

                    <span className="badge bg-primary">
                      {studentData?.grade_name} {studentData?.class_name}
                    </span>

                    <span className="badge bg-info">
                      <i className="bi bi-person me-1"></i>
                      {studentData?.student_gender}
                    </span>

                    <span className="badge bg-success">
                      <i className="bi bi-check-circle me-1"></i>
                      {studentData?.isactive ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </div>

                  {user?.level === "admin" && (
                    <button
                      className="btn btn-sm btn-info"
                      onClick={goToDatabase}
                    >
                      <i className="bi bi-arrow-left"></i> Kembali
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <ul className="nav nav-tabs nav-fill mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "biodata" ? "active" : ""
                      }`}
                      onClick={() => handleTab("biodata")}
                    >
                      <i className="bi bi-person me-2"></i>
                      Biodata
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "parent" ? "active" : ""
                      }`}
                      onClick={() => handleTab("parent")}
                    >
                      <i className="bi bi-people me-2"></i>
                      Orang Tua
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "family" ? "active" : ""
                      }`}
                      onClick={() => handleTab("family")}
                    >
                      <i className="bi bi-person-lines-fill me-2"></i>
                      Keluarga
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  {activeTab === "biodata" && (
                    <Biodata
                      studentData={studentData && studentData}
                      userid={userid}
                      onRefetch={handleRefetch}
                    />
                  )}
                  {activeTab === "parent" && (
                    <Parent
                      studentData={studentData && studentData}
                      userid={userid}
                      onRefetch={handleRefetch}
                    />
                  )}
                  {activeTab === "family" && (
                    <Family
                      families={studentData?.family}
                      userid={userid}
                      onRefetch={handleRefetch}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DbPage;
