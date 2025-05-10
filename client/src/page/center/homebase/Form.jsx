import React, { useEffect, useState } from "react";
import { useAddHomebaseMutation } from "../../../controller/api/center/ApiHomebase";
import { toast } from "react-hot-toast";

const Form = ({ detail, setDetail }) => {
  const [name, setName] = useState("");
  const [id, setId] = useState("");

  const [addHomebase, { data, isLoading, isSuccess, error, reset }] =
    useAddHomebaseMutation();

  const addHandler = (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Lenkapi data");
    }

    const body = { id, name };

    toast.promise(
      addHomebase(body)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menyimpan data...",
        success: (message) => message,
        error: (err) => err.data?.message,
      }
    );
  };

  useEffect(() => {
    if (detail) {
      setName(detail.name);
      setId(detail.id);
    }
  }, [detail]);

  useEffect(() => {
    if (isSuccess) {
      reset();
      setName("");
      setId("");
    }

    if (error) {
      reset();
    }
  }, [isSuccess]);
  return (
    <form
      onSubmit={addHandler}
      className='rounded border p-2 d-flex flex-column gap-2'>
      <p className='m-0 h6'>Satuan Pendidikan</p>

      <input
        type='text'
        name='homebase'
        className='form-control'
        placeholder='SD / SMP / SMA / SMK / Sekolah'
        value={name || ""}
        onChange={(e) => setName(e.target.value)}
      />

      <div className='d-flex justify-content-end gap-2'>
        <button
          type='button'
          className='btn btn-sm btn-warning'
          onClick={() => setDetail({})}>
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
