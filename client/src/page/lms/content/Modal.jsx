import React, { useState, useEffect } from "react";
import { useAddContentFileMutation } from "../../../controller/api/lms/ApiChapter";
import toast from "react-hot-toast";

const Modal = ({ title, content, onClose, modalId }) => {
  const [formData, setFormData] = useState({
    title: "",
    files: [],
    video: "",
  });

  const [addContentFile] = useAddContentFileMutation();

  const isFileModal = title?.startsWith("File:");
  const isYoutubeModal = title?.startsWith("Youtube URL:");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files") {
      setFormData((prev) => ({
        ...prev,
        [name]: Array.from(files),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      files: [],
      video: "",
    });
  };

  useEffect(() => {
    if (!title) {
      resetForm();
    }
  }, [title]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("contentId", content.id);
    formDataToSend.append("title", formData.title);

    if (isFileModal && formData.files.length > 0) {
      formData.files.forEach((file) => {
        formDataToSend.append("files", file);
      });
    } else if (isYoutubeModal && formData.video) {
      formDataToSend.append("video", formData.video);
    }

    toast.promise(
      addContentFile(formDataToSend)
        .unwrap()
        .then((res) => {
          resetForm();
          document
            .querySelector(`#${modalId} [data-bs-dismiss="modal"]`)
            .click();
          return res.message;
        }),
      {
        loading: "Sedang menyimpan...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  return (
    <div
      className='modal fade'
      id={modalId}
      data-bs-backdrop='static'
      data-bs-keyboard='false'
      tabIndex='-1'
      aria-labelledby={`${modalId}Label`}
      aria-hidden='true'
    >
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1 className='modal-title fs-5' id={`${modalId}Label`}>
              {title}
            </h1>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='modal-body d-flex flex-column gap-2'>
              <div className='form-group'>
                <label htmlFor={`title-${modalId}`}>
                  {isFileModal ? "Nama File" : "Nama Video"}
                </label>
                <input
                  type='text'
                  className='form-control'
                  id={`title-${modalId}`}
                  name='title'
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {isFileModal && (
                <div className='form-group'>
                  <label htmlFor={`files-${modalId}`}>Upload File</label>
                  <input
                    type='file'
                    className='form-control'
                    id={`files-${modalId}`}
                    name='files'
                    onChange={handleChange}
                    multiple
                    required
                  />
                </div>
              )}

              {isYoutubeModal && (
                <div className='form-group'>
                  <label htmlFor={`video-${modalId}`}>URL Video Youtube</label>
                  <input
                    type='text'
                    className='form-control'
                    id={`video-${modalId}`}
                    name='video'
                    value={formData.video}
                    onChange={handleChange}
                    placeholder='Masukkan URL video Youtube'
                    required
                  />
                </div>
              )}
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-sm btn-danger'
                data-bs-dismiss='modal'
                onClick={onClose}
              >
                Tutup
              </button>
              <button type='submit' className='btn btn-sm btn-success'>
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modal;
