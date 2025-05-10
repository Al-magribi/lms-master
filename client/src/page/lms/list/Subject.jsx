import React from "react";
import Layout from "../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetSubjectQuery } from "../../../controller/api/lms/ApiLms";

const createMarkup = (html) => {
  return { __html: html };
};

const Subject = () => {
  const { id, name } = useParams();
  const { user } = useSelector((state) => state.auth);
  const formattedName = name.replace(/\s+/g, "-");

  // Fetch subject data using the new endpoint
  const {
    data: subject,
    isLoading,
    error,
  } = useGetSubjectQuery(
    {
      subjectid: id,
      classid: user?.level === "student" ? user?.class_id : undefined,
    },
    { skip: !id }
  );

  return (
    <Layout title={formattedName} levels={["student", "admin"]}>
      <div className='container py-4'>
        {isLoading ? (
          <div className='text-center py-5'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <p className='mt-2'>Memuat data mata pelajaran...</p>
          </div>
        ) : error ? (
          <div className='alert alert-danger'>
            Terjadi kesalahan saat memuat data: {error.message}
          </div>
        ) : subject ? (
          <>
            {/* Subject Header */}
            <div className='card mb-4 shadow'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  {subject.cover ? (
                    <img
                      src={`${window.location.origin}${subject.cover}`}
                      alt={subject.name}
                      className='me-3 rounded'
                      style={{
                        width: "120px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className='me-3 bg-light rounded d-flex align-items-center justify-content-center'
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i
                        className='bi bi-book text-muted'
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                  )}
                  <div>
                    <h5 className='card-title mb-1'>{subject.name}</h5>
                    <p className='card-subtitle text-muted'>
                      {subject.chapters?.length || 0} Bab Pembelajaran
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters Accordion */}
            <div className='accordion mb-4 shadow' id='chaptersAccordion'>
              {subject.chapters?.map((chapter, index) => (
                <div key={chapter.id} className='accordion-item'>
                  <h2 className='accordion-header' id={`heading${chapter.id}`}>
                    <button
                      className={`accordion-button ${
                        index === 0 ? "" : "collapsed"
                      }`}
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target={`#collapse${chapter.id}`}
                      aria-expanded={index === 0 ? "true" : "false"}
                      aria-controls={`collapse${chapter.id}`}
                    >
                      <div className='d-flex align-items-center'>
                        <i className='bi bi-folder me-2 text-primary'></i>
                        <div>
                          <div className='fw-bold'>{chapter.title}</div>
                          <small
                            className='text-muted m-0'
                            dangerouslySetInnerHTML={createMarkup(
                              chapter.target
                            )}
                          />
                          {/* Chapter Info - Teacher and Classes */}
                          <div className='mt-2'>
                            <div className='d-flex align-items-center mb-1'>
                              <i className='bi bi-person me-2 text-primary'></i>
                              <small className='text-muted me-2'>
                                Pengajar:
                              </small>
                              <span className='fw-medium'>
                                {chapter.teacher_name || "Tidak ada data"}
                              </span>
                            </div>
                            <div className='d-flex align-items-center'>
                              <i className='bi bi-people me-2 text-primary'></i>
                              <small className='text-muted me-2'>Kelas:</small>
                              <div className='d-flex flex-wrap gap-1'>
                                {chapter.classes &&
                                chapter.classes.length > 0 ? (
                                  chapter.classes.map((cls, idx) => (
                                    <span
                                      key={idx}
                                      className='badge bg-primary me-1'
                                    >
                                      {cls.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className='text-muted'>
                                    Tidak ada data
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </h2>
                  <div
                    id={`collapse${chapter.id}`}
                    className={`accordion-collapse collapse ${
                      index === 0 ? "show" : ""
                    }`}
                    aria-labelledby={`heading${chapter.id}`}
                    data-bs-parent='#chaptersAccordion'
                  >
                    <div className='accordion-body'>
                      {/* Content Items */}
                      {chapter.contents?.map((content) => (
                        <div key={content.id} className='card mb-3'>
                          <div className='card-header bg-light'>
                            <div className='d-flex align-items-center'>
                              <i className='bi bi-book me-2 text-primary'></i>
                              <div>
                                <div className='fw-bold'>{content.title}</div>
                                <small
                                  className='text-muted m-0'
                                  dangerouslySetInnerHTML={createMarkup(
                                    content.target
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <div className='card-body'>
                            {/* Files */}
                            {content.files?.length > 0 ? (
                              <div className='list-group'>
                                {content.files.map((file) => (
                                  <a
                                    key={file.id}
                                    href={`${window.location.origin}${file.file}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='list-group-item list-group-item-action d-flex align-items-center'
                                  >
                                    {file.video ? (
                                      <i className='bi bi-camera-video me-2 text-danger'></i>
                                    ) : (
                                      <i className='bi bi-file-earmark-text me-2 text-primary'></i>
                                    )}
                                    <div>
                                      <div>{file.title || "File Materi"}</div>
                                      <small className='text-muted m-0'>
                                        {file.video
                                          ? "Video Pembelajaran"
                                          : "Dokumen Materi"}
                                      </small>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className='text-muted mb-0'>
                                Tidak ada file materi
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                      {(!chapter.contents || chapter.contents.length === 0) && (
                        <div className='alert alert-light'>
                          <i className='bi bi-info-circle me-2'></i>
                          Tidak ada konten pembelajaran
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(!subject.chapters || subject.chapters.length === 0) && (
              <div className='alert alert-info'>
                <i className='bi bi-info-circle me-2'></i>
                Belum ada bab pembelajaran untuk mata pelajaran ini.
              </div>
            )}
          </>
        ) : (
          <div className='alert alert-warning'>
            <i className='bi bi-exclamation-triangle me-2'></i>
            Data mata pelajaran tidak ditemukan.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Subject;
