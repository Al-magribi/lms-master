import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { useGetExamScoreListQuery } from "../../../../controller/api/cbt/ApiAnswer";
import Table from "../../../../components/table/Table";

const ScoreList = forwardRef(({ examid, classid }, ref) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const tableRef = useRef();
  const {
    data = {},
    isLoading,
    error,
    refetch,
  } = useGetExamScoreListQuery(
    { exam: examid, classid, page, limit, search },
    {
      skip: !examid,
    }
  );

  useImperativeHandle(ref, () => ({
    refetch,
    getTableElement: () => tableRef.current,
  }));

  const students = data?.students || [];

  return (
    <Table
      isLoading={isLoading}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={data?.totalData}
      totalPages={data?.totalPages}
    >
      <table ref={tableRef} className='mb-0 table table-bordered table-striped'>
        <thead>
          <tr>
            <td colSpan={2} className='text-muted align-middle'>
              {data?.homebase_name}
            </td>
            <td colSpan={2} className='text-muted align-middle'>
              <p className='m-0'>
                {data?.exam_name}{" "}
                <span className='badge bg-success'>{data?.exam_token}</span>
              </p>
            </td>
            <td colSpan={6} className='text-muted align-middle'>
              {data?.teacher_name}
            </td>
          </tr>
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
              Tingkat
            </th>
            <th rowSpan={2} className='text-center align-middle'>
              Kelas
            </th>
            <th colSpan={3} className='text-center align-middle'>
              PG
            </th>
            <th rowSpan={2} className='text-center align-middle'>
              Essay
            </th>
            <th rowSpan={2} className='text-center align-middle'>
              Total
            </th>
          </tr>
          <tr>
            <td className='text-center align-middle'>Benar</td>
            <td className='text-center align-middle'>Salah</td>
            <td className='text-center align-middle'>Total</td>
          </tr>
        </thead>
        <tbody>
          {students?.map((student, index) => (
            <tr key={student?.student_id}>
              <td className='text-center align-middle'>
                {(page - 1) * limit + index + 1}
              </td>
              <td className='text-center align-middle'>
                {student?.student_nis}
              </td>
              <td className='text-center align-middle'>
                {student?.student_name}
              </td>
              <td className='text-center align-middle'>
                {student?.student_grade}
              </td>
              <td className='text-center align-middle'>
                {student?.student_class}
              </td>
              <td className='text-center align-middle'>{student?.correct}</td>
              <td className='text-center align-middle'>{student?.incorrect}</td>
              <td className='text-center align-middle'>{student?.mc_score}</td>
              <td className='text-center align-middle'>
                {student?.essay_score}
              </td>
              <td className='text-center align-middle'>{student?.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Table>
  );
});

export default ScoreList;
