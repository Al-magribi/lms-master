import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import {
  useGetReasonsQuery,
  useAddReasonMutation,
  useDeleteReasonMutation,
} from "../../../controller/api/cms/ApiReason";
import { toast } from "react-hot-toast";
import Table from "../../../components/table/Table";

const ReasonsPage = ({ homepage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedReason, setSelectedReason] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [formKey, setFormKey] = useState(0);

  const { data, isLoading, refetch } = useGetReasonsQuery({
    page,
    limit,
    search,
  });
  const { reasons, totalData, totalPage } = data || {};

  const [
    addReason,
    { isSuccess, error, isLoading: addLoading, data: msg, reset },
  ] = useAddReasonMutation();
  const [deleteReason] = useDeleteReasonMutation();

  const handleAdd = () => {
    setModalType("add");
    setSelectedReason(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reason) => {
    setModalType("edit");
    setSelectedReason(reason);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reason?")) {
      try {
        await deleteReason(id).unwrap();
        toast.success("Reason deleted successfully");
        refetch();
      } catch (error) {
        toast.error(error.data?.message || "Failed to delete reason");
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await addReason(formData).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    setSelectedReason(null);
    setIsModalOpen(false);
    setFormKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(msg.message);
      setIsModalOpen(false);
      refetch();
      setSelectedReason(null);
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
    setSelectedReason(null);
    setFormKey((prev) => prev + 1);
  };

  const formFields = [
    {
      name: "name",
      label: "Alasan",
      type: "text",
      required: true,
      placeholder: "Masukkan alasan",
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "textarea",
      required: true,
      placeholder: "Masukkan deskripsi lengkap",
      rows: 4,
    },
    {
      name: "icon",
      label: "Icon",
      type: "text",
      required: true,
      placeholder: "Masukkan nama icon",
      helpText: (
        <>
          Gunakan icon dari library{" "}
          <a
            href='https://react-icons.github.io/react-icons/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary'>
            react-icons
          </a>{" "}
          FontAwesome 5 atau FontAwesome 6
        </>
      ),
    },
  ];

  console.log(homepage);

  return (
    <Layout title='Alasan' levels={["cms"]}>
      <div className='container-fluid py-3 py-md-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <div className='d-flex align-items-center'>
              <div
                className=' p-3 rounded me-3'
                style={{
                  color: homepage?.primary_color,
                  backgroundColor: homepage?.secondary_color,
                }}>
                <i className='bi bi-lightbulb fs-4'></i>
              </div>
              <h4 className='mb-0'>Alasan</h4>
            </div>
            <button
              className='btn btn-sm btn-outline-primary'
              onClick={handleAdd}>
              <i className='bi bi-plus-circle'></i>
              <span className='ms-2'>Tambah Alasan</span>
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
                      <th className='text-center align-middle'>Icon</th>
                      <th className='text-center align-middle'>Alasan</th>
                      <th className='text-center align-middle'>Deskripsi</th>
                      <th className='text-center align-middle'>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reasons?.map((reason, index) => {
                      const isFa6 = reason?.icon?.startsWith("Fa6");
                      const IconComponent = isFa6
                        ? Fa6Icons[reason.icon] || Fa6Icons.FaRegLightbulb
                        : FaIcons[reason.icon] || FaIcons.FaLightbulb;

                      return (
                        <tr key={reason.id}>
                          <td className='text-center align-middle'>
                            {(page - 1) * limit + index + 1}
                          </td>
                          <td className='text-center align-middle'>
                            <div
                              className='rounded-circle p-3 me-3'
                              style={{
                                color: homepage?.primary_color,
                                backgroundColor: homepage?.secondary_color,
                              }}>
                              <IconComponent className='fs-2' />
                            </div>
                          </td>
                          <td className='align-middle'>{reason.name}</td>
                          <td className='align-middle'>{reason.description}</td>
                          <td className='text-center align-middle'>
                            <div className='d-flex align-items-center justify-content-center gap-2'>
                              <button
                                className='btn btn-sm btn-warning'
                                onClick={() => handleEdit(reason)}>
                                <i className='bi bi-pencil-square'></i>
                              </button>
                              <button
                                className='btn btn-sm btn-danger'
                                onClick={() => handleDelete(reason.id)}>
                                <i className='bi bi-trash'></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
        title={modalType === "add" ? "Tambah Alasan" : "Edit Alasan"}>
        <CmsForm
          key={formKey}
          fields={formFields}
          initialValues={
            selectedReason || {
              name: "",
              description: "",
              icon: "",
            }
          }
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText={
            modalType === "add" ? "Tambah Alasan" : "Ubah Alasan"
          }
          cancelButtonText='Batal'
          isLoading={addLoading}
        />
      </CmsModal>
    </Layout>
  );
};

export default ReasonsPage;
