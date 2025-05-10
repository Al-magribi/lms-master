import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAddParentsDataMutation } from "../../controller/api/database/ApiDatabase";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // Handle invalid dates
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.startsWith("0") ? "62" + phone.substring(1) : phone;
};

const Parent = ({ studentData, userid, onRefetch }) => {
  const [formData, setFormData] = useState({
    userid: userid,
    father_nik: studentData?.father_nik || "",
    father_name: studentData?.father_name || "",
    father_birth_place: studentData?.father_birth_place || "",
    father_birth_date: studentData?.father_birth_date
      ? formatDate(studentData.father_birth_date)
      : formatDate(new Date()),
    father_job: studentData?.father_job || "",
    father_phone: studentData?.father_phone
      ? formatPhoneNumber(studentData.father_phone)
      : "",
    mother_nik: studentData?.mother_nik || "",
    mother_name: studentData?.mother_name || "",
    mother_birth_place: studentData?.mother_birth_place || "",
    mother_birth_date: studentData?.mother_birth_date
      ? formatDate(studentData.mother_birth_date)
      : formatDate(new Date()),
    mother_job: studentData?.mother_job || "",
    mother_phone: studentData?.mother_phone
      ? formatPhoneNumber(studentData.mother_phone)
      : "",
  });

  const [addParentsData, { isLoading, isSuccess, isError, reset }] =
    useAddParentsDataMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone numbers
    if (name === "father_phone" || name === "mother_phone") {
      const formattedValue = value.startsWith("0")
        ? "62" + value.substring(1)
        : value;
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
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

    toast.promise(
      addParentsData(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      onRefetch();
      reset();
    }

    if (isError) {
      reset();
    }
  }, [isSuccess, isError, reset, onRefetch]);

  return (
    <div className="container mt-3">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            {/* Father's Information */}
            <div className="mb-3">
              <label htmlFor="father_nik" className="form-label">
                NIK Ayah
              </label>
              <input
                id="father_nik"
                type="text"
                className="form-control"
                placeholder="NIK Ayah"
                name="father_nik"
                value={formData.father_nik}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="father_name" className="form-label">
                Nama Ayah
              </label>
              <input
                id="father_name"
                type="text"
                className="form-control"
                placeholder="Nama Ayah"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="father_birth_place" className="form-label">
                Tempat Lahir Ayah
              </label>
              <input
                id="father_birth_place"
                type="text"
                className="form-control"
                placeholder="Tempat Lahir Ayah"
                name="father_birth_place"
                value={formData.father_birth_place}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="father_birth_date" className="form-label">
                Tanggal Lahir Ayah
              </label>
              <input
                id="father_birth_date"
                type="date"
                className="form-control"
                name="father_birth_date"
                value={formData.father_birth_date}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="father_job" className="form-label">
                Pekerjaan Ayah
              </label>
              <input
                id="father_job"
                type="text"
                className="form-control"
                placeholder="Pekerjaan Ayah"
                name="father_job"
                value={formData.father_job}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="father_phone" className="form-label">
                Nomor Telepon Ayah
              </label>
              <input
                id="father_phone"
                type="text"
                className="form-control"
                placeholder="Tlp Ayah"
                name="father_phone"
                value={formData.father_phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            {/* Mother's Information */}
            <div className="mb-3">
              <label htmlFor="mother_nik" className="form-label">
                NIK Ibu
              </label>
              <input
                id="mother_nik"
                type="text"
                className="form-control"
                placeholder="NIK Ibu"
                name="mother_nik"
                value={formData.mother_nik}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="mother_name" className="form-label">
                Nama Ibu
              </label>
              <input
                id="mother_name"
                type="text"
                className="form-control"
                placeholder="Nama Ibu"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="mother_birth_place" className="form-label">
                Tempat Lahir Ibu
              </label>
              <input
                id="mother_birth_place"
                type="text"
                className="form-control"
                placeholder="Tempat Lahir Ibu"
                name="mother_birth_place"
                value={formData.mother_birth_place}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="mother_birth_date" className="form-label">
                Tanggal Lahir Ibu
              </label>
              <input
                id="mother_birth_date"
                type="date"
                className="form-control"
                name="mother_birth_date"
                value={formData.mother_birth_date}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="mother_job" className="form-label">
                Pekerjaan Ibu
              </label>
              <input
                id="mother_job"
                type="text"
                className="form-control"
                placeholder="Pekerjaan Ibu"
                name="mother_job"
                value={formData.mother_job}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="mother_phone" className="form-label">
                Nomor Telepon Ibu
              </label>
              <input
                id="mother_phone"
                type="text"
                className="form-control"
                placeholder="Tlp Ibu"
                name="mother_phone"
                value={formData.mother_phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-12 text-end">
            <button
              type="submit"
              className="btn btn-sm btn-success"
              disabled={isLoading}
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : null}
              Simpan Data
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Parent;
