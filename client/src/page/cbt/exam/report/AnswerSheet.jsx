import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useGetStudentAnswerQuery,
  useGradeEssayMutation,
} from "../../../../controller/api/cbt/ApiAnswer";
import { printAnswerSheet } from "./printAnswerSheet";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import ScoreSummary from "./components/ScoreSummary";
import StudentInfo from "./components/StudentInfo";
import AnswerItem from "./components/AnswerItem";

const AnswerSheet = ({ detail }) => {
  const { examid, name } = useParams();
  const [isPrintReady, setIsPrintReady] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const isTeacherOrAdmin = user?.level === "teacher" || user?.level === "admin";
  const [gradingAnswers, setGradingAnswers] = useState({});

  const { data, isLoading, isError, error, refetch } = useGetStudentAnswerQuery(
    {
      student: detail.student_id,
      exam: examid,
    },
    {
      skip: !detail.student_id,
    }
  );

  const [gradeEssay, { isLoading: isGrading }] = useGradeEssayMutation();

  const studentData = data?.[0];

  useEffect(() => {
    if (studentData) {
      setIsPrintReady(true);
    }
  }, [studentData]);

  const handlePrint = () => {
    if (!studentData) return;
    printAnswerSheet(studentData, name, detail);
  };

  const handleGradeEssay = async (answerId, maxPoint) => {
    const point = gradingAnswers[answerId];

    if (point === undefined || point === "") {
      toast.error("Nilai tidak boleh kosong");
      return;
    }

    if (point < 0 || point > maxPoint) {
      toast.error(`Nilai harus antara 0 dan ${maxPoint}`);
      return;
    }

    try {
      await gradeEssay({
        answer_id: answerId,
        point: parseInt(point),
      }).unwrap();
      toast.success("Nilai berhasil disimpan");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Gagal menyimpan nilai");
    }
  };

  return (
    <div
      className='modal fade'
      id='answerSheet'
      data-bs-backdrop='static'
      data-bs-keyboard='false'
      tabIndex='-1'
      aria-labelledby='staticBackdropLabel'
      aria-hidden='true'
    >
      <div className='modal-dialog modal-lg modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <div
              className='modal-title d-flex flex-column justify-content-end align-items-start'
              id='staticBackdropLabel'
            >
              <p className='m-0 h5'>{name?.replace(/-/g, " ")}</p>
              <small className='text-muted'>
                {detail?.nis} - {detail?.student_name}
              </small>
            </div>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'
            ></button>
          </div>
          <div className='modal-body'>
            {isLoading ? (
              <p>Loading...</p>
            ) : isError ? (
              <div className='alert alert-danger' role='alert'>
                Gagal memuat data jawaban:{" "}
                {error?.data?.message || error.message}
              </div>
            ) : studentData ? (
              <>
                <ScoreSummary studentData={studentData} />
                <StudentInfo studentData={studentData} name={name} />
                {studentData.answers && studentData.answers.length > 0 ? (
                  studentData.answers.map((answer, index) => (
                    <AnswerItem
                      key={answer.question_id}
                      answer={answer}
                      index={index}
                      isTeacherOrAdmin={isTeacherOrAdmin}
                      gradingAnswers={gradingAnswers}
                      setGradingAnswers={setGradingAnswers}
                      handleGradeEssay={handleGradeEssay}
                      isGrading={isGrading}
                    />
                  ))
                ) : (
                  <div className='alert alert-info mt-3' role='alert'>
                    Tidak ada data jawaban untuk siswa ini.
                  </div>
                )}
              </>
            ) : (
              <div className='alert alert-warning' role='alert'>
                Data siswa tidak ditemukan.
              </div>
            )}
          </div>
          <div className='modal-footer'>
            <button
              type='button'
              className='btn btn-sm btn-secondary'
              data-bs-dismiss='modal'
            >
              Tutup
            </button>

            <button
              type='button'
              className='btn btn-sm btn-danger'
              onClick={refetch}
            >
              <i className='bi bi-repeat'></i>
            </button>

            <button
              type='button'
              className='btn btn-sm btn-primary'
              onClick={handlePrint}
            >
              <i className='bi bi-printer'></i> Cetak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerSheet;
