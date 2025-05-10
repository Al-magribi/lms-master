import { useEffect, useState } from "react";
import Select from "react-select";
import { useAddTeacherMutation } from "../../../controller/api/admin/ApiTeacher";
import toast from "react-hot-toast";
import { useGetClassQuery } from "../../../controller/api/admin/ApiClass";
import { useGetSubjectQuery } from "../../../controller/api/admin/ApiSubject";

const Form = ({ detail, setDetail }) => {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    name: "",
    homeroom: false,
    classid: "",
    gender: "",
    subjects: [],
  });

  const { data } = useGetClassQuery({ page: "", limit: "", search: "" });
  const { data: subjectsData } = useGetSubjectQuery({
    page: "",
    limit: "",
    search: "",
  });

  const [addTeacher, { isSuccess, isLoading, isError, reset }] =
    useAddTeacherMutation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubjectsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      subjects: selectedOptions || [],
    }));
  };

  const addHandler = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username) {
      return toast.error("Lengkapi data");
    }
    toast.promise(
      addTeacher(formData)
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
      username: "",
      name: "",
      homeroom: false,
      classid: "",
      gender: "",
      subjects: [],
    });
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      cancel();
    }
    if (isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (detail) {
      setFormData({
        id: detail.id || "",
        username: detail.username || "",
        name: detail.name || "",
        homeroom: detail.homeroom || false,
        classid: detail.class || "",
        gender: detail.gender || "",
        subjects:
          detail.subjects?.map((subject) => ({
            value: subject.id,
            label: subject.name,
          })) || [],
      });
    }
  }, [detail]);

  const subjectOptions =
    subjectsData?.map((item) => ({ value: item.id, label: item.name })) || [];

  return (
    <form
      onSubmit={addHandler}
      className='rounded bg-white p-2 border d-flex flex-column gap-2'>
      <p className='m-0 h6'>Guru</p>

      <input
        type='text'
        name='username'
        className='form-control'
        placeholder='Username'
        value={formData.username}
        onChange={handleChange}
      />

      <input
        type='text'
        name='name'
        className='form-control'
        placeholder='Nama Guru'
        value={formData.name}
        onChange={handleChange}
      />

      <select
        name='gender'
        className='form-select'
        value={formData.gender}
        onChange={handleChange}>
        <option value='' hidden>
          Jenis Kelamin
        </option>
        <option value='L'>Laki Laki</option>
        <option value='P'>Perempuan</option>
      </select>

      <Select
        isMulti
        options={subjectOptions}
        value={formData.subjects}
        onChange={handleSubjectsChange}
        className='mb-2'
        placeholder='Mata Pelajaran'
      />

      <div className='form-check'>
        <input
          type='checkbox'
          name='homeroom'
          className='form-check-input'
          checked={formData.homeroom}
          onChange={handleChange}
        />
        <label className='form-check-label'>Wali Kelas</label>
      </div>

      {formData.homeroom && (
        <select
          name='classid'
          className='form-select'
          value={formData.classid}
          onChange={handleChange}>
          <option value='' hidden>
            Pilih Kelas
          </option>
          {data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      )}

      <div className='d-flex justify-content-end gap-2'>
        <button
          type='button'
          className='btn btn-sm btn-warning'
          onClick={cancel}>
          Batal
        </button>
        <button
          type='submit'
          className='btn btn-sm btn-success'
          disabled={isLoading}>
          Simpan
        </button>
      </div>
    </form>
  );
};

export default Form;
