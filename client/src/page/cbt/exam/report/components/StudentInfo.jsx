import React from "react";

const StudentInfo = ({ studentData, name }) => {
  return (
    <div className='card mb-3'>
      <div className='card-body'>
        <h5 className='card-title mb-3'>Lembar Jawaban</h5>
        <table className='table table-sm table-borderless mb-0'>
          <tbody>
            <tr>
              <td>
                <strong>NIS</strong>
              </td>
              <td>: {studentData.student_nis}</td>
              <td>
                <strong>Tingkat</strong>
              </td>
              <td>: {studentData.student_grade}</td>
              <td>
                <strong>Ujian</strong>
              </td>
              <td>: {name.replace(/-/g, " ")}</td>
            </tr>
            <tr>
              <td>
                <strong>Nama</strong>
              </td>
              <td>: {studentData.student_name}</td>
              <td>
                <strong>Kelas</strong>
              </td>
              <td>: {studentData.student_class}</td>
              <td>
                <strong>Tanggal</strong>
              </td>
              <td>
                :{" "}
                {studentData.log_exam
                  ? new Date(studentData.log_exam).toLocaleString("id-ID", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentInfo;
