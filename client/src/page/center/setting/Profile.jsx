import React, { useState, useEffect } from "react";
import {
  useUpdateProfileMutation,
  useGetAppDataQuery,
} from "../../../controller/api/center/ApiApp";
import toast from "react-hot-toast";
import { useLoadUserMutation } from "../../../controller/api/auth/ApiAuth";

const Profile = ({ admin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    old_password: "",
    new_password: "",
  });

  const [updateProfile, { isLoading, isSuccess, isError, reset }] =
    useUpdateProfileMutation();
  const { refetch } = useGetAppDataQuery();
  const [loadUser] = useLoadUserMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone number
    if (name === "phone") {
      let formattedValue = value;
      if (value.startsWith("0")) {
        formattedValue = "62" + value.substring(1);
      }
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.promise(
      updateProfile(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menyimpan...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  useEffect(() => {
    if (admin) {
      // Format phone number: replace leading 0 with 62
      const formattedPhone = admin.phone?.startsWith("0")
        ? "62" + admin.phone.substring(1)
        : admin.phone;

      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        phone: formattedPhone || "",
        old_password: "",
        new_password: "",
      });
    }
  }, [admin]);

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
      loadUser();
      refetch();
    }
  }, [isSuccess, isError]);

  return (
    <form className="d-flex flex-column gap-3 p-2" onSubmit={handleSubmit}>
      <p className="m-0 h6">Profile</p>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="basic-addon1"
        >
          Username
        </span>
        <input
          type="text"
          className="form-control"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-label="Nama"
          aria-describedby="basic-addon1"
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="basic-addon1"
        >
          Email
        </span>
        <input
          type="email"
          className="form-control"
          name="email"
          value={formData.email}
          onChange={handleChange}
          aria-label="Email"
          aria-describedby="basic-addon1"
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="basic-addon1"
        >
          Whatsapp
        </span>
        <input
          type="text"
          className="form-control"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          aria-label="Whatsapp"
          aria-describedby="basic-addon1"
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="basic-addon1"
        >
          Password Lama
        </span>
        <input
          type="password"
          className="form-control"
          name="old_password"
          value={formData.old_password}
          onChange={handleChange}
          aria-label="Password Lama"
          aria-describedby="basic-addon1"
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="basic-addon1"
        >
          Password Baru
        </span>
        <input
          type="password"
          className="form-control"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          aria-label="Password Baru"
          aria-describedby="basic-addon1"
        />
      </div>

      <div className="text-end">
        <button
          type="submit"
          className="btn btn-sm btn-success"
          disabled={isLoading}
        >
          {isLoading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default Profile;
