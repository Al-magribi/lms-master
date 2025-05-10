import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Form from "./Form";
import TableData from "./TableData";

const CenterAdmin = () => {
  return (
    <Layout title={"Administrator"} levels={["center"]}>
      <div className="row g-2">
        <div className="col-lg-3 col-12">
          <Form />
        </div>
        <div className="col-lg-9 col-12">
          <TableData />
        </div>
      </div>
    </Layout>
  );
};

export default CenterAdmin;
