import React, { useEffect, useState } from "react";
import { useAddTargetMutation } from "../../../controller/api/tahfiz/ApiScoring";
import { toast } from "react-hot-toast";
import Select from "react-select";

const FormJuz = ({ grades, juz }) => {
  const [addTarget, { isLoading, isSuccess, isError, reset }] =
    useAddTargetMutation();

  const [formData, setFormData] = useState({
    grade_id: "",
    juz_ids: [],
  });

  const addHandler = (e) => {
    e.preventDefault();

    // Convert juz_ids array to individual target entries
    const targets = formData.juz_ids.map((juz) => ({
      id: formData.id,
      gradeId: formData.grade_id,
      juzId: juz.value,
    }));

    // Submit each target individually
    const promises = targets.map((target) =>
      addTarget(target)
        .unwrap()
        .then((res) => res.message)
    );

    toast.promise(Promise.all(promises), {
      loading: "Memuat data...",
      success: (messages) => messages[0],
      error: (err) => err.data.message,
    });
  };

  const cancel = () => {
    setFormData({
      id: "",
      grade_id: "",
      juz_ids: [],
    });
  };

  const handleJuzChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      juz_ids: selectedOptions || [],
    }));
  };

  useEffect(() => {
    if (isError || isSuccess) {
      reset();
      setFormData({
        id: "",
        grade_id: "",
        juz_ids: [],
      });
    }
  }, [isSuccess, isError]);

  const juzOptions =
    juz?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || [];

  return (
    <form
      onSubmit={addHandler}
      className="rounded border bg-white p-2 d-flex flex-column gap-2"
    >
      <p className="m-0 h6">Target Hafalan Bedasarkan Juz</p>

      <select
        className="form-select"
        value={formData.grade_id}
        onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
      >
        <option value="" hidden>
          Pilih Tingkat
        </option>
        {grades?.map((grade) => (
          <option key={grade.id} value={grade.id}>
            {grade.name}
          </option>
        ))}
      </select>

      <Select
        isMulti
        options={juzOptions}
        value={formData.juz_ids}
        onChange={handleJuzChange}
        className="mb-2"
        placeholder="Pilih Juz"
      />

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-sm  btn-warning"
          onClick={cancel}
        >
          Batal
        </button>
        <button
          type="submit"
          className="btn btn-sm btn-success"
          disabled={isLoading}
        >
          Simpan
        </button>
      </div>
    </form>
  );
};

export default FormJuz;
