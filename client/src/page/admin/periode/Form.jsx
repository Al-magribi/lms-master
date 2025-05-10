import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAddPeriodeMutation } from "../../../controller/api/admin/ApiPeriode";

const Form = ({ detail, setDetail }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const [addPeriode, { isSuccess, isLoading, isError, reset }] =
    useAddPeriodeMutation();

  const addHandler = (e) => {
    e.preventDefault();

    const data = { id, name };

    toast.promise(
      addPeriode(data)
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
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      setDetail({});
      setId("");
      setName("");
    }

    if (isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (detail) {
      setId(detail.id);
      setName(detail.name);
    }
  }, [detail]);

  return (
    <form
      onSubmit={addHandler}
      className='rounded bg-white p-2 border d-flex flex-column gap-2'>
      <p className='m-0 h6'>Periode</p>

      <input
        type='text'
        name='periode'
        id='periode'
        className='form-control'
        placeholder='Periode'
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
