import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useSelector, useDispatch } from "react-redux";
import {
  useLoadUserMutation,
  useUpdateAdminProfileMutation,
} from "../../../controller/api/auth/ApiAuth";
import toast from "react-hot-toast";
import { setLogin } from "../../../controller/slice/AuthSlice";

const TahfizProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [updateAdminProfile, { isLoading, isSuccess, isError, reset }] =
    useUpdateAdminProfileMutation();
  const [loadUser] = useLoadUserMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format phone number if the field is 'phone'
    if (name === "phone") {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, "");

      // If the number starts with '0', replace it with '62'
      const formattedPhone = digitsOnly.startsWith("0")
        ? "62" + digitsOnly.substring(1)
        : digitsOnly;

      setFormData((prev) => ({
        ...prev,
        [name]: formattedPhone,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate passwords if they are being changed
    if (
      formData.newPassword ||
      formData.confirmPassword ||
      formData.oldPassword
    ) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Password baru tidak cocok!");
        return;
      }
      if (!formData.oldPassword) {
        toast.error("Password lama harus diisi!");
        return;
      }
    }

    // Prepare data for API call
    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    // Only include password data if it's being changed
    if (formData.newPassword) {
      updateData.oldPassword = formData.oldPassword;
      updateData.newPassword = formData.newPassword;
    }

    toast.promise(
      updateAdminProfile(updateData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memperbarui profil...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  useEffect(() => {
    if (isSuccess) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsEditing(false);
      reset();

      // Load updated user data and update Redux state
      loadUser()
        .unwrap()
        .then((userData) => {
          dispatch(setLogin(userData));
        })
        .catch((error) => {
          toast.error("Gagal memuat data pengguna");
          console.error("Error: ", error);
        });
    }

    if (isError) {
      reset();
    }
  }, [isSuccess, isError, dispatch, loadUser]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  return (
    <Layout title={`Profile`} levels={["tahfiz"]}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6 col-12">
            <div className="card shadow mb-4">
              <div className="card-header bg-info d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Informasi Profile
                </h4>
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <i
                    className={`bi bi-${isEditing ? "x-lg" : "pencil"} me-1`}
                  ></i>
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-4 d-flex justify-content-center align-items-center">
                    <div
                      style={{ width: 100, height: 100 }}
                      className="rounded-circle bg-light d-flex justify-content-center align-items-center"
                    >
                      <i className="bi bi-person-badge display-5 text-info"></i>
                    </div>
                  </div>
                  <div className="col-md-8">
                    {isEditing ? (
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
                        <button
                          type="submit"
                          className="btn btn-info"
                          disabled={isLoading}
                        >
                          <i className="bi bi-save me-1"></i>
                          {isLoading ? "Loading..." : "Simpan Perubahan"}
                        </button>
                      </form>
                    ) : (
                      <>
                        <h3 className="mb-3">{user?.name}</h3>
                        <span className="badge bg-success mb-2">
                          <i className="bi bi-check-circle me-1"></i>
                          {user?.level}
                        </span>
                        {user?.isactive ? (
                          <span className="badge bg-success ms-2">
                            <i className="bi bi-check-circle me-1"></i>
                            Aktif
                          </span>
                        ) : (
                          <span className="badge bg-danger ms-2">
                            <i className="bi bi-x-circle me-1"></i>
                            Nonaktif
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-envelope me-2 text-primary"></i>
                            Email
                          </h5>
                          <p className="card-text">{user?.email}</p>
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
                          <p className="card-text">{user?.phone}</p>
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
                          <p className="card-text">{user?.homebase}</p>
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
                          <p className="card-text small">{user?.activation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-12">
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
                    <label className="form-label">
                      Konfirmasi Password Baru
                    </label>
                    <div className="input-group">
                      <input
                        type={
                          showPasswords.confirmPassword ? "text" : "password"
                        }
                        className="form-control"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Konfirmasi password baru"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          togglePasswordVisibility("confirmPassword")
                        }
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TahfizProfile;
