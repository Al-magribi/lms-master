import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { toast } from "react-hot-toast";
import {
  useDeleteFileMutation,
  useDeleteContentMutation,
} from "../../../controller/api/lms/ApiChapter";
import ModalAddContent from "../chapter/ModalAddContent";
import Swal from "sweetalert2";
import { useDrag, useDrop } from "react-dnd";

const createMarkup = (html) => {
  return { __html: html };
};

const ContentCard = ({ content, chapterId, index, moveContent, id }) => {
  const [modalTitle, setModalTitle] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  const modalId = `file-${content.content_id}`;
  const editModalId = `edit-content-${content.content_id}`;
  const [deleteFile] = useDeleteFileMutation();
  const [deleteContent] = useDeleteContentMutation();
  const ref = React.useRef(null);

  const [{ handlerId }, drop] = useDrop({
    accept: "content",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveContent(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "content",
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const openLink = (link) => {
    window.open(`${window.location.origin}${link}`, "_blank");
  };

  const openYoutube = (link) => {
    window.open(link, "_blank");
  };

  const handleModalOpen = (type) => {
    const contentData = {
      id: content.content_id,
      title: content.content_title,
      target: content.content_target,
      files: Array.isArray(content.files) ? content.files : [],
      video: Array.isArray(content.videos) ? content.video : [],
      chapterId,
    };

    setSelectedContent(contentData);

    if (type === "file") {
      setModalTitle(`File: ${content.content_title}`);
    } else if (type === "youtube") {
      setModalTitle(`Youtube URL: ${content.content_title}`);
    }
  };

  const handleModalClose = () => {
    setModalTitle("");
    setSelectedContent(null);
  };

  const handleDeleteFile = async (id, type) => {
    toast.promise(deleteFile(id).unwrap(), {
      loading: "Menghapus...",
      success: `${type} berhasil dihapus`,
      error: (err) => `Error: ${err.data?.message || "Terjadi kesalahan"}`,
    });
  };

  const handleDeleteContent = () => {
    Swal.fire({
      title: "Konfirmasi Penghapusan",
      text: "Apakah anda yakin ingin menghapus materi ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        toast.promise(
          deleteContent(content.content_id)
            .unwrap()
            .then((res) => res.message),
          {
            loading: "Menghapus materi...",
            success: (message) => message,
            error: (err) => err.data.message,
          }
        );
      }
    });
  };

  useEffect(() => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.addEventListener("hidden.bs.modal", handleModalClose);
      return () => {
        modal.removeEventListener("hidden.bs.modal", handleModalClose);
      };
    }
  }, [modalId]);

  return (
    <div
      className='container'
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      <div className='row'>
        <div className='col-12'>
          <div className={`card ${isDragging ? "shadow-lg" : ""}`}>
            <div className='card-body'>
              <div className='card-title d-flex align-items-center justify-content-between'>
                <h6 className='m-0'>Materi: {content.content_title}</h6>
                <div className='d-flex gap-2'>
                  <button
                    className='btn btn-sm btn-danger'
                    data-bs-toggle='modal'
                    data-bs-target={`#${modalId}`}
                    onClick={() => handleModalOpen("youtube")}
                  >
                    <i className='bi bi-youtube'></i>
                  </button>

                  <button
                    className='btn btn-sm btn-primary'
                    data-bs-toggle='modal'
                    data-bs-target={`#${modalId}`}
                    onClick={() => handleModalOpen("file")}
                  >
                    <i className='bi bi-files'></i>
                  </button>

                  <button
                    className='btn btn-sm btn-warning'
                    data-bs-toggle='modal'
                    data-bs-target={`#${editModalId}`}
                  >
                    <i className='bi bi-pencil-square'></i>
                  </button>

                  <button
                    className='btn btn-sm btn-danger'
                    onClick={handleDeleteContent}
                  >
                    <i className='bi bi-trash'></i>
                  </button>

                  <button className='btn btn-sm btn-secondary'>
                    <i className='bi bi-arrows-move'></i>
                  </button>
                </div>
              </div>
              <div
                className='card-text'
                dangerouslySetInnerHTML={createMarkup(content.content_target)}
              />
            </div>
            <div className='card-footer d-flex gap-2 flex-wrap'>
              {content.files?.map((file, i) => (
                <div key={i} className='btn-group'>
                  <button
                    className='btn btn-sm btn-secondary'
                    onClick={() => openLink(file.file)}
                  >
                    <i className='bi bi-file-earmark-arrow-down me-2'></i>
                    {file.title}
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={() => handleDeleteFile(file.id, "File")}
                  >
                    <i className='bi bi-x'></i>
                  </button>
                </div>
              ))}

              {content.videos?.map((video, i) => (
                <div key={i} className='btn-group'>
                  <button
                    className='btn btn-sm btn-secondary'
                    onClick={() => openYoutube(video.video)}
                  >
                    <i className='bi bi-youtube me-2'></i>
                    {video.title}
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={() => handleDeleteFile(video.id, "Video")}
                  >
                    <i className='bi bi-x'></i>
                  </button>
                </div>
              ))}
            </div>

            <Modal
              title={modalTitle}
              content={selectedContent}
              onClose={handleModalClose}
              modalId={modalId}
            />

            <ModalAddContent
              chapter={{
                chapter_id: chapterId,
                chapter_name: content.content_title,
              }}
              modalId={editModalId}
              selectedContent={content}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
