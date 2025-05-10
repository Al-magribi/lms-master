import React from "react";

const ProfileForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          type="text"
          className="form-control"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Whatsapp</label>
        <input
          type="text"
          className="form-control"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" className="btn btn-info" disabled={isLoading}>
        <i className="bi bi-save me-1"></i>
        {isLoading ? "Loading..." : "Simpan Perubahan"}
      </button>
    </form>
  );
};

export default ProfileForm;
