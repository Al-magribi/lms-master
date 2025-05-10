import React from "react";

const Navigation = ({
  currentPage,
  questionsLength,
  isLoading,
  onPrevious,
  onNext,
  onReset,
  onFinish,
  questionsData,
  answers,
}) => {
  // Check if all questions are answered
  const isAllAnswered = () => {
    return questionsData.every((question) => {
      const savedAnswer = answers[question.id];
      return question.qtype === 2
        ? Boolean(savedAnswer?.essay && savedAnswer.essay.trim() !== "")
        : Boolean(savedAnswer?.mc);
    });
  };

  return (
    <div className='d-flex justify-content-between mb-2'>
      <div className='btn-group'>
        <button
          className='btn btn-sm btn-primary'
          onClick={onPrevious}
          disabled={currentPage === 1 || isLoading}>
          <i className='bi bi-chevron-double-left'></i>
        </button>

        <button className='btn btn-sm btn-outline-primary' disabled={true}>
          {`Pertanyaan No ${currentPage}`}
        </button>

        <button
          className='btn btn-sm btn-primary'
          onClick={onNext}
          disabled={currentPage === questionsLength || isLoading}>
          <i className='bi bi-chevron-double-right'></i>
        </button>
      </div>

      <div className='btn-group'>
        <button
          className='btn btn-sm btn-warning'
          onClick={onReset}
          disabled={isLoading}>
          <i className='bi bi-recycle'></i> Sync
        </button>
        <button
          className='btn btn-sm btn-danger'
          onClick={onFinish}
          disabled={!isAllAnswered()}
          title={
            !isAllAnswered()
              ? "Semua pertanyaan harus dijawab"
              : "Selesaikan ujian"
          }>
          <i className='bi bi-check-circle'></i> Selesaikan Ujian
        </button>
      </div>
    </div>
  );
};

export default Navigation;
