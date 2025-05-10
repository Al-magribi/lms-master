import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Body from "./Body";
import { useSelector } from "react-redux";
import { useGetExamAndQuestionsQuery } from "../../../../controller/api/cbt/ApiExam";
import { useFinishCbtMutation } from "../../../../controller/api/log/ApiLog";
import Meta from "../../../../components/meta/Meta";
import { toast } from "react-hot-toast";
import { useGetUserLogQuery } from "../../../../controller/api/log/ApiLog";

const StartPage = () => {
  const { name, examid, token } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    data = {},
    refetch,
    isLoading,
    error,
  } = useGetExamAndQuestionsQuery({ examid });
  const { exam, banks, questions } = data;

  const [questionsData, setQuestionsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExamStarted, setIsExamStarted] = useState(false);

  const [finishCbt] = useFinishCbtMutation();

  // Get the log data to calculate remaining time
  const { data: log, error: logError } = useGetUserLogQuery(
    {
      exam: examid,
      student: user.user_id,
    },
    { skip: !examid || !user.user_id }
  );

  // Check if user has access to this exam
  useEffect(() => {
    if (error) {
      toast.error("Anda tidak memiliki akses ke ujian ini");
      navigate("/siswa-daftar-ujian");
    }
  }, [error, navigate]);

  // Check if exam has started
  useEffect(() => {
    if (logError) {
      toast.error("Anda belum memulai ujian ini");
      navigate("/siswa-daftar-ujian");
    }
  }, [logError, navigate]);

  // Calculate remaining time based on log creation time
  useEffect(() => {
    if (log && exam && log.start_time) {
      const startTime = new Date(log.start_time).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const totalDuration = exam.duration * 60; // Convert minutes to seconds
      const remainingSeconds = Math.max(0, totalDuration - elapsedSeconds);

      if (remainingSeconds <= 0) {
        finishExam();
      } else {
        setTimeLeft(remainingSeconds);
        setIsExamStarted(true);
      }
    }
  }, [log, exam]);

  // Timer effect
  useEffect(() => {
    if (!isExamStarted || !timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, timeLeft]);

  const handleNextQuestion = () => {
    if (currentPage < questionsData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleQuestionNumberClick = (index) => {
    setCurrentPage(index + 1);
  };

  const handleReset = () => {
    localStorage.removeItem("questions");
    refetch();

    if (questions && Array.isArray(questions)) {
      localStorage.setItem("questions", JSON.stringify({ questions }));
      setQuestionsData(questions);
    }
  };

  const finishExam = async () => {
    toast.promise(finishCbt({ id: log.id, exam: examid }).unwrap(), {
      loading: "Submitting exam...",
      success: (data) => {
        toast.success("Exam submitted successfully");
        navigate("/siswa-daftar-ujian");
        return data.message || "Exam submitted successfully";
      },
      error: (err) =>
        `Failed to submit exam: ${err.data?.message || err.message}`,
    });
  };

  // Load questions effect
  useEffect(() => {
    if (!questions) return;

    const storedQuestions = localStorage.getItem("questions");

    if (storedQuestions) {
      try {
        const parsedQuestions = JSON.parse(storedQuestions);
        if (Array.isArray(parsedQuestions.questions)) {
          setQuestionsData(parsedQuestions.questions);
        } else {
          setQuestionsData([]);
        }
      } catch (error) {
        console.error("Error parsing stored questions:", error);
        setQuestionsData([]);
      }
    } else {
      if (questions && Array.isArray(questions)) {
        localStorage.setItem("questions", JSON.stringify({ questions }));
        setQuestionsData(questions);
      }
    }
  }, [questions]);

  if (isLoading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ height: "100vh" }}>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }} className='bg-light'>
      <Meta title={`Pertanyaan No ${currentPage}`} />
      <Header
        name={name}
        user={user}
        examid={examid}
        timeLeft={timeLeft}
        isExamStarted={isExamStarted}
      />

      <Body
        questionsData={questionsData}
        currentPage={currentPage}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
        onQuestionNumberClick={handleQuestionNumberClick}
        onReset={handleReset}
        onFinish={finishExam}
      />
    </div>
  );
};

export default StartPage;
