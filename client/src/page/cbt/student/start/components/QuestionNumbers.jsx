import React from "react";

const QuestionNumbers = ({
  questionsData,
  currentPage,
  answers,
  isLoading,
  onQuestionNumberClick,
}) => {
  return (
    <div className='card'>
      <div className='card-body'>
        <div className='d-flex justify-content-center flex-wrap gap-2'>
          {questionsData.map((question, index) => {
            const questionId = question?.id;
            const savedAnswer = answers[questionId];

            // Improved check for answered questions
            const isAnswered =
              question.qtype === 2
                ? Boolean(savedAnswer?.essay && savedAnswer.essay.trim() !== "")
                : Boolean(savedAnswer?.mc && savedAnswer.mc !== "");

            return (
              <button
                key={index}
                className={`btn btn-sm ${
                  currentPage === index + 1
                    ? "btn-primary"
                    : isAnswered
                    ? "btn-danger"
                    : "btn-outline-primary"
                }`}
                onClick={() => onQuestionNumberClick(index)}
                disabled={isLoading}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionNumbers;
