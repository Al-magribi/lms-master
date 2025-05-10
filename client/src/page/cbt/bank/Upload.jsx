import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { useUploadQuestionMutation } from "../../../controller/api/cbt/ApiBank";

const Upload = ({ bankid }) => {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const [uploadQuestion, { isLoading, isError, isSuccess, reset }] =
    useUploadQuestionMutation();

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

        // Filter out empty rows and process the data
        const filteredData = jsonData
          .filter(
            (row) =>
              row.length > 0 &&
              row.some((cell) => cell !== null && cell !== undefined)
          )
          .map((row) => {
            const [colA, colB, colC, colD, colE, colF, colG, colH, colI] = row;

            // Handle type 2 questions (where some columns can be null)
            if (colA === 2) {
              return [
                colA, // qtype
                colB, // question
                null, // a
                null, // b
                null, // c
                null, // d
                null, // e
                colH, // qkey (correct answer)
                colI, // poin
              ];
            }

            // Handle regular questions
            return [
              colA, // qtype
              colB, // question
              colC, // a
              colD, // b
              colE, // c
              colF, // d
              colG, // e
              colH, // qkey (correct answer)
              colI, // poin
            ];
          });

        toast.promise(
          uploadQuestion({ body: filteredData, bankid: bankid })
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

  const cancel = () => {
    inputRef.current.value = null;
    setFile(null);
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
    <div
      className="modal fade"
      id="upload"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="staticBackdropLabel">
              Upload Soal
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <input
              type="file"
              name="file"
              id="file"
              className="form-control"
              ref={inputRef}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              data-bs-dismiss="modal"
              onClick={cancel}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={isLoading}
              onClick={uploadData}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
