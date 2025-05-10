import { useEffect, useState } from "react";
import { useGetPeriodesQuery } from "../../../controller/api/admin/ApiPeriode";
import { useAddStudentMutation } from "../../../controller/api/admin/ApiStudent";
import { toast } from "react-hot-toast";

const inputs = [
  { id: "nis", name: "nis", placeholder: "NIS" },
  { id: "name", name: "name", placeholder: "Name" },
];

const Form = ({ detail, setDetail }) => {
  const page = "";
  const limit = "";
  const search = "";

  const [formData, setFormData] = useState({
    id: "",
    entry: "",
    nis: "",
    name: "",
    gender: "",
  });

  const { data } = useGetPeriodesQuery({ page, limit, search });
  const [addStudent, { isSuccess, isLoading, isError, reset }] =
    useAddStudentMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addHandler = (e) => {
    e.preventDefault();

    toast.promise(
      addStudent(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menyimpan Data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setFormData({ id: "", entry: "", nis: "", name: "", gender: "" });
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      setDetail({});
      setFormData({ id: "", entry: "", nis: "", name: "", gender: "" });
    }

    if (isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (detail) {
      setFormData({
        id: detail.id,
        entry: detail.entry_id,
        name: detail.name,
        nis: detail.nis,
        gender: detail.gender,
      });
    }
  }, [detail]);
  return (
    <form
      onSubmit={addHandler}
      className='p-2 bg-white rounded border d-flex flex-column gap-2'>
      <p className='m-0 h6'>Siswa</p>

      <select
        name='entry'
        id='entry'
        className='form-select'
        value={formData.entry}
        onChange={handleChange}>
        <option value='' hidden>
          Tahun Masuk
        </option>
        {data?.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {inputs?.map((item, i) => (
        <input
          key={i}
          type='text'
          className='form-control'
          placeholder={item.placeholder}
          name={item.name}
          id={item.name}
          value={formData[item.name]}
          onChange={handleChange}
        />
      ))}

      <select
        name='gender'
        id='gender'
        className='form-select'
        value={formData.gender}
        onChange={handleChange}>
        <option value='' hidden>
          Jenis Kelamin
        </option>
        <option value='L'>Laki Laki</option>
        <option value='P'>Perempuan</option>
      </select>

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
