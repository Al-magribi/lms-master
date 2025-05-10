import React from "react";

const createHtml = (html) => {
  return { __html: html };
};

const AnswerCard = ({
  currentQuestion,
  answers,
  essay,
  setEssay,
  currentPage,
  handleSubmit,
  isLoadingAnswer,
}) => {
  const renderAnswerOptions = () => {
    if (!currentQuestion) return null;

    // If qtype is 2, show textarea
    if (currentQuestion.qtype === 2) {
      const savedEssay = answers[currentQuestion.id]?.essay || "";
      return (
        <div className='answer-options'>
          <textarea
            className='form-control'
            rows='4'
            placeholder='Ketikkan jawabanmu disini...'
            value={savedEssay || essay}
            onChange={(e) => setEssay(e.target.value)}
            onBlur={() => handleSubmit()}
          ></textarea>
        </div>
      );
    }

    // For other question types, show options
    return (
      <div className='d-flex flex-column gap-2'>
        {currentQuestion.choices &&
          currentQuestion.choices.map((choice, index) => {
            // Improved check for selected answer
            const savedAnswer = answers[currentQuestion.id]?.mc;
            const isSelected = savedAnswer && savedAnswer === choice.key;

            return (
              <div key={index} className='form-check'>
                <input
                  className='form-check-input'
                  type='radio'
                  name={`question-${currentPage}`}
                  id={`option-${choice.key}`}
                  value={choice.key}
                  checked={isSelected}
                  onChange={(e) => handleSubmit(e.target.value)}
                />
                <label
                  className='form-check-label pointer'
                  htmlFor={`option-${choice.key}`}
                >
                  <span dangerouslySetInnerHTML={createHtml(choice.text)} />
                </label>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className='card'>
      <div className='card-body'>
        {isLoadingAnswer ? (
          <div className='text-center'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        ) : (
          renderAnswerOptions()
        )}
      </div>
    </div>
  );
};

export default AnswerCard;
