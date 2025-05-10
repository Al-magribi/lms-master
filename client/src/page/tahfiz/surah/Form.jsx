import React, { useEffect, useState } from "react";
import { useAddSurahMutation } from "../../../controller/api/tahfiz/ApiQuran";
import { toast } from "react-hot-toast";

const Form = ({ detail, setDetail }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [ayat, setAyat] = useState("");
  const [lines, setLines] = useState("");
  const [addSurah, { isLoading, isSuccess, isError, reset }] =
    useAddSurahMutation();

  const addHandler = async (e) => {
    e.preventDefault();

    const data = {
      id: id ? id : "",
      name,
      ayat,
      lines,
    };

    toast.promise(
      addSurah(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menyimpan...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setId("");
    setName("");
    setAyat("");
    setLines("");
  };

  useEffect(() => {
    if (isSuccess) {
      setDetail({});
      setId("");
      setName("");
      setAyat("");
      setLines("");
      reset();
    }

    if (isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (detail) {
      setId(detail.id);
      setName(detail.name);
      setAyat(detail.ayat);
      setLines(detail.lines);
    }
  }, [detail]);

  return (
    <form
      onSubmit={addHandler}
      className='rounded border bg-white d-flex flex-column gap-2 p-2'>
      <p className='m-0 h6'>Surah</p>

      <input
        type='text'
        name='name'
        id='name'
        className='form-control'
        placeholder='Nama Surah'
        value={name || ""}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type='number'
        name='ayat'
        id='ayat'
        className='form-control'
        placeholder='Jumlah Ayat'
        value={ayat || ""}
        onChange={(e) => setAyat(e.target.value)}
        required
      />

      <input
        type='number'
        name='line'
        id='line'
        className='form-control'
        placeholder='Jumlah Baris'
        value={lines || ""}
        onChange={(e) => setLines(e.target.value)}
        required
      />

      <div className='d-flex justify-content-end gap-2'>
        <button type='button' className='btn btn-warning' onClick={cancel}>
          Batal
        </button>
        <button type='submit' className='btn btn-success' disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default Form;
