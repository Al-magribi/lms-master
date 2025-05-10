import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  useUpdateAppMutation,
  useGetAppDataQuery,
} from "../../../controller/api/center/ApiApp";

const AppSetting = ({ app }) => {
  const [formData, setFormData] = useState({
    id: app?.id,
    app_name: app?.app_name || "",
    logo: app?.logo || "",
  });
  const [previewImage, setPreviewImage] = useState(app?.logo || "");
  const [updateApp, { isLoading, isSuccess, isError, reset }] =
    useUpdateAppMutation();

  // Add the query hook to get the latest app data
  const { refetch } = useGetAppDataQuery();

  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("id", formData.id);
    formDataToSend.append("app_name", formData.app_name);

    // Only append logo if it's a File object (new upload)
    if (formData.logo instanceof File) {
      formDataToSend.append("logo", formData.logo);
    }
    // If logo is a string (existing logo path), we don't need to append it
    // The server will use the existing logo if no new file is uploaded

    toast.promise(
      updateApp(formDataToSend)
        .unwrap()
        .then((res) => {
          // Refetch data immediately after successful update
          refetch();
          return res.message;
        }),
      {
        loading: "Menyimpan...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  // Update form data and preview image when app data changes
  useEffect(() => {
    if (app) {
      setFormData((prev) => ({
        ...prev,
        id: app.id,
        app_name: app.app_name || "",
        logo: app.logo || "",
      }));
      setPreviewImage(app.logo || "");
    }
  }, [app]);

  useEffect(() => {
    if (isSuccess || isError) {
      inputRef.current.value = "";
      reset();
    }
  }, [isSuccess, isError, reset]);

  return (
    <form className="d-flex flex-column gap-3 p-2" onSubmit={handleSubmit}>
      <p className="m-0 h6">Aplikasi</p>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="basic-addon1"
        >
          Nama Aplikasi
        </span>
        <input
          type="text"
          className="form-control"
          aria-label="Nama Aplikasi"
          aria-describedby="basic-addon1"
          name="app_name"
          value={formData.app_name}
          onChange={handleInputChange}
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="basic-addon1"
        >
          Logo Aplikasi
        </span>
        <input
          ref={inputRef}
          type="file"
          className="form-control"
          aria-label="Logo Aplikasi"
          aria-describedby="basic-addon1"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <div className="text-end">
        <button
          className="btn btn-sm btn-success"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="text-start">
        <img
          src={previewImage}
          alt="Logo Aplikasi"
          className="img-fluid"
          style={{ width: 150 }}
        />
      </div>
    </form>
  );
};

export default AppSetting;
