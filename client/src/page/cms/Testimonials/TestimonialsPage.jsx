import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import * as FaIcons from "react-icons/fa";
import {
  useGetTestimoniesQuery,
  useAddTestimonyMutation,
  useDeleteTestimonyMutation,
} from "../../../controller/api/cms/ApiTestimoni";
import { toast } from "react-hot-toast";
import Table from "../../../components/table/Table";

const TestimonialsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [formKey, setFormKey] = useState(0);

  const { data, isLoading, refetch } = useGetTestimoniesQuery({
    page,
    limit,
    search,
  });
  const { results: testimonials, totalData, totalPage } = data || {};

  const [
    addTestimony,
    { isSuccess, error, isLoading: addLoading, data: msg, reset },
  ] = useAddTestimonyMutation();
  const [deleteTestimony] = useDeleteTestimonyMutation();

  const handleAdd = () => {
    setModalType("add");
    setSelectedTestimonial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial) => {
    setModalType("edit");
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah anda yakin ingin menghapus testimoni ini?")) {
      try {
        await deleteTestimony(id).unwrap();
        toast.success("Testimoni berhasil dihapus");
        refetch();
      } catch (error) {
        toast.error(error.data?.message || "Gagal menghapus testimoni");
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await addTestimony(formData).unwrap();
    } catch (error) {
      console.log(error);
      toast.error(error.data?.message || "Gagal menyimpan testimoni");
    }
  };

  const handleCancel = () => {
    setSelectedTestimonial(null);
    setIsModalOpen(false);
    setFormKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(msg.message);
      setIsModalOpen(false);
      refetch();
      setSelectedTestimonial(null);
      setFormKey((prev) => prev + 1);
      reset();
    }
    if (error) {
      toast.error(error.data?.message);
      reset();
    }
  }, [isSuccess, error, msg, reset, refetch]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
    setFormKey((prev) => prev + 1);
  };

  const formFields = [
    {
      name: "name",
      label: "Nama",
      type: "text",
      required: true,
      placeholder: "Masukkan nama",
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "text",
      required: true,
      placeholder: "Masukkan deskripsi",
    },
    {
      name: "testimonial",
      label: "Testimoni",
      type: "textarea",
      required: true,
      placeholder: "Masukkan testimoni",
    },
  ];

  return (
    <Layout title="Testimoni" levels={["cms"]}>
      <div className="container-fluid py-3 py-md-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <FaIcons.FaComments className="text-primary fs-4" />
              </div>
              <h4 className="mb-0">Testimoni</h4>
            </div>
            <button className="btn btn-sm btn-primary" onClick={handleAdd}>
              <i className="bi bi-plus-circle"></i>
              <span className="ms-2">Tambah Testimoni</span>
            </button>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <Table
                isLoading={isLoading}
                page={page}
                setPage={setPage}
                totalPages={totalPage}
                limit={limit}
                setLimit={setLimit}
                setSearch={setSearch}
                totalData={totalData}
              >
                <table className="mb-0 table table-bordered table-striped table-hover">
                  <thead>
                    <tr>
                      <th className="text-center align-middle">No</th>
                      <th className="text-center align-middle">Nama</th>
                      <th className="text-center align-middle">Deskripsi</th>
                      <th className="text-center align-middle">Testimoni</th>
                      <th className="text-center align-middle">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials?.map((testimonial, index) => (
                      <tr key={testimonial.id}>
                        <td className="text-center align-middle">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="align-middle">{testimonial.name}</td>
                        <td className="align-middle">
                          {testimonial.description}
                        </td>
                        <td className="align-middle">
                          {testimonial.testimonial}
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEdit(testimonial)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(testimonial.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Table>
            </div>
          </div>
        </motion.div>
      </div>

      <CmsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalType === "add" ? "Tambah Testimoni" : "Edit Testimoni"}
      >
        <CmsForm
          key={formKey}
          fields={formFields}
          initialValues={
            selectedTestimonial || {
              name: "",
              description: "",
              testimonial: "",
            }
          }
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText={
            modalType === "add" ? "Tambah Testimoni" : "Ubah Testimoni"
          }
          cancelButtonText="Batal"
          isLoading={addLoading}
        />
      </CmsModal>
    </Layout>
  );
};

export default TestimonialsPage;
