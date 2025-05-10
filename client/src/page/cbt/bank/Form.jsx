import React, { useEffect, useState } from "react";
import {
  useAddBankMutation,
  useGetTeachersQuery,
} from "../../../controller/api/cbt/ApiBank";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

const Form = ({ detail, setDetail }) => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    id: "",
    teacher: user?.id || null,
    subject: null,
    btype: "",
    name: "",
  });

  const { data: teachers } = useGetTeachersQuery();
  const [addBank, { isSuccess, isLoading, isError, reset }] =
    useAddBankMutation();

  const teacherOptions = teachers?.map((teacher) => ({
    value: teacher.id,
    label: teacher.name,
    subjects: teacher.subjects,
  }));

  const selectedTeacher = teachers?.find((t) => t.id === formData.teacher);

  const subjectOptions =
    selectedTeacher?.subjects?.map((subject) => ({
      value: subject.id,
      label: subject.name,
    })) || [];

  const handleTeacherChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      teacher: selectedOption?.value || null,
      subject: null,
    }));
  };

  const handleSubjectChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      subject: selectedOption?.value || null,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addHandler = (e) => {
    e.preventDefault();

    toast.promise(
      addBank(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setFormData({
      id: "",
      teacher: user?.id || null,
      subject: null,
      btype: "",
      name: "",
    });
  };

  useEffect(() => {
    if (isSuccess || isError) {
      setFormData({
        id: "",
        teacher: user?.id || null,
        btype: "",
        subject: null,
        name: "",
      });
      reset();
    }
  }, [isSuccess, isError, user]);

  useEffect(() => {
    if (detail) {
      setFormData({
        id: detail.id,
        teacher: detail.teacher || user?.id || null,
        subject: detail.subject,
        name: detail.name,
        btype: detail.btype,
      });
    }
  }, [detail, user]);

  return (
    <form
      onSubmit={addHandler}
      className='bg-white p-2 rounded d-flex flex-column gap-2 border'>
      <p className='m-0 h6'>Bank Soal</p>

      <Select
        isClearable
        isSearchable
        placeholder='Cari Guru'
        value={
          teacherOptions?.find((opt) => opt.value === formData.teacher) || null
        }
        options={teacherOptions}
        onChange={handleTeacherChange}
      />

      <Select
        isClearable
        isSearchable
        placeholder='Pilih Mata Pelajaran'
        value={
          subjectOptions?.find((opt) => opt.value === formData.subject) || null
        }
        options={subjectOptions}
        onChange={handleSubjectChange}
        isDisabled={!formData.teacher}
      />

      <select
        name='btype'
        id='btype'
        className='form-select'
        value={formData.btype}
        onChange={handleInputChange}>
        <option value='' hidden>
          Jenis Bank Soal
        </option>
        <option value='bank'>Bank</option>
        <option value='paket'>Paket</option>
      </select>

      <input
        name='name'
        className='form-control'
        placeholder='Nama Bank Soal'
        value={formData.name}
        onChange={handleInputChange}
      />

      <div className='d-flex justify-content-end gap-2'>
        <button
          type='button'
          className='btn btn-sm btn-warning'
          onClick={cancel}>
          Batal
        </button>
        <button type='submit' className='btn btn-sm btn-success'>
          Simpan
        </button>
      </div>
    </form>
  );
};

export default Form;
