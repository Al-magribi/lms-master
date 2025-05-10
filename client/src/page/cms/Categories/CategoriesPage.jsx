import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsDataTable from "../components/CmsDataTable";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import { FaTags, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../../controller/api/cms/ApiCategory";
import Table from "../../../components/table/Table";

const CategoriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [formKey, setFormKey] = useState(0);

  const { data, isLoading, refetch } = useGetCategoryQuery({
    page,
    limit,
    search,
  });
  const { result: categories = [], totalData, totalPage } = data || {};

  const [
    createCategory,
    { isLoading: addLoading, isSuccess, error, data: msg, reset },
  ] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: delLoading }] =
    useDeleteCategoryMutation();

  const handleAdd = () => {
    setModalType("add");
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setModalType("edit");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah anda yakin ingin menghapus kategori ini?")) {
      try {
        const response = await deleteCategory(id).unwrap();
        console.log(response);
        if (response.status === 200) {
          toast.success(response.message);
          refetch();
        } else {
          toast.error(response.error?.data?.message);
        }
      } catch (error) {
        toast.error(error.data?.message || "Failed to delete category");
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await createCategory(formData).unwrap();
    } catch (error) {
      toast.error(error.data?.message || "Failed to save category");
    }
  };

  const handleCancel = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
    setFormKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(msg?.message || "Category saved successfully");
      setIsModalOpen(false);
      refetch();
      setSelectedCategory(null);
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
    setSelectedCategory(null);
    setFormKey((prev) => prev + 1);
  };

  const formFields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
  ];

  return (
    <Layout title='Kategori' levels={["cms"]}>
      <div className='container-fluid py-3 py-md-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div className='d-flex align-items-center'>
              <div className='bg-primary bg-opacity-10 p-3 rounded me-3'>
                <FaTags className='text-primary fs-4' />
              </div>
              <h4 className='mb-0'>Kategori</h4>
            </div>
            <button className='btn btn-sm btn-primary' onClick={handleAdd}>
              <span className='bi bi-plus-circle'></span>
              <span className='ms-2'>Tambah Kategori</span>
            </button>
          </div>

          <div className='card border-0 shadow-sm'>
            <div className='card-body'>
              <Table
                isLoading={isLoading}
                page={page}
                setPage={setPage}
                totalPages={totalPage}
                limit={limit}
                setLimit={setLimit}
                setSearch={setSearch}
                totalData={totalData}>
                <table className='mb-0 table table-bordered table-striped table-hover'>
                  <thead>
                    <tr>
                      <th className='text-center align-middle'>No</th>
                      <th className='text-center align-middle'>Name</th>

                      <th className='text-center align-middle'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories?.map((category, index) => (
                      <tr key={category.id}>
                        <td className='text-center align-middle'>
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className='align-middle'>{category.name}</td>

                        <td className='text-center align-middle'>
                          <div className='d-flex align-items-center justify-content-center gap-2'>
                            <button
                              className='btn btn-sm btn-warning'
                              onClick={() => handleEdit(category)}>
                              <i className='bi bi-pencil-square'></i>
                            </button>
                            <button
                              className='btn btn-sm btn-danger'
                              onClick={() => handleDelete(category.id)}
                              disabled={delLoading}>
                              <i className='bi bi-trash'></i>
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
        title={modalType === "add" ? "Add New Category" : "Edit Category"}>
        <CmsForm
          key={formKey}
          fields={formFields}
          initialValues={
            selectedCategory || {
              name: "",
              description: "",
              slug: "",
            }
          }
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText={
            modalType === "add" ? "Add Category" : "Update Category"
          }
          cancelButtonText='Cancel'
          isLoading={addLoading}
        />
      </CmsModal>
    </Layout>
  );
};

export default CategoriesPage;
