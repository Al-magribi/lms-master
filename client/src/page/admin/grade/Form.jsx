import React, { useEffect, useState } from "react";
import { useAddGradeMutation } from "../../../controller/api/admin/ApiGrade";
import { toast } from "react-hot-toast";

const Form = ({ detail, setDetail }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const [addGrade, { isSuccess, isLoading, error, reset }] =
    useAddGradeMutation();

  const addHandler = (e) => {
    e.preventDefault();

    const data = { id, name };

    toast.promise(
      addGrade(data)
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
    setId("");
    setName("");
    setDetail("");
  };

  useEffect(() => {
    if (detail) {
      setId(detail.id);
      setName(detail.name);
    }
  }, [detail]);

  useEffect(() => {
    if (isSuccess) {
      reset();
      setId("");
      setName("");
      setDetail("");
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);
  return (
    <form
      onSubmit={addHandler}
      className='bg-white rounded border p-2 d-flex flex-column gap-2'>
      <p className='m-0 h6'>Tingkat Satuan Pendidikan</p>

      <input
        type='text'
        name='grade'
        id='grade'
        className='form-control'
        placeholder='Tingkat'
        required
        value={name || ""}
        onChange={(e) => setName(e.target.value)}
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
