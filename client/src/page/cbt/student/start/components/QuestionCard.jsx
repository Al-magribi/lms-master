import React from "react";

const createHtml = (html) => {
  return { __html: html };
};

const QuestionCard = ({ question }) => {
  return (
    <div className='card'>
      <div className='card-body'>
        <p
          className='card-text'
          dangerouslySetInnerHTML={createHtml(question)}
        />
      </div>
    </div>
  );
};

export default QuestionCard;
