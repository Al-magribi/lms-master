import React, { useState, useRef } from "react";
import Layout from "../../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import Filters from "./Filters";
import TableData from "./TableData";
import ScoreChart from "./ScoreChart";
import ScoreList from "./ScoreList";
import Analysis from "./Anslysis";
import * as XLSX from "xlsx";

const ExamReport = () => {
  const { name, examid, token } = useParams();
  const [classid, setClassid] = useState("");
  const [activeView, setActiveView] = useState("table");
  const tableRef = useRef();
  const chartRef = useRef();
  const listRef = useRef();
  const analysisRef = useRef();

  const handleRefetch = () => {
    // Refetch all components
    tableRef.current?.refetch();
    chartRef.current?.refetch();
    listRef.current?.refetch();
  };

  const convertToExcel = () => {
    if (activeView === "table" && tableRef.current) {
      const workbook = XLSX.utils.book_new();
      const table = tableRef.current.getTableElement();
      const tableData = XLSX.utils.table_to_sheet(table);

      XLSX.utils.book_append_sheet(workbook, tableData, "Sheet1");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `Log_${name}.xlsx`;

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(data, fileName);
      } else {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(data);
        link.download = fileName;
        link.click();
      }
    } else if (activeView === "list" && listRef.current) {
      const workbook = XLSX.utils.book_new();
      const table = listRef.current.getTableElement();
      const tableData = XLSX.utils.table_to_sheet(table);

      XLSX.utils.book_append_sheet(workbook, tableData, "Sheet1");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `Nilai_${name}.xlsx`;

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(data, fileName);
      } else {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(data);
        link.download = fileName;
        link.click();
      }
    } else if (activeView === "analysis" && analysisRef.current) {
      const workbook = XLSX.utils.book_new();
      const table = analysisRef.current.getTableElement();
      const tableData = XLSX.utils.table_to_sheet(table);

      XLSX.utils.book_append_sheet(workbook, tableData, "Sheet1");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `Analisis_${name}.xlsx`;

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(data, fileName);
      } else {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(data);
        link.download = fileName;
        link.click();
      }
    }
  };

  return (
    <Layout title={`${name.replace(/-/g, " ")}`} levels={["admin", "teacher"]}>
      <Filters
        classid={classid}
        setClassid={setClassid}
        examid={examid}
        name={name}
        token={token}
        onRefetch={handleRefetch}
        activeView={activeView}
        setActiveView={setActiveView}
        onExport={convertToExcel}
      />
      <div className="mt-3">
        {activeView === "table" && (
          <TableData ref={tableRef} examid={examid} classid={classid} />
        )}
        {activeView === "chart" && (
          <ScoreChart ref={chartRef} examid={examid} classid={classid} />
        )}
        {activeView === "list" && (
          <ScoreList ref={listRef} examid={examid} classid={classid} />
        )}
        {activeView === "analysis" && (
          <Analysis ref={analysisRef} examid={examid} classid={classid} />
        )}
      </div>
    </Layout>
  );
};

export default ExamReport;
