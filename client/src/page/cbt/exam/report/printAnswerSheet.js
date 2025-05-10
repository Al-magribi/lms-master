/**
 * Utility function to print the answer sheet
 * @param {Object} studentData - The student's answer data
 * @param {String} name - The exam name
 * @param {Object} detail - The student details
 */
export const printAnswerSheet = (studentData, name, detail) => {
  if (!studentData) return;

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups for this website to print.");
    return;
  }

  // Get current date and time for the print header
  const now = new Date();
  const printDateTime = now.toLocaleString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Get current URL
  const currentUrl = window.location.href;

  // Create the content for the print window
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${name?.replace(/-/g, " ")} - ${detail?.student_name}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { 
            padding: 10px; 
            font-size: 12px;
          }
          .card { 
            margin-bottom: 15px; 
            border: 1px solid rgba(0,0,0,.125);
            border-radius: 0.25rem;
          }
          .card-body {
            padding: 1rem;
          }
          .badge { 
            font-size: 0.9em; 
            padding: 0.35em 0.65em;
            border-radius: 0.25rem;
            font-weight: 700;
          }
          .bg-primary {
            background-color: #0d6efd !important;
            color: white;
          }
          .bg-success {
            background-color: #198754 !important;
            color: white;
          }
          .bg-danger {
            background-color: #dc3545 !important;
            color: white;
          }
          .table {
            width: 100%;
            margin-bottom: 1rem;
            color: #212529;
            border-collapse: collapse;
          }
          .table-sm td {
            padding: 0.3rem;
          }
          .table-borderless {
            border: 0;
          }
          .d-flex {
            display: flex !important;
          }
          .justify-content-between {
            justify-content: space-between !important;
          }
          .align-items-center {
            align-items: center !important;
          }
          .gap-4 {
            gap: 1.5rem !important;
          }
          .mt-3 {
            margin-top: 1rem !important;
          }
          .mb-2 {
            margin-bottom: 0.5rem !important;
          }
          .mb-3 {
            margin-bottom: 1rem !important;
          }
          .mb-0 {
            margin-bottom: 0 !important;
          }
          .m-0 {
            margin: 0 !important;
          }
          .text-muted {
            color: #6c757d !important;
          }
          .h5 {
            font-size: 1.25rem;
            margin-top: 0;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          .alert {
            position: relative;
            padding: 0.75rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.25rem;
          }
          .alert-info {
            color: #0c5460;
            background-color: #d1ecf1;
            border-color: #bee5eb;
          }
          .alert-warning {
            color: #856404;
            background-color: #fff3cd;
            border-color: #ffeeba;
          }
          .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
          }
          .print-header {
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 5px;
            margin-bottom: 5px;
            font-size: 10px;
            color: #6c757d;
            display: flex;
            justify-content: space-between;
          }
          .print-header p {
            margin-bottom: 5px;
          }
          .print-footer {
            border-top: 1px solid #dee2e6;
            padding-top: 5px;
            margin-top: 5px;
            font-size: 10px;
            color: #6c757d;
            display: flex;
            justify-content: space-between;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: white;
            padding: 10px 20px;
          }
          .content {
            margin-bottom: 40px; /* Space for footer */
          }
          @media print {
            .no-print { display: none; }
            body { font-size: 12px; }
            .card { page-break-inside: avoid; }
            .print-header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              padding: 10px 20px;
              background-color: white;
              z-index: 1000;
            }
            .content {
              margin-top: 40px;
              margin-bottom: 40px;
            }
            @page {
              margin-top: 60px;
              margin-bottom: 60px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container-fluid">
          <div class="print-header">
            <p>${currentUrl}</p>
          </div>
          
          <div class="content">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-3">Lembar Jawaban</h5>
                <table class="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td><strong>NIS</strong></td>
                      <td>: ${studentData.student_nis}</td>
                      <td><strong>Tingkat</strong></td>
                      <td>: ${studentData.student_grade}</td>
                      <td><strong>Ujian</strong></td>
                      <td>: ${name.replace(/-/g, " ")}</td>
                    </tr>
                    <tr>
                      <td><strong>Nama</strong></td>
                      <td>: ${studentData.student_name}</td>
                      <td><strong>Kelas</strong></td>
                      <td>: ${studentData.student_class}</td>
                      <td><strong>Tanggal</strong></td>
                      <td>: ${
                        studentData.log_exam
                          ? new Date(studentData.log_exam).toLocaleString(
                              "id-ID",
                              {
                                weekday: "long",
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            )
                          : "-"
                      }</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Score Summary Card -->
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-3">Ringkasan Nilai</h5>
                <div class="row">
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between mb-2">
                      <span>Jawaban Benar:</span>
                      <span class="badge bg-success">${
                        studentData.correct
                      }</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Jawaban Salah:</span>
                      <span class="badge bg-danger">${
                        studentData.incorrect
                      }</span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between mb-2">
                      <span>Nilai PG:</span>
                      <span class="badge bg-primary">${
                        studentData.pg_score
                      }</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Nilai Essay:</span>
                      <span class="badge bg-info">${
                        studentData.essay_score
                      }</span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between mb-2">
                      <span>Total Nilai:</span>
                      <span class="badge bg-success fs-5">${
                        studentData.score
                      }</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            ${
              studentData.answers && studentData.answers.length > 0
                ? studentData.answers
                    .map(
                      (answer, index) => `
                <div class="card mb-3">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="card-title mb-0">
                        <span class="badge bg-primary">Pertanyaan ${
                          index + 1
                        }</span>
                      </h6>
                      <span class="badge ${
                        answer.point > 0 ? "bg-success" : "bg-danger"
                      }">
                        ${answer.point} Poin
                      </span>
                    </div>
                    <div class="card-text">${answer.question_text}</div>
                    <div class="mt-3 d-flex gap-4">
                      <p class="m-0 badge ${
                        answer.point > 0 ? "bg-success" : "bg-danger"
                      }">
                        Jawaban Siswa: <strong>${
                          answer.answer?.toUpperCase() || "-"
                        }</strong>
                      </p>
                      <p class="m-0 badge bg-success">
                        Jawaban Benar: <strong>${answer.correct}</strong>
                      </p>
                    </div>
                    ${
                      answer.essay
                        ? `
                    <div class="mt-3">
                      <div class="card bg-light">
                        <div class="card-body">
                          <h6 class="card-subtitle mb-2 text-muted">Jawaban Essay</h6>
                          <p class="card-text">${answer.essay}</p>
                          <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-info">Nilai: ${answer.point}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    `
                        : ""
                    }
                  </div>
                </div>
              `
                    )
                    .join("")
                : '<div class="alert alert-info mt-3">Tidak ada data jawaban untuk siswa ini.</div>'
            }
            
            <div class="no-print text-center mt-4">
              <button class="btn btn-primary" onclick="window.print()">Cetak</button>
            </div>
          </div>
          
          <div class="print-footer">
            <div>${printDateTime}</div>
            <div>Halaman <span class="pageNumber"></span></div>
          </div>
        </div>
        
        <script>
          // Add page numbers when printing
          window.onbeforeprint = function() {
            const pages = document.querySelectorAll('.pageNumber');
            for (let i = 0; i < pages.length; i++) {
              pages[i].textContent = (i + 1).toString();
            }
          };
        </script>
      </body>
    </html>
  `;

  // Write the content to the new window
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();

  // Wait for resources to load before printing
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    // Optional: close the window after printing
    // printWindow.close();
  };
};
