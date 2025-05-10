import React, { useState } from "react";
import { useGetTypesQuery } from "../../../controller/api/tahfiz/ApiMetric";
import { useGetExaminersQuery } from "../../../controller/api/tahfiz/ApiExaminer";
import { useGetJuzQuery } from "../../../controller/api/tahfiz/ApiQuran";
import Select from "react-select";
import toast from "react-hot-toast";

const Selects = ({
  typeId,
  setTypeId,
  examiner,
  setExaminer,
  surah,
  setSelectedSurah,
  setSelectedJuz,
  countAyat,
  fromAyat,
  setFromAyat,
  toAyat,
  setToAyat,
  countLine,
  fromLine,
  setFromLine,
  toLine,
  setToLine,
  addToTable,
  setTableData,
}) => {
  const { data: types } = useGetTypesQuery({ page: "", limit: "", search: "" });
  const { data: examiners } = useGetExaminersQuery({
    page: "",
    limit: "",
    search: "",
  });
  const { data: juzData } = useGetJuzQuery({ page: "", limit: "", search: "" });

  const [selectedJuzOptions, setSelectedJuzOptions] = useState([]);

  const [surahList, setSurahList] = useState([]);
  const [selectedSurahData, setSelectedSurahData] = useState(null);

  const handleJuzChange = (selectedOptions) => {
    setSelectedJuzOptions(selectedOptions || []);
  };

  const handleJuzChangeForSurah = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedJuz = juzData?.find((item) => item.id === selectedId);

    if (!selectedJuz || selectedJuz.surah.length === 0) {
      toast.error("Data tidak tersedia");
      setSurahList([]);
    } else {
      setSelectedJuz(selectedJuz);
      setSurahList(selectedJuz.surah);
    }
  };

  const handleSurahChange = (e) => {
    const surahId = parseInt(e.target.value);
    const selected = surahList.find((s) => s.id === surahId);

    if (!selected) {
      toast.error("Surah tidak ditemukan!");
    } else {
      setSelectedSurah(selected);
      setSelectedSurahData(selected);
      // Reset nilai ayat dan baris ketika surah berubah
      setFromAyat("");
      setToAyat("");
      setFromLine("");
      setToLine("");
    }
  };

  const handleSurahBulk = () => {
    if (selectedJuzOptions.length === 0) {
      toast.error("Pilih Juz terlebih dahulu");
      return;
    }

    const newTableData = [];
    selectedJuzOptions.forEach((selectedOption) => {
      const juz = juzData?.find((item) => item.id === selectedOption.value);

      if (!juz || juz.surah.length === 0) {
        toast.error(`Data tidak tersedia untuk Juz ${selectedOption.label}`);
      } else {
        setSelectedJuz(juz);
        newTableData.push(
          ...juz.surah.map((item) => ({
            juzId: juz.id,
            fromSurah: item.surah_id,
            fromSurahName: item.surah,
            fromAyat: item.from_ayat,
            toAyat: item.to_ayat,
            fromLine: 1,
            toLine: item.lines,
          }))
        );
      }
    });

    if (newTableData.length > 0) {
      setTableData((prevData) => [...prevData, ...newTableData]);
      setSelectedJuzOptions([]);
    }
  };

  return (
    <div className='row g-2'>
      <div className='col-12'>
        <div className='row g-2'>
          <div className='col-12'>
            <p className='m-0'>Hafalan Berdasarkan Juz</p>
          </div>

          <div className='col-6'>
            <Select
              isMulti
              options={juzData?.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              value={selectedJuzOptions}
              onChange={handleJuzChange}
              placeholder='Pilih Juz'
            />
          </div>

          <div className='col-6 d-flex align-items-center'>
            <button
              className='btn btn-sm btn-primary'
              onClick={handleSurahBulk}>
              <i className='bi bi-floppy'></i>
            </button>
          </div>

          <div className='col-12'>
            <p className='m-0'>Hafalan Berdasarkan Surah</p>
          </div>

          <div className=' col-6'>
            <select
              name='juz2'
              id='jus2'
              className='form-select'
              onChange={handleJuzChangeForSurah}>
              <option value='' hidden>
                Pilih Juz
              </option>
              {juzData?.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className=' col-6'>
            <select
              name='surah'
              id='surah'
              className='form-select'
              onChange={handleSurahChange}
              disabled={surahList.length === 0}>
              <option value='' hidden>
                Pilih Surah
              </option>
              {surahList?.map((surah) => (
                <option key={surah.id} value={surah.id}>
                  {surah.surah}
                </option>
              ))}
            </select>
          </div>

          <div className=' col-6'>
            <select
              name='fromAyat'
              id='fromAyat'
              className='form-select'
              disabled={!selectedSurahData}
              value={fromAyat}
              onChange={(e) => setFromAyat(e.target.value)}>
              <option value='' hidden>
                Dari Ayat
              </option>
              {selectedSurahData &&
                Array.from(
                  {
                    length:
                      selectedSurahData.to_ayat -
                      selectedSurahData.from_ayat +
                      1,
                  },
                  (_, i) => selectedSurahData.from_ayat + i
                ).map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
            </select>
          </div>

          <div className=' col-6'>
            <select
              name='toAyat'
              id='toAyat'
              className='form-select'
              disabled={!fromAyat}
              value={toAyat}
              onChange={(e) => setToAyat(e.target.value)}>
              <option value='' hidden>
                Sampai Ayat
              </option>
              {selectedSurahData &&
                Array.from(
                  {
                    length:
                      selectedSurahData.to_ayat -
                      selectedSurahData.from_ayat +
                      1,
                  },
                  (_, i) => selectedSurahData.from_ayat + i
                ).map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
            </select>
          </div>

          <div className='col-lg-4 col-6'>
            <select
              name='fromLine'
              id='fromLine'
              className='form-select'
              disabled={!toAyat}
              value={fromLine}
              onChange={(e) => setFromLine(e.target.value)}>
              <option value='' hidden>
                Dari Baris
              </option>
              {selectedSurahData &&
                Array.from(
                  { length: selectedSurahData.lines },
                  (_, i) => i + 1
                ).map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
            </select>
          </div>

          <div className='col-lg-4 col-6'>
            <select
              name='toLine'
              id='toLine'
              className='form-select'
              disabled={!fromLine}
              value={toLine}
              onChange={(e) => setToLine(e.target.value)}>
              <option value='' hidden>
                Sampai Baris
              </option>
              {selectedSurahData &&
                Array.from(
                  { length: selectedSurahData.lines },
                  (_, i) => i + 1
                ).map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
            </select>
          </div>

          <div className='col-lg-4 col-12 d-flex align-items-center justify-content-lg-start justify-content-end'>
            <button
              className='btn btn-sm btn-primary'
              disabled={!toLine}
              onClick={addToTable}>
              <i className='bi bi-floppy'></i>
            </button>
          </div>

          <div className='col-6'>
            <select
              name='type'
              id='type'
              className='form-select'
              value={typeId || ""}
              onChange={(e) => setTypeId(e.target.value)}>
              <option value='' hidden>
                Jenis Penilaian
              </option>
              {types?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className='col-6'>
            <select
              name='examiner'
              id='examiner'
              className='form-select'
              value={examiner || ""}
              onChange={(e) => setExaminer(e.target.value)}>
              <option value='' hidden>
                Penguji
              </option>
              {examiners?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Selects;
