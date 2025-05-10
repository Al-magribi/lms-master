import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useUploadStudentsMutation } from "../../../controller/api/admin/ApiStudent";
import { toast } from "react-hot-toast";

const Upload = () => {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const [uploadStudents, { isSuccess, isLoading, isError, reset }] =
    useUploadStudentsMutation();

  const download = () => {
    window.open("/temp/template_siswa.xlsx", "_blank");
  };

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

        // Filter data to only include columns A, B, C, D and rows that are not null
        const filteredData = jsonData
          .map((row) => {
            const [colA, colB, colC, colD] = row;
            return [colA, colB, colC, colD];
          })
          .filter((row) =>
            row.every((cell) => cell !== null && cell !== undefined)
          );

        // Pastikan filteredData adalah array
        const result = Array.isArray(filteredData)
          ? filteredData
          : [filteredData];

        toast.promise(
          uploadStudents(result)
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
      inputRef.current.value = null;
      reset();
    }

    if (isError) {
      reset();
      inputRef.current.value = null;
    }
  }, [isSuccess, isError]);

  return (
    <form
      onSubmit={uploadData}
      className="rounded bg-white p-2 border  d-flex flex-column gap-2 mt-2"
    >
      <p className="m-0 h6">Upload Siswa</p>

      <input
        ref={inputRef}
        type="file"
        name="students"
        id="student"
        className="form-control"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={download}
        >
          Template
        </button>
        <button
          type="submit"
          className="btn btn-sm btn-success"
          disabled={isLoading}
        >
          Upload Data
        </button>
      </div>
    </form>
  );
};

export default Upload;
