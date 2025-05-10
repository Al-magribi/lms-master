import React from "react";

const ProfileInfo = ({ user }) => {
  return (
    <div className="row">
      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-envelope me-2 text-primary"></i>
              Email
            </h5>
            <p className="card-text">{user?.email || "Tidak tersedia"}</p>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-telephone me-2 text-primary"></i>
              Whatsapp
            </h5>
            <p className="card-text">{user?.phone || "Tidak tersedia"}</p>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-building me-2 text-primary"></i>
              Satuan
            </h5>
            <p className="card-text">{user?.homebase || "Tidak tersedia"}</p>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-gender-ambiguous me-2 text-primary"></i>
              Jenis Kelamin
            </h5>
            <p className="card-text">
              {user?.gender === "L" ? "Laki-laki" : "Perempuan"}
            </p>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-people me-2 text-primary"></i>
              Status Wali Kelas
            </h5>
            <p className="card-text">
              {user?.homeroom ? (
                <>
                  <span className="badge bg-success me-2">Wali Kelas</span>
                  {user?.class || "Tidak tersedia"}
                </>
              ) : (
                <span className="badge bg-secondary">Bukan Wali Kelas</span>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-key me-2 text-primary"></i>
              Activation ID
            </h5>
            <p className="card-text small">
              {user?.activation || "Tidak tersedia"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
