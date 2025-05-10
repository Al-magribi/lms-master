import React from "react";
import Layout from "../../../components/layout/Layout";
import ExamList from "../../cbt/student/ExamList";
import { useSelector } from "react-redux";

const StudentCbt = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <Layout title={"Daftar Ujian Saya"} levels={["student"]}>
      <ExamList classid={user.class_id} />
    </Layout>
  );
};

export default StudentCbt;
