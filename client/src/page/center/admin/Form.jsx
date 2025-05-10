import React, { useEffect, useState } from "react";
import { useGetHomebaseQuery } from "../../../controller/api/center/ApiHomebase";
import { useAddAdminMutation } from "../../../controller/api/center/ApiAdmin";
import toast from "react-hot-toast";

const convertPhoneNumber = (phone) =>
  phone?.startsWith("0") ? `62${phone.slice(1)}` : phone;

const Form = () => {
  const page = "";
  const limit = "";
  const search = "";

  const { data: homebase } = useGetHomebaseQuery({ page, limit, search });
  const [addAdmin, { isSuccess, isLoading, error, reset }] =
    useAddAdminMutation();

  const [formData, setFormData] = useState({
    id: "",
    home: "",
    name: "",
    email: "",
    password: "",
    level: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? convertPhoneNumber(value) : value,
    }));
  };

  const addHandler = (e) => {
    e.preventDefault();

    const formatted = {
      ...formData,
      home: parseInt(formData.home, 10),
    };

    toast.promise(
      addAdmin(formatted)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menyimpan Data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      setFormData({
        id: "",
        home: "",
        name: "",
        email: "",
        password: "",
        level: "",
        phone: "",
      });
      reset();
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);
  return (
    <form
      onSubmit={addHandler}
      className="d-flex flex-column gap-2 rounded p-2 border "
    >
      <p className="m-0 h6">Administrator</p>

      <select
        name="level"
        id="level"
        className="form-select"
        value={formData.level}
        onChange={handleChange}
      >
        <option value="" hidden>
          Pilih Level
        </option>
        <option value="center">Pusat</option>
        <option value="admin">Satuan</option>
        <option value="tahfiz">Tahfiz</option>
        <option value="cms">Konten Managemen</option>
      </select>

      {formData.level !== "center" && (
        <select
          name="home"
          id="home"
          className="form-select"
          value={formData.home}
          onChange={handleChange}
        >
          <option value="" hidden>
            Pilih Satuan
          </option>
          {homebase?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      )}

      <input
        type="text"
        name="name"
        id="name"
        placeholder="Username"
        className="form-control"
        value={formData.name || ""}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        id="email"
        className="form-control"
        placeholder="Email"
        value={formData.email || ""}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="phone"
        id="phone"
        className="form-control"
        placeholder="Whatsapp"
        value={formData.phone || ""}
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        id="password"
        className="form-control"
        placeholder="Password"
        value={formData.password || ""}
        onChange={handleChange}
        required
      />

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-warning"
          onClick={() => setDetail("")}
        >
          Batal
        </button>
        <button type="submit" className="btn btn-success" disabled={isLoading}>
          Simpan
        </button>
      </div>
    </form>
  );
};

export default Form;
