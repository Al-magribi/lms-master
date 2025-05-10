import React, { useEffect, useState } from "react";
import {
  useGetJuzQuery,
  useGetSurahQuery,
  useAddSurahToJuzMutation,
} from "../../../controller/api/tahfiz/ApiQuran";
import { toast } from "react-hot-toast";

const FormSurah = ({ detail, setDetail }) => {
  const [id, setId] = useState("");
  const [juzId, setJuzId] = useState("");
  const [surahId, setSurahId] = useState("");
  const [fromAyat, setFromAyat] = useState("");
  const [toAyat, setToAyat] = useState("");
  const [lines, setLines] = useState("");

  const { data: juz } = useGetJuzQuery({ page: "", limit: "", search: "" });
  const { data: surah } = useGetSurahQuery({ page: "", limit: "", search: "" });
  const [addSurahToJuz, { isLoading, isSuccess, isError, reset }] =
    useAddSurahToJuzMutation();

  const getAyatOptions = (id) => {
    const selectedSurah = surah?.find((surah) => surah.id === parseInt(id));
    return selectedSurah
      ? Array.from({ length: selectedSurah.ayat }, (_, i) => i + 1)
      : [];
  };

  const addHanlder = (e) => {
    e.preventDefault();

    const data = { id, juzId, surahId, fromAyat, toAyat, lines };

    toast.promise(
      addSurahToJuz(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Menambahkan data...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  useEffect(() => {
    if (detail) {
      setId(detail.id);
      setJuzId(detail.juz_id);
      setSurahId(detail.surah_id);
      setFromAyat(detail.from_ayat);
      setToAyat(detail.to_ayat);
      setLines(detail.lines || "");
    }
  }, [detail]);

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
      setDetail({});
      setId("");
      setJuzId("");
      setSurahId("");
      setFromAyat("");
      setToAyat("");
      setLines("");
    }
  }, [isSuccess, isError]);

  return (
    <form
      onSubmit={addHanlder}
      className='mt-2 rounded border bg-white p-2 d-flex flex-column gap-2'>
      <p className='m-0 h6'>Tambah Surah</p>

      <select
        name='juz'
        id='juz'
        className='form-select'
        required
        value={juzId}
        onChange={(e) => setJuzId(e.target.value)}>
        <option value='' hidden>
          Pilih Juz
        </option>

        {juz?.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <select
        name='surah'
        id='surah'
        className='form-select'
        required
        value={surahId}
        onChange={(e) => setSurahId(e.target.value)}>
        <option value='' hidden>
          Pilih Surah
        </option>
        {surah?.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <select
        className='form-select'
        value={fromAyat}
        onChange={(e) => setFromAyat(e.target.value)}
        disabled={!surahId}>
        <option value='' hidden>
          Dari Ayat
        </option>
        {getAyatOptions(surahId).map((ayat) => (
          <option key={ayat} value={ayat}>
            {ayat}
          </option>
        ))}
      </select>

      <select
        className='form-select'
        value={toAyat}
        onChange={(e) => setToAyat(e.target.value)}
        disabled={!surahId}>
        <option value='' hidden>
          Sampai Ayat
        </option>
        {getAyatOptions(surahId).map((ayat) => (
          <option key={ayat} value={ayat}>
            {ayat}
          </option>
        ))}
      </select>

      <input
        type='number'
        name='lines'
        id='lines'
        placeholder='Jumlah Baris'
        className='form-control'
        value={lines || ""}
        onChange={(e) => setLines(e.target.value)}
        disabled={!surahId}
      />

      <div className='text-end'>
        <button
          type='button'
          className='btn btn-sm btn-warning me-2'
          onClick={setDetail}>
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

export default FormSurah;
