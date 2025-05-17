import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { useGetExamAnalysisQuery } from "../../../../controller/api/cbt/ApiAnswer";
import Table from "../../../../components/table/Table";

const Anslysis = forwardRef(({ examid, classid }, ref) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const tableRef = useRef();

  const { data, isLoading, error, refetch } = useGetExamAnalysisQuery({
    exam: examid,
    classid,
    page,
    limit,
    search,
  });

  useImperativeHandle(ref, () => ({
    refetch,
    getTableElement: () => tableRef.current,
  }));

  const questions = data?.questions || [];
  const students = data?.students || [];

  console.log(questions.length);

  return (
    <Table
      isLoading={isLoading}
      page={page}
      setPage={setPage}
      totalPages={data?.totalPages}
      totalData={data?.totalData}
      limit={limit}
      setLimit={setLimit}
      setSearch={setSearch}>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          ref={tableRef}
          className='mb-0 table table-bordered table-striped table-hover'
          style={{ minWidth: "100%" }}>
          <thead>
            <tr>
              <th rowSpan={2} className='text-center align-middle'>
                No
              </th>
              <th rowSpan={2} className='text-center align-middle'>
                NIS
              </th>
              <th rowSpan={2} className='text-center align-middle'>
                Nama
              </th>
              <th rowSpan={2} className='text-center align-middle'>
                Kelas
              </th>
              <th
                colSpan={questions.length}
                className='text-center align-middle'>
                Jawaban
              </th>
              <th rowSpan={2} className='text-center align-middle'>
                Benar
              </th>
              <th rowSpan={2} className='text-center align-middle'>
                Salah
              </th>
              <th rowSpan={2} className='text-center align-middle'>
                Nilai
              </th>
            </tr>
            <tr>
              {questions.map((question) => (
                <th key={question.id} className='text-center'>
                  {question.qkey}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students?.map((student, index) => (
                <React.Fragment key={student.id}>
                  <tr>
                    <td className='text-center align-middle' rowSpan={2}>
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className='text-center align-middle' rowSpan={2}>
                      {student.nis}
                    </td>
                    <td className='align-middle' rowSpan={2}>
                      {student.name}
                    </td>
                    <td className='text-center align-middle' rowSpan={2}>
                      {student.class}
                    </td>
                    {questions.map((question) => {
                      const answer = student?.answers?.find(
                        (ans) => ans.id === question.id
                      );
                      const isCorrect =
                        answer?.mc &&
                        question.qkey &&
                        answer.mc.toUpperCase() === question.qkey.toUpperCase();
                      return (
                        <td
                          key={question.id}
                          className='text-center align-middle'>
                          <div>
                            {answer?.mc ? answer.mc.toUpperCase() : "-"}
                          </div>
                        </td>
                      );
                    })}
                    <td className='text-center align-middle' rowSpan={2}>
                      {student.correct}
                    </td>
                    <td className='text-center align-middle' rowSpan={2}>
                      {student.incorrect}
                    </td>
                    <td className='text-center align-middle' rowSpan={2}>
                      {student.mc_score}
                    </td>
                  </tr>
                  <tr>
                    {questions.map((question) => {
                      const answer = student?.answers?.find(
                        (ans) => ans.id === question.id
                      );
                      const isCorrect =
                        answer?.mc &&
                        question.qkey &&
                        answer.mc.toUpperCase() === question.qkey.toUpperCase();
                      return (
                        <td
                          key={question.id + "-poin"}
                          className='text-center align-middle'
                          style={{
                            color: isCorrect ? "green" : "red",
                          }}>
                          {isCorrect ? question.poin : 0}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td>Data belum tersedia</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Table>
  );
});

export default Anslysis;
