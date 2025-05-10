import { useParams } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import Chapters from "../chapter/Chapters";
import Form from "./Form";
import { useState } from "react";

const LmsSubject = () => {
  const params = useParams();
  const { name, id } = params;

  const formatted = name.replace(/-/g, " ");

  const [detail, setDetail] = useState({});

  return (
    <Layout title={formatted} levels={["admin", "teacher"]}>
      <div className='row g-2'>
        <div className='col-lg-4 col-12'>
          <Form detail={detail} setDetail={setDetail} />
        </div>
        <div className='col-lg-8 col-12'>
          <Chapters setDetail={setDetail} />
        </div>
      </div>
    </Layout>
  );
};

export default LmsSubject;
