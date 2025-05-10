import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsDataTable from "../components/CmsDataTable";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import { FaGraduationCap, FaEdit, FaTrash } from "react-icons/fa";

const GraduationPage = () => {
  const [graduations, setGraduations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedGraduation, setSelectedGraduation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGraduations([
        {
          id: 1,
          year: 2023,
          totalStudents: 120,
          description: "Graduation ceremony for the class of 2023",
          date: "2023-06-15",
          image: "graduation2023.jpg",
        },
        {
          id: 2,
          year: 2022,
          totalStudents: 115,
          description: "Graduation ceremony for the class of 2022",
          date: "2022-06-10",
          image: "graduation2022.jpg",
        },
        {
          id: 3,
          year: 2021,
          totalStudents: 110,
          description: "Graduation ceremony for the class of 2021",
          date: "2021-06-12",
          image: "graduation2021.jpg",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      header: "Year",
      accessor: "year",
    },
    {
      header: "Total Students",
      accessor: "totalStudents",
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.id)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setModalType("add");
    setSelectedGraduation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (graduation) => {
    setModalType("edit");
    setSelectedGraduation(graduation);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this graduation record?")
    ) {
      // In a real app, you would call an API here
      setGraduations(graduations.filter((graduation) => graduation.id !== id));
    }
  };

  const handleSubmit = (formData) => {
    if (modalType === "add") {
      // In a real app, you would call an API here
      const newGraduation = {
        id: graduations.length + 1,
        ...formData,
      };
      setGraduations([...graduations, newGraduation]);
    } else {
      // In a real app, you would call an API here
      setGraduations(
        graduations.map((graduation) =>
          graduation.id === selectedGraduation.id
            ? { ...graduation, ...formData }
            : graduation
        )
      );
    }
    setIsModalOpen(false);
  };

  const formFields = [
    {
      name: "year",
      label: "Year",
      type: "number",
      required: true,
    },
    {
      name: "totalStudents",
      label: "Total Students",
      type: "number",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
    },
    {
      name: "image",
      label: "Image URL",
      type: "text",
      required: true,
    },
  ];

  return (
    <Layout>
      <div className="container-fluid py-3 py-md-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <FaGraduationCap className="text-primary fs-4" />
              </div>
              <h4 className="mb-0">Graduation</h4>
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add New Graduation
            </button>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <CmsDataTable
                columns={columns}
                data={graduations}
                isLoading={isLoading}
                noDataMessage="No graduation records found"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <CmsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "add" ? "Add New Graduation" : "Edit Graduation"}
      >
        <CmsForm
          fields={formFields}
          initialValues={selectedGraduation}
          onSubmit={handleSubmit}
          submitButtonText={
            modalType === "add" ? "Add Graduation" : "Update Graduation"
          }
        />
      </CmsModal>
    </Layout>
  );
};

export default GraduationPage;
