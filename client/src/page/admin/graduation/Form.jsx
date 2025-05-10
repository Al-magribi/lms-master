import React, { useEffect, useState } from "react";
import {
  useAddGraduationMutation,
  useGetStudentsQuery,
} from "../../../controller/api/admin/ApiGraduation";
import { toast } from "react-hot-toast";
import Select from "react-select";

const Form = ({ detail, setDetail }) => {
  const [formData, setFormData] = useState({
    id: "",
    agency: "",
    userid: "",
    description: "",
  });

  const { data: students = [] } = useGetStudentsQuery();

  const studentOptions = students?.map((student) => ({
    value: student.id,
    label: student.name,
  }));

  const [addGraduation, { isLoading, isSuccess, isError, reset }] =
    useAddGraduationMutation();

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.promise(
      addGraduation(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  const handleCancel = () => {
    setDetail({});
    setFormData({
      id: "",
      agency: "",
      userid: "",
      description: "",
    });
  };

  const handleStudentChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      userid: selectedOption?.value || null,
    }));
  };

  useEffect(() => {
    if (detail) {
      setFormData({
        id: detail.id,
        agency: detail.agency,
        userid: detail.userid,
        description: detail.description,
      });
    }
  }, [detail]);

  useEffect(() => {
    if (isSuccess || isError) {
      if (isSuccess) {
        setDetail({});
        setFormData({
          id: "",
          agency: "",
          userid: "",
          description: "",
        });
      }

      reset();
    }
  }, [isSuccess, isError]);

  return (
    <form
      onSubmit={handleSubmit}
      className='d-flex border p-2 rounded flex-column gap-3'>
      <h6 className='m-0'>Data Lulusan</h6>

      <Select
        isClearable
        isSearchable
        placeholder='Cari Murid'
        value={
          studentOptions?.find((opt) => opt.value === formData.userid) || null
        }
        options={studentOptions}
        onChange={handleStudentChange}
      />

      <input
        type='text'
        name='agency'
        id='agency'
        placeholder='Nama Instansi'
        className='form-control'
        required
        value={formData.agency}
        onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
      />

      <textarea
        name='description'
        id='description'
        placeholder='Keterangan'
        className='form-control'
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      <div className='text-end'>
        <button
          type='button'
          className='me-2 btn btn-sm btn-warning'
          onClick={handleCancel}>
          Batal
        </button>

        <button
          type='submit'
          className='me-2 btn btn-sm btn-success'
          disabled={isLoading}>
          Simpan
        </button>
      </div>
    </form>
  );
};

export default Form;
