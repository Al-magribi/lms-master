import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAddStudentMutation } from "../../../controller/api/admin/ApiClass";

const Add = ({ classid }) => {
  const [nis, setNis] = useState("");

  const [addStudent, { isSuccess, isLoading, isError, reset }] =
    useAddStudentMutation();

  const addHandler = (e) => {
    e.preventDefault();

    const data = { nis, classid };

    toast.promise(
      addStudent(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Meyimpan data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      setNis("");
    }

    if (isError) {
      reset();
      setNis("");
    }
  }, [isSuccess, isError]);
  return (
    <form onSubmit={addHandler} className='d-flex align-items-center gap-2'>
      <input
        type='text'
        name='nis'
        id='nis'
        className='form-control'
        placeholder='NIS'
        required
        value={nis || ""}
        onChange={(e) => setNis(e.target.value)}
      />

      <button
        type='submit'
        className='btn btn-sm btn-outline-primary'
        disabled={isLoading}>
        Simpan
      </button>
    </form>
  );
};

export default Add;
