import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAddJuzMutation } from "../../../controller/api/tahfiz/ApiQuran";
const FormJuz = ({ detail, setDetail }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const [addJuz, { isLoading, isSuccess, isError, reset }] =
    useAddJuzMutation();

  const addHandler = (e) => {
    e.preventDefault();

    const data = { id: id ? id : "", name };

    toast.promise(
      addJuz(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menambahkan data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setName("");
    setId("");
  };

  useEffect(() => {
    if (detail) {
      setName(detail.name);
      setId(detail.id);
    }
  }, [detail]);

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
      setDetail({});
      setName("");
      setId("");
    }
  }, [isSuccess, isError]);

  return (
    <form
      onSubmit={addHandler}
      className='rounded border p-2 d-flex flex-column gap-2 bg-white'>
      <p className='m-0 h6'>Tambah Juz</p>

      <input
        type='text'
        className='form-control'
        placeholder='Nama Juz'
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

export default FormJuz;
