import { useEffect, useRef, useState } from "react";
import { useUploadStudentsMutation } from "../../../controller/api/admin/ApiClass";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

const Upload = ({ classid }) => {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const [uploadStudents, { isSuccess, isLoading, isError, reset }] =
    useUploadStudentsMutation();

  const uploadData = (e) => {
    e.preventDefault();

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          range: 1,
        });

        // Filter data to only include columns A, B and rows that are not null
        const filteredData = jsonData
          .map((row) => {
            const [colA, colB] = row;
            return [colA, colB];
          })
          .filter((row) =>
            row.every((cell) => cell !== null && cell !== undefined)
          );

        // Pastikan filteredData adalah array
        const result = Array.isArray(filteredData)
          ? filteredData
          : [filteredData];

        const formData = { students: filteredData, classid };

        toast.promise(
          uploadStudents(formData)
            .unwrap()
            .then((res) => res.message),
          {
            loading: "Menyimpan data...",
            success: (message) => message,
            error: (err) => err.data.message,
          }
        );
      };

      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      inputRef.current.value = null;
    }

    if (isError) {
      reset();
      inputRef.current.value = null;
    }
  }, [isSuccess, isError]);

  return (
    <div className='d-flex align-items-center gap-2'>
      <input
        ref={inputRef}
        type='file'
        name='file'
        id='file'
        className='form-control'
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        className='btn btn-sm btn-outline-primary'
        disabled={isLoading}
        onClick={uploadData}>
        Upload
      </button>
    </div>
  );
};

export default Upload;
