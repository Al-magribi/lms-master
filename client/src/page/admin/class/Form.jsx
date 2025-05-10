import { useEffect, useState } from "react";
import { useAddClassMutation } from "../../../controller/api/admin/ApiClass";
import { toast } from "react-hot-toast";
import { useGetGradeQuery } from "../../../controller/api/admin/ApiGrade";
import { useGetMajorQuery } from "../../../controller/api/admin/ApiMajor";

const Form = ({ detail, setDetail }) => {
  const page = "";
  const limit = "";
  const search = "";

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [majorId, setMajorId] = useState("");

  const { data: grades } = useGetGradeQuery({ page, limit, search });
  const { data: majors } = useGetMajorQuery({ page, limit, search });
  const [addClass, { isSuccess, isLoading, error, reset }] =
    useAddClassMutation();

  const addHandler = (e) => {
    e.preventDefault();

    const data = { id, name, gradeId, majorId };

    toast.promise(
      addClass(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menyimpan data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setId("");
    setName("");
    setGradeId("");
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      setName("");
      setId("");
      setGradeId("");
      setMajorId("");
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (detail) {
      setId(detail.id);
      setName(detail.name);
      setGradeId(detail.grade);
      setMajorId(detail.major);
    }
  }, [detail]);

  return (
    <form
      onSubmit={addHandler}
      className='bg-white rounded border d-flex flex-column gap-2 p-2'>
      <p className='m-0 h6'>Kelas</p>

      {majors?.length > 0 && (
        <select
          className='form-select'
          value={majorId || ""}
          onChange={(e) => setMajorId(e.target.value)}>
          <option value='' hidden>
            Pilih Jurusan
          </option>
          {majors?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      )}

      <select
        className='form-select'
        value={gradeId || ""}
        onChange={(e) => setGradeId(e.target.value)}
        required>
        <option value='' hidden>
          Pilih Tingkat
        </option>
        {grades?.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <input
        type='text'
        name='class'
        id='class'
        className='form-control'
        placeholder='Nama Kelas'
        value={name || ""}
        onChange={(e) => setName(e.target.value)}
        required
      />

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
