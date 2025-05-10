import Layout from "../../../components/layout/Layout";
import CbtExam from "../../cbt/exam/CbtExam";

const TeacherExam = () => {
  return (
    <Layout title={"Daftar Ujian"} levels={["teacher"]}>
      <CbtExam />
    </Layout>
  );
};

export default TeacherExam;
