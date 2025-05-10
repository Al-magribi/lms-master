import React from "react";

const ScoreSummary = ({ studentData }) => {
  return (
    <div className='card mb-3'>
      <div className='card-body'>
        <h5 className='card-title mb-3'>Ringkasan Nilai</h5>
        <div className='row'>
          <div className='col-md-4'>
            <div className='d-flex justify-content-between mb-2'>
              <span>Jawaban Benar:</span>
              <span className='badge bg-success'>{studentData.correct}</span>
            </div>
            <div className='d-flex justify-content-between mb-2'>
              <span>Jawaban Salah:</span>
              <span className='badge bg-danger'>{studentData.incorrect}</span>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='d-flex justify-content-between mb-2'>
              <span>Nilai PG:</span>
              <span className='badge bg-primary'>{studentData.pg_score}</span>
            </div>
            <div className='d-flex justify-content-between mb-2'>
              <span>Nilai Essay:</span>
              <span className='badge bg-info'>{studentData.essay_score}</span>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='d-flex justify-content-between mb-2'>
              <span>Total Nilai:</span>
              <span className='badge bg-success fs-5'>{studentData.score}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreSummary;
