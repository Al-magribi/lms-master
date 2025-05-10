import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useAddFamilyDataMutation,
  useDeleteFamilyDataMutation,
} from "../../controller/api/database/ApiDatabase";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // Handle invalid dates
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Family = ({ families, onRefetch, userid }) => {
  const initialFormState = {
    id: "",
    userid: userid,
    name: "",
    gender: "",
    birth_date: formatDate(new Date()),
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [addFamilyData, { isLoading, isSuccess, isError, reset }] =
    useAddFamilyDataMutation();
  const [
    deleteFamily,
    {
      isLoadig: delLoading,
      isSuccess: delSuccess,
      isError: delError,
      reset: delReset,
    },
  ] = useDeleteFamilyDataMutation();

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Nama harus diisi";
    }
    if (!formData.gender) {
      errors.gender = "Jenis kelamin harus dipilih";
    }
    if (!formData.birth_date) {
      errors.birth_date = "Tanggal lahir harus diisi";
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        errors.birth_date = "Tanggal lahir tidak boleh lebih dari hari ini";
      }
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleEdit = (family) => {
    setEditingId(family.id);
    setFormData({
      id: family.id,
      userid: family.userid,
      name: family.name,
      gender: family.gender,
      birth_date: formatDate(family.birth_date),
    });
    setFormErrors({});
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    toast.promise(
      addFamilyData(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Apakah Anda yakin ingin menghapus data keluarga ini?")
    ) {
      toast.promise(
        deleteFamily(id)
          .unwrap()
          .then((res) => res.message),
        {
          loading: "Memproses data...",
          success: (message) => message,
          error: (error) => error.data.message,
        }
      );
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      onRefetch();
    }
    if (isError) {
      reset();
    }
  }, [isSuccess, isError, reset, onRefetch]);

  useEffect(() => {
    if (delSuccess) {
      delReset();
      onRefetch();
    }
    if (delError) {
      delReset();
    }
  }, [delSuccess, delReset, onRefetch, delError]);
  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-4">
          {/* Input Form */}
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.name ? "is-invalid" : ""
                    }`}
                    placeholder="Nama Keluarga"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {formErrors.name && (
                    <div className="invalid-feedback">{formErrors.name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <select
                    className={`form-select ${
                      formErrors.gender ? "is-invalid" : ""
                    }`}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="" hidden>
                      Pilih Jenis Kelamin
                    </option>
                    <option value="L">Laki Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  {formErrors.gender && (
                    <div className="invalid-feedback">{formErrors.gender}</div>
                  )}
                </div>

                <div className="mb-3">
                  <input
                    type="date"
                    className={`form-control ${
                      formErrors.birth_date ? "is-invalid" : ""
                    }`}
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                  />
                  {formErrors.birth_date && (
                    <div className="invalid-feedback">
                      {formErrors.birth_date}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-warning"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Batal
                  </button>
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
                    {editingId ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {/* Table */}
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama</th>
                      <th>Jenis Kelamin</th>
                      <th>Tanggal Lahir</th>
                      <th>Usia</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {families?.map((family, index) => (
                      <tr key={family.id}>
                        <td>{index + 1}</td>
                        <td>{family.name}</td>
                        <td>
                          {family.gender === "L" ? "Laki Laki" : "Perempuan"}
                        </td>
                        <td>
                          {new Date(family.birth_date).toLocaleDateString(
                            "id-ID"
                          )}
                        </td>
                        <td>{calculateAge(family.birth_date)} Tahun</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEdit(family)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(family.id)}
                              title="Hapus"
                              disabled={delLoading}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Family;
