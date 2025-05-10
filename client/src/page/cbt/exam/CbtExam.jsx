import { useState } from "react";
import Form from "./Form";
import TableExam from "./TableExam";

const CbtExam = () => {
  const [detail, setDetail] = useState(null);

  const handleEdit = (exam) => {
    setDetail(exam);
  };

  return (
    <div className="row g-2">
      <div className="col-12">
        <TableExam setDetail={handleEdit} />
      </div>

      <Form detail={detail} setDetail={setDetail} />
    </div>
  );
};

export default CbtExam;
