import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useSelector, useDispatch } from "react-redux";
import {
  useLoadUserMutation,
  useUpdateStudentProfileMutation,
} from "../../../controller/api/auth/ApiAuth";
import toast from "react-hot-toast";
import { setLogin } from "../../../controller/slice/AuthSlice";

const StudentProfile = () => {
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

  const [updateStudentProfile, { isLoading, isSuccess, isError, reset }] =
    useUpdateStudentProfileMutation();
  const [loadUser] = useLoadUserMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
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

    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    if (formData.newPassword) {
      updateData.oldPassword = formData.oldPassword;
      updateData.newPassword = formData.newPassword;
    }

    toast.promise(
      updateStudentProfile(updateData)
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
  }, [isSuccess, isError, dispatch, loadUser, reset]);

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
    <Layout title={`Profile`} levels={["student"]}>
      <div className='container-fluid'>
        <div className='row justify-content-center'>
          <div className='col-md-6 col-12'>
            <div className='card mb-4'>
              <div className='card-header py-3 d-flex justify-content-between align-items-center'>
                <h6 className='m-0 font-weight-bold text-primary'>
                  Profil Siswa
                </h6>
                <button
                  className={`btn btn-sm ${
                    isEditing ? "btn-danger" : "btn-primary"
                  }`}
                  onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? (
                    <>
                      <i className='bi bi-x-circle me-1'></i>
                      Batal
                    </>
                  ) : (
                    <>
                      <i className='bi bi-pencil me-1'></i>
                      Edit Profil
                    </>
                  )}
                </button>
              </div>
              <div className='card-body'>
                <div className='row mb-4'>
                  <div className='col-md-4 d-flex justify-content-center align-items-center'>
                    <div
                      className='rounded-circle bg-primary text-white d-flex justify-content-center align-items-center'
                      style={{ width: "150px", height: "150px" }}>
                      <span style={{ fontSize: "3rem" }}>
                        {user?.name?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className='col-md-8'>
                    {isEditing ? (
                      <form onSubmit={handleSubmit}>
                        <div className='mb-3'>
                          <label className='form-label'>Nama</label>
                          <input
                            type='text'
                            className='form-control'
                            name='name'
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className='mb-3'>
                          <label className='form-label'>Email</label>
                          <input
                            type='email'
                            className='form-control'
                            name='email'
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className='mb-3'>
                          <label className='form-label'>No. Telepon</label>
                          <input
                            type='tel'
                            className='form-control'
                            name='phone'
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <button
                          type='submit'
                          className='btn btn-primary'
                          disabled={isLoading}>
                          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                      </form>
                    ) : (
                      <>
                        <h3 className='mb-3'>{user?.name}</h3>
                        <div className='mb-2'>
                          <span className='badge bg-success me-2'>
                            <i className='bi bi-person me-1'></i>
                            {user?.level}
                          </span>
                          <span className='badge bg-info me-2'>
                            <i className='bi bi-card-text me-1'></i>
                            NIS: {user?.nis}
                          </span>
                          {user?.isactive ? (
                            <span className='badge bg-success'>
                              <i className='bi bi-check-circle me-1'></i>
                              Aktif
                            </span>
                          ) : (
                            <span className='badge bg-danger'>
                              <i className='bi bi-x-circle me-1'></i>
                              Nonaktif
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className='student-info'>
                    <div className='row mb-2'>
                      <div className='col-md-4 fw-bold'>Sekolah</div>
                      <div className='col-md-8'>{user?.homebase}</div>
                    </div>
                    <div className='row mb-2'>
                      <div className='col-md-4 fw-bold'>Kelas</div>
                      <div className='col-md-8'>{user?.class}</div>
                    </div>
                    <div className='row mb-2'>
                      <div className='col-md-4 fw-bold'>Tingkat</div>
                      <div className='col-md-8'>{user?.grade}</div>
                    </div>
                    <div className='row mb-2'>
                      <div className='col-md-4 fw-bold'>Periode</div>
                      <div className='col-md-8'>
                        {user?.periode_name}
                        {user?.periode_active && (
                          <span className='badge bg-success ms-2'>Aktif</span>
                        )}
                      </div>
                    </div>
                    <div className='row mb-2'>
                      <div className='col-md-4 fw-bold'>Email</div>
                      <div className='col-md-8'>{user?.email}</div>
                    </div>
                    <div className='row mb-2'>
                      <div className='col-md-4 fw-bold'>No. Telepon</div>
                      <div className='col-md-8'>{user?.phone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='col-md-6 col-12'>
            <div className='card mb-4'>
              <div className='card-header py-3'>
                <h6 className='m-0 font-weight-bold text-primary'>
                  Ubah Password
                </h6>
              </div>
              <div className='card-body'>
                <form onSubmit={handleSubmit}>
                  <div className='mb-3'>
                    <label className='form-label'>Password Lama</label>
                    <div className='input-group'>
                      <input
                        type={showPasswords.oldPassword ? "text" : "password"}
                        className='form-control'
                        name='oldPassword'
                        value={formData.oldPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type='button'
                        className='btn btn-outline-secondary'
                        onClick={() => togglePasswordVisibility("oldPassword")}>
                        <i
                          className={`bi bi-eye${
                            showPasswords.oldPassword ? "-slash" : ""
                          }`}></i>
                      </button>
                    </div>
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Password Baru</label>
                    <div className='input-group'>
                      <input
                        type={showPasswords.newPassword ? "text" : "password"}
                        className='form-control'
                        name='newPassword'
                        value={formData.newPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type='button'
                        className='btn btn-outline-secondary'
                        onClick={() => togglePasswordVisibility("newPassword")}>
                        <i
                          className={`bi bi-eye${
                            showPasswords.newPassword ? "-slash" : ""
                          }`}></i>
                      </button>
                    </div>
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>
                      Konfirmasi Password Baru
                    </label>
                    <div className='input-group'>
                      <input
                        type={
                          showPasswords.confirmPassword ? "text" : "password"
                        }
                        className='form-control'
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type='button'
                        className='btn btn-outline-secondary'
                        onClick={() =>
                          togglePasswordVisibility("confirmPassword")
                        }>
                        <i
                          className={`bi bi-eye${
                            showPasswords.confirmPassword ? "-slash" : ""
                          }`}></i>
                      </button>
                    </div>
                  </div>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={isLoading}>
                    {isLoading ? "Menyimpan..." : "Ubah Password"}
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

export default StudentProfile;
