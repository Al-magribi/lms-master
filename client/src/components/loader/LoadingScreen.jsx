import React from "react";

const LoadingScreen = ({ logo }) => {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "100vh", backgroundColor: "#f8f9fa" }}
    >
      {logo && (
        <img
          src={logo}
          alt="logo"
          style={{ height: 120, width: 120, marginBottom: "2rem" }}
        />
      )}

      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted">Memuat aplikasi...</p>
    </div>
  );
};

export default LoadingScreen;
