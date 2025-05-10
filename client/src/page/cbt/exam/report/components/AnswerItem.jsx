import React from "react";

const AnswerItem = ({
  answer,
  index,
  isTeacherOrAdmin,
  gradingAnswers,
  setGradingAnswers,
  handleGradeEssay,
  isGrading,
}) => {
  return (
    <div className='card mb-3'>
      <div className='card-body'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <h6 className='card-title mb-0'>
            <span className='badge bg-primary'>Pertanyaan {index + 1}</span>
          </h6>
          <span
            className={`badge ${answer.point > 0 ? "bg-success" : "bg-danger"}`}
          >
            {answer.point} Poin
          </span>
        </div>
        <p
          className='card-text'
          dangerouslySetInnerHTML={{ __html: answer.question_text }}
        ></p>
        <div className='mt-3'>
          {answer.answer ? (
            <div className='d-flex gap-4'>
              <p
                className={`m-0 badge ${
                  answer.point > 0 ? "bg-success" : "bg-danger"
                }`}
              >
                Jawaban Siswa: <strong>{answer.answer.toUpperCase()}</strong>
              </p>
              <p className='m-0 badge bg-success'>
                Jawaban Benar: <strong>{answer.correct}</strong>
              </p>
            </div>
          ) : (
            <div className='card bg-light'>
              <div className='card-body'>
                <h6 className='card-subtitle mb-2 text-muted'>Jawaban Essay</h6>
                <p className='card-text'>{answer.essay || "-"}</p>

                {isTeacherOrAdmin && (
                  <div className='mt-3'>
                    <div className='d-flex align-items-center gap-2'>
                      <input
                        type='number'
                        className='form-control form-control-sm'
                        style={{ width: "80px" }}
                        placeholder='Nilai'
                        min='0'
                        max={answer.max_point || 100}
                        value={gradingAnswers[answer.id] || ""}
                        onChange={(e) =>
                          setGradingAnswers({
                            ...gradingAnswers,
                            [answer.id]: e.target.value,
                          })
                        }
                      />
                      <button
                        className='btn btn-sm btn-primary'
                        onClick={() =>
                          handleGradeEssay(answer.id, answer.max_point || 100)
                        }
                        disabled={isGrading}
                      >
                        {isGrading ? "Menyimpan..." : "Simpan Nilai"}
                      </button>
                    </div>
                    <small className='text-muted'>
                      Maksimal nilai: {answer.max_point || 100}
                    </small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerItem;
