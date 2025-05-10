import React from "react";

const PasswordForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  showPasswords,
  togglePasswordVisibility,
}) => {
  return (
    <div className="card shadow">
      <div className="card-header bg-warning text-dark">
        <h4 className="mb-0">
          <i className="bi bi-shield-lock me-2"></i>
          Ubah Password
        </h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Password Lama</label>
            <div className="input-group">
              <input
                type={showPasswords.oldPassword ? "text" : "password"}
                className="form-control"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
                placeholder="Masukkan password lama"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => togglePasswordVisibility("oldPassword")}
              >
                <i
                  className={`bi bi-eye${
                    showPasswords.oldPassword ? "-slash" : ""
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password Baru</label>
            <div className="input-group">
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                className="form-control"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Masukkan password baru"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => togglePasswordVisibility("newPassword")}
              >
                <i
                  className={`bi bi-eye${
                    showPasswords.newPassword ? "-slash" : ""
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Konfirmasi Password Baru</label>
            <div className="input-group">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Konfirmasi password baru"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                <i
                  className={`bi bi-eye${
                    showPasswords.confirmPassword ? "-slash" : ""
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-warning">
            <i className="bi bi-key me-1"></i>
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordForm;
