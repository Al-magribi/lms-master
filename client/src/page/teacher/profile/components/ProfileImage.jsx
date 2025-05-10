import React from "react";

const ProfileImage = ({ user }) => {
  return (
    <div
      style={{ width: 100, height: 100 }}
      className="rounded-circle bg-light d-flex justify-content-center align-items-center"
    >
      {user?.img ? (
        <img
          src={user.img}
          alt={user.name}
          className="rounded-circle"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <i className="bi bi-person-badge display-5 text-info"></i>
      )}
    </div>
  );
};

export default ProfileImage;
