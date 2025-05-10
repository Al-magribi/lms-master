import { useEffect, useState } from "react";
import { useGetTeachersQuery } from "../../../controller/api/cbt/ApiBank";
import {
  useCreateExamMutation,
  useGetClassesQuery,
} from "../../../controller/api/cbt/ApiExam";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { useSelector } from "react-redux";

const Form = ({ detail, setDetail, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);

  const initialFormState = {
    examid: "",
    teacher: user?.id || "",
    bank: [],
    name: "",
    duration: "",
    classes: [],
    token: "",
    isshuffle: "",
    mc_score: "",
    essay_score: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const { data: teachers } = useGetTeachersQuery();
  const { data: classes } = useGetClassesQuery();
  const [createExam, { isSuccess, isLoading, isError, reset }] =
    useCreateExamMutation();

  const teacherOptions = teachers?.map((teacher) => ({
    value: teacher.id,
    label: teacher.name,
    bank: teacher.bank,
  }));

  const selectedTeacher =
    user?.level === "teacher"
      ? teachers?.find((t) => t.id === user.id)
      : teachers?.find((t) => t.id === formData.teacher);

  const bankOptions = selectedTeacher?.bank?.map((bank) => ({
    value: bank.id,
    label: bank.name,
    type: bank.type,
  }));

  const classOptions = classes?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  useEffect(() => {
    if (detail?.id) {
      setFormData({
        examid: detail.id,
        teacher: detail.teacher,
        name: detail.name,
        duration: detail.duration,
        token: detail.token,
        isshuffle: detail.isshuffle,
        mc_score: detail.mc_score,
        essay_score: detail.essay_score,
        bank: detail.banks.map((bank) => ({
          bankid: bank.id,
          type: bank.type,
          pg: bank.pg,
          essay: bank.essay,
        })),
        classes: detail.classes.map((cls) => ({
          value: cls.id,
          label: cls.name,
        })),
      });
    } else if (user?.level === "teacher") {
      setFormData((prev) => ({
        ...prev,
        teacher: user.id,
      }));
    }
  }, [detail, user]);

  const handleTeacherChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      teacher: selectedOption?.value || null,
      bank: [],
    }));
  };

  const handleBankChange = (selectedOptions) => {
    const selectedBanks =
      selectedOptions?.map((bank) => ({
        bankid: bank.value,
        type: bank.type,
        pg: "",
        essay: "",
      })) || [];
    setFormData((prev) => ({
      ...prev,
      bank: selectedBanks,
    }));
  };

  const handleInput = (e, bankid, field) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bank: prev.bank.map((bank) =>
        bank.bankid === bankid ? { ...bank, [field]: value } : bank
      ),
    }));
  };

  const handleClass = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      classes: selectedOption || [],
    }));
  };

  const addHandler = (e) => {
    e.preventDefault();

    toast.promise(
      createExam(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      teacher: user?.id || "",
    });
    setDetail(null);
  };

  const cancel = () => {
    resetForm();
    onSuccess?.();
  };

  useEffect(() => {
    if (isSuccess) {
      resetForm();
      reset();
      onSuccess?.();
      // Close modal using data-bs-dismiss
      const closeButton = document.querySelector('[data-bs-dismiss="modal"]');
      if (closeButton) {
        closeButton.click();
      }
    }

    if (isError) {
      reset();
    }
  }, [isSuccess, isError, onSuccess]);

  useEffect(() => {
    // Cleanup function to reset body overflow when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="modal fade"
      id="addexam"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <form onSubmit={addHandler} className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              {detail?.id ? "Edit Ujian" : "Tambah Ujian"}
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="d-flex flex-column gap-2">
              <Select
                isClearable
                isSearchable
                placeholder="Cari Guru"
                value={
                  teacherOptions?.find(
                    (opt) => opt.value === formData.teacher
                  ) || null
                }
                options={teacherOptions}
                onChange={handleTeacherChange}
                isDisabled={!!detail?.id}
              />

              <Select
                isClearable
                isSearchable
                isMulti
                placeholder="Pilih Bank Soal"
                value={bankOptions?.filter((opt) =>
                  formData.bank.some((b) => b.bankid === opt.value)
                )}
                options={bankOptions}
                onChange={handleBankChange}
                isDisabled={!formData.teacher || !!detail?.id}
              />

              {formData.bank
                .filter((bank) => bank.type === "bank")
                .map((bank) => (
                  <div key={bank.bankid} className="border p-2 rounded">
                    <p className="m-0">
                      {bankOptions?.find((b) => b.value === bank.bankid)
                        ?.label ||
                        detail?.banks?.find((b) => b.id === bank.bankid)?.name}
                    </p>
                    <input
                      type="number"
                      className="form-control mt-1"
                      placeholder={`Tampil Soal PG `}
                      value={bank.pg}
                      onChange={(e) => handleInput(e, bank.bankid, "pg")}
                    />
                    <input
                      type="number"
                      className="form-control mt-1"
                      placeholder={`Tampil Soal Essay `}
                      value={bank.essay}
                      onChange={(e) => handleInput(e, bank.bankid, "essay")}
                    />
                  </div>
                ))}

              <Select
                isClearable
                isSearchable
                isMulti
                placeholder="Untuk Kelas"
                value={formData.classes}
                options={classOptions}
                onChange={handleClass}
              />

              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Nama Ujian"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                type="number"
                name="duration"
                className="form-control"
                placeholder="Durasi"
                value={formData.duration || ""}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              />

              <input
                type="number"
                name="mc_score"
                id="mc_score"
                className="form-control"
                placeholder="Persentase Nilai PG"
                value={formData.mc_score}
                onChange={(e) =>
                  setFormData({ ...formData, mc_score: e.target.value })
                }
              />

              <input
                type="number"
                name="essay_score"
                id="essay_score"
                className="form-control"
                placeholder="Persentase Nilai Essay"
                value={formData.essay_score}
                onChange={(e) =>
                  setFormData({ ...formData, essay_score: e.target.value })
                }
              />

              <select
                name="isshuffle"
                className="form-control"
                value={formData.isshuffle}
                onChange={(e) =>
                  setFormData({ ...formData, isshuffle: e.target.value })
                }
              >
                <option value="" hidden>
                  Acak Soal
                </option>
                <option value={true}>Ya</option>
                <option value={false}>Tidak</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-warning"
              data-bs-dismiss="modal"
              onClick={cancel}
            >
              Batal
            </button>

            <button
              type="submit"
              className="btn btn-sm btn-success"
              disabled={isLoading}
            >
              {detail?.id ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
