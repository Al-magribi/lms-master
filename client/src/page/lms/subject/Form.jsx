import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "../../../components/editor/Editor";
import { toast } from "react-hot-toast";
import {
  useAddChapterMutation,
  useGetClassesQuery,
} from "../../../controller/api/lms/ApiChapter";
import Select from "react-select";

const Form = ({ detail, setDetail }) => {
  const params = useParams();
  const { id } = params;

  const { data: classes } = useGetClassesQuery();
  const [addChapter, { isSuccess, isError, reset }] = useAddChapterMutation();

  const [chapterid, setChapterid] = useState("");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);

  const classOptions = classes?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const addHandler = (e) => {
    e.preventDefault();

    if (!title || !target) {
      toast.error("Harap isi semua data");
      return;
    }

    const data = {
      subjectid: id,
      chapterid,
      title,
      target,
      classes: selectedClasses.map((cls) => cls.value),
    };

    toast.promise(
      addChapter(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const handleClassChange = (selectedOption) => {
    setSelectedClasses(selectedOption || []);
  };

  useEffect(() => {
    if (isSuccess || isError) {
      setTitle("");
      setTarget("");
      setSelectedClasses([]);
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (detail) {
      setChapterid(detail.chapter_id);
      setTitle(detail.chapter_name);
      setTarget(detail.target);
      setSelectedClasses(
        detail.class?.map((cls) => ({ value: cls.id, label: cls.name }))
      );
    }
  }, [detail]);

  return (
    <form
      onSubmit={addHandler}
      className='d-flex flex-column gap-2 rounded border p-2 bg-white'>
      <p className='m-0 h6'>BAB</p>
      <input
        type='text'
        name='title'
        id='title'
        className='form-control'
        placeholder='Nama Bab'
        required
        value={title || ""}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Editor
        placeholder='Capaian Pembelajaran'
        value={target}
        onChange={(html) => setTarget(html)}
        height={300}
      />

      <Select
        isClearable
        isSearchable
        isMulti
        placeholder='Pilih Kelas'
        value={selectedClasses}
        options={classOptions}
        onChange={handleClassChange}
      />

      <div className='d-flex justify-content-end gap-2'>
        <button type='button' className='btn btn-sm btn-warning'>
          Batal
        </button>
        <button type='submit' className='btn btn-sm btn-success'>
          Simpan
        </button>
      </div>
    </form>
  );
};

export default Form;
