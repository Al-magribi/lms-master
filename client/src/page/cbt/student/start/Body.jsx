import React, { useEffect, useState } from "react";
import {
  useAddAnswerMutation,
  useGetStudentAnswerQuery,
} from "../../../../controller/api/cbt/ApiAnswer";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";

// Import Components
import Navigation from "./components/Navigation";
import QuestionCard from "./components/QuestionCard";
import AnswerCard from "./components/AnswerCard";
import QuestionNumbers from "./components/QuestionNumbers";

const createHtml = (html) => {
  return { __html: html };
};

const Body = ({
  questionsData,
  currentPage,
  onNext,
  onPrevious,
  onQuestionNumberClick,
  onReset,
  onFinish,
}) => {
  const { examid } = useParams();

  // Get the current question based on currentPage
  const currentQuestion = questionsData[currentPage - 1] || {};

  // ANSWER
  const [essay, setEssay] = useState("");
  const [key, setKey] = useState("");
  const [answers, setAnswers] = useState({});

  const { user } = useSelector((state) => state.auth);
  const { data: answer, isLoading: isLoadingAnswer } = useGetStudentAnswerQuery(
    {
      student: user.user_id,
      exam: examid,
    }
  );
  const [addAnswer, { isLoading, isSuccess, isError, reset }] =
    useAddAnswerMutation();

  console.log(answer);

  // Load saved answers when component mounts
  useEffect(() => {
    if (answer) {
      const savedAnswers = {};
      answer.forEach((ans) => {
        if (ans.question_id) {
          savedAnswers[ans.question_id] = {
            id: ans.id,
            mc: ans.mc || null,
            essay: ans.essay || null,
            point: ans.point || 0,
            qtype: ans.qtype,
          };
        }
      });
      setAnswers(savedAnswers);
      // Set initial key if there's an answer for current question
      if (currentQuestion && savedAnswers[currentQuestion.id]?.mc) {
        setKey(savedAnswers[currentQuestion.id].mc);
      }
    }
  }, [answer, currentQuestion]);

  // Update key when changing questions
  useEffect(() => {
    if (currentQuestion && answers[currentQuestion.id]) {
      if (currentQuestion.qtype === 2) {
        setEssay(answers[currentQuestion.id].essay || "");
      } else {
        setKey(answers[currentQuestion.id].mc || "");
      }
    } else {
      setKey("");
      setEssay("");
    }
  }, [currentQuestion, answers]);

  const handleSubmit = async (selectedKey = null) => {
    if (!currentQuestion) return;

    // For essay questions, use the essay state value
    // For multiple choice, use the selected key
    const answerValue = currentQuestion.qtype === 2 ? essay : selectedKey;

    const data = {
      id: answers[currentQuestion.id]?.id || null,
      student: user.user_id,
      exam: examid,
      question: currentQuestion.id,
      mc: currentQuestion.qtype === 2 ? null : answerValue,
      essay: currentQuestion.qtype === 2 ? answerValue : null,
    };

    toast.promise(
      addAnswer(data)
        .unwrap()
        .then((res) => {
          // Update the answer ID in the local state
          if (res.id) {
            setAnswers((prev) => ({
              ...prev,
              [currentQuestion.id]: {
                ...prev[currentQuestion.id],
                id: res.id,
                mc: currentQuestion.qtype === 2 ? null : answerValue,
                essay: currentQuestion.qtype === 2 ? answerValue : null,
              },
            }));
          }
          return res.message;
        }),
      {
        loading: "Meyimpan data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  // Auto-save answer when moving to next question
  const handleNext = async () => {
    if (currentQuestion.qtype === 2 && essay) {
      await handleSubmit();
    }
    onNext();
  };

  const handlePrevious = async () => {
    if (currentQuestion.qtype === 2 && essay) {
      await handleSubmit();
    }
    onPrevious();
  };

  useEffect(() => {
    if (isError) {
      reset();
    }

    if (isSuccess) {
      reset();
    }
  }, [isError, reset, isSuccess]);

  return (
    <div className='container-fluid mt-2'>
      <Navigation
        currentPage={currentPage}
        questionsLength={questionsData.length}
        isLoading={isLoading}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onReset={onReset}
        onFinish={onFinish}
        questionsData={questionsData}
        answers={answers}
      />

      <div className='row g-2'>
        {/* Question Column */}
        <div className='col-lg-5 col-12'>
          <QuestionCard question={currentQuestion.question} />
        </div>

        {/* Answer Column */}
        <div className='col-lg-5 col-12'>
          <AnswerCard
            currentQuestion={currentQuestion}
            answers={answers}
            essay={essay}
            setEssay={setEssay}
            currentPage={currentPage}
            handleSubmit={handleSubmit}
            isLoadingAnswer={isLoadingAnswer}
          />
        </div>

        {/* Question Numbers Column */}
        <div className='col-lg-2 col-12'>
          <QuestionNumbers
            questionsData={questionsData}
            currentPage={currentPage}
            answers={answers}
            isLoading={isLoading}
            onQuestionNumberClick={onQuestionNumberClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Body;
