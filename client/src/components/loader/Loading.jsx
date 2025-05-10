import React from "react";
import Layout from "../layout/Layout";

const Loading = ({ title, levels }) => {
  return (
    <Layout title={title} levels={levels}>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Memuat data...</span>
        </div>
      </div>
    </Layout>
  );
};

export default Loading;
