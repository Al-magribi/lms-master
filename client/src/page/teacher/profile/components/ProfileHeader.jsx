import React from "react";

const ProfileHeader = ({ user, isEditing, setIsEditing }) => {
  return (
    <div className="card-header bg-info d-flex justify-content-between align-items-center">
      <h4 className="mb-0">
        <i className="bi bi-person-circle me-2"></i>
        Informasi Profile
      </h4>
      <button
        className="btn btn-light btn-sm"
        onClick={() => setIsEditing(!isEditing)}
      >
        <i className={`bi bi-${isEditing ? "x-lg" : "pencil"} me-1`}></i>
        {isEditing ? "Cancel" : "Edit Profile"}
      </button>
    </div>
  );
};

export default ProfileHeader;
