import React from "react";
import Layout from "../../../components/layout/Layout";
import ListSubjects from "../../lms/list/ListSubjects";

const StudentSubject = () => {
  return (
    <Layout title={"Daftar Pelajaran"} levels={["student"]}>
      <ListSubjects />
    </Layout>
  );
};

export default StudentSubject;
