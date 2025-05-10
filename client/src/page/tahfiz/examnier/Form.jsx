import React, { useEffect, useState } from "react";
import { useAddExaminerMutation } from "../../../controller/api/tahfiz/ApiExaminer";
import { toast } from "react-hot-toast";

const Form = ({ detail, setDetail }) => {
  const [formData, setFormData] = useState({
    id: detail ? detail.id : "",
    name: "",
  });

  const [addExaminer, { isLoading, isSuccess, isError, reset }] =
    useAddExaminerMutation();

  const addHandler = (e) => {
    e.preventDefault();

    toast.promise(
      addExaminer(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat...",
        success: (message) => message,
        error: (error) => error.data?.message,
      }
    );
  };

  const cancel = () => {
    setDetail({});
    setFormData({
      id: "",
      name: "",
    });
  };

  useEffect(() => {
    if (isSuccess || isError) {
      cancel();
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (detail) {
      setFormData({
        id: detail.id,
        name: detail.name,
      });
    }
  }, [detail]);

  return (
    <form
      onSubmit={addHandler}
      className='rounded border bg-white p-2 d-flex flex-column gap-2'>
      <p className='m-0 h6'>Penguji</p>

      <input
        type='text'
        name='name'
        id='name'
        required
        className='form-control'
        placeholder='Nama Penguji'
        value={formData.name || ""}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
