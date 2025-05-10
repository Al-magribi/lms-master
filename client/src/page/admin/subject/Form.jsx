import { useEffect, useRef, useState } from "react";
import { useAddSubjectMutation } from "../../../controller/api/admin/ApiSubject";
import { toast } from "react-hot-toast";

const Form = ({ detail, setDetail }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const [addSubject, { isSuccess, isLoading, isError, reset }] =
    useAddSubjectMutation();

  const addHandler = (e) => {
    e.preventDefault();

    if (!name) {
      return toast.error("Lengkapi data");
    }

    const data = new FormData();
    data.append("id", id ? id : "");
    data.append("name", name);
    data.append("cover", file);

    toast.promise(
      addSubject(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Meyimpan data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setId("");
    setName("");
    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

  useEffect(() => {
    if (detail) {
      setId(detail.id);
      setName(detail.name);
    }
  }, [detail]);

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
      setDetail({});
      setId("");
      setName("");
      if (inputRef.current) {
        inputRef.current.value = null;
      }
    }
  }, [isSuccess, isError]);

  return (
    <form
      onSubmit={addHandler}
      className='rounded border p-2 bg-white d-flex flex-column gap-2'>
      <p className='m-0 h6'>Mata Pelajaran</p>

      <input
        type='text'
        name='name'
        id='name'
        className='form-control'
        placeholder='Nama Mata Pelajaran'
        value={name || ""}
        onChange={(e) => setName(e.target.value)}
      />

      <div className='input-group'>
        <input
          type='file'
          className='form-control'
          id='inputGroupFile02'
          ref={inputRef}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label className='input-group-text' htmlFor='inputGroupFile02'>
          Cover
        </label>
      </div>

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
