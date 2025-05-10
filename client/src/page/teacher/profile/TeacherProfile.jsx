import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useSelector, useDispatch } from "react-redux";
import {
  useLoadUserMutation,
  useUpdateTeacherProfileMutation,
} from "../../../controller/api/auth/ApiAuth";
import toast from "react-hot-toast";
import { setLogin } from "../../../controller/slice/AuthSlice";

// Import components
import ProfileHeader from "./components/ProfileHeader";
import ProfileImage from "./components/ProfileImage";
import ProfileForm from "./components/ProfileForm";
import ProfileInfo from "./components/ProfileInfo";
import SubjectsList from "./components/SubjectsList";
import PasswordForm from "./components/PasswordForm";

const TeacherProfile = () => {
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

  const [updateTeacherProfile, { isLoading, isSuccess, isError, reset }] =
    useUpdateTeacherProfileMutation();
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
      updateTeacherProfile(updateData)
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
    <Layout title={`Profile`} levels={["teacher"]}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6 col-12">
            <div className="card shadow mb-4">
              <ProfileHeader
                user={user}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-4 d-flex justify-content-center align-items-center">
                    <ProfileImage user={user} />
                  </div>
                  <div className="col-md-8">
                    {isEditing ? (
                      <ProfileForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                      />
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

                {!isEditing && <ProfileInfo user={user} />}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-12">
            <SubjectsList subjects={user?.subjects} />

            <PasswordForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              showPasswords={showPasswords}
              togglePasswordVisibility={togglePasswordVisibility}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherProfile;
