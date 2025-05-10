import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import * as FaIcons from "react-icons/fa";
import {
  useGetFacilitiesQuery,
  useAddFacilityMutation,
  useDeleteFacilityMutation,
} from "../../../controller/api/cms/ApiFacility";
import { toast } from "react-hot-toast";
import Table from "../../../components/table/Table";

const FacilitiesPage = ({ homepage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [formKey, setFormKey] = useState(0);

  const { data, isLoading, refetch } = useGetFacilitiesQuery({
    page,
    limit,
    search,
  });
  const { results: facilities, totalData, totalPage } = data || {};

  const [
    addFacility,
    { isSuccess, error, isLoading: addLoading, data: msg, reset },
  ] = useAddFacilityMutation();
  const [deleteFacility] = useDeleteFacilityMutation();

  const handleAdd = () => {
    setModalType("add");
    setSelectedFacility(null);
    setIsModalOpen(true);
  };

  const handleEdit = (facility) => {
    setModalType("edit");
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah anda yakin ingin menghapus fasilitas ini?")) {
      try {
        await deleteFacility(id).unwrap();
        toast.success("Fasilitas berhasil dihapus");
        refetch();
      } catch (error) {
        toast.error(error.data?.message || "Gagal menghapus fasilitas");
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);

      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      } else if (selectedFacility?.image) {
        formDataToSend.append("image", selectedFacility.image);
      }

      if (selectedFacility?.id) {
        formDataToSend.append("id", selectedFacility.id);
      }

      await addFacility(formDataToSend).unwrap();
    } catch (error) {
      console.log(error);
      toast.error(error.data?.message || "Gagal menyimpan fasilitas");
    }
  };

  const handleCancel = () => {
    setSelectedFacility(null);
    setIsModalOpen(false);
    setFormKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(msg.message);
      setIsModalOpen(false);
      refetch();
      setSelectedFacility(null);
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
    setSelectedFacility(null);
    setFormKey((prev) => prev + 1);
  };

  const formFields = [
    {
      name: "name",
      label: "Nama Fasilitas",
      type: "text",
      required: true,
      placeholder: "Masukkan nama fasilitas",
    },
    {
      name: "image",
      label: "Gambar",
      type: "file",
      required: true,
      placeholder: "Pilih gambar fasilitas",
      accept: "image/*",
    },
  ];

  return (
    <Layout title='Fasilitas' levels={["cms"]}>
      <div className='container-fluid py-3 py-md-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <div className='d-flex align-items-center'>
              <div
                className='p-3 rounded me-3'
                style={{
                  color: homepage?.primary_color,
                  backgroundColor: homepage?.secondary_color,
                }}>
                <i className='bi bi-building fs-4'></i>
              </div>
              <h4 className='mb-0'>Fasilitas</h4>
            </div>
            <button
              className='btn btn-sm btn-outline-primary'
              onClick={handleAdd}>
              <i className='bi bi-plus-circle'></i>
              <span className='ms-2'>Tambah Fasilitas</span>
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
                      <th className='text-center align-middle'>Gambar</th>
                      <th className='text-center align-middle'>
                        Nama Fasilitas
                      </th>
                      <th className='text-center align-middle'>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities?.map((facility, index) => (
                      <tr key={facility.id}>
                        <td className='text-center align-middle'>
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className='text-center align-middle'>
                          <img
                            src={facility.image}
                            alt={facility.name}
                            width={200}
                            height={100}
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        </td>
                        <td className='align-middle'>{facility.name}</td>
                        <td className='text-center align-middle'>
                          <div className='d-flex align-items-center justify-content-center gap-2'>
                            <button
                              className='btn btn-sm btn-warning'
                              onClick={() => handleEdit(facility)}>
                              <i className='bi bi-pencil-square'></i>
                            </button>
                            <button
                              className='btn btn-sm btn-danger'
                              onClick={() => handleDelete(facility.id)}>
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
        title={modalType === "add" ? "Tambah Fasilitas" : "Edit Fasilitas"}>
        <CmsForm
          key={formKey}
          fields={formFields}
          initialValues={
            selectedFacility || {
              name: "",
              image: "",
            }
          }
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText={
            modalType === "add" ? "Tambah Fasilitas" : "Ubah Fasilitas"
          }
          cancelButtonText='Batal'
          isLoading={addLoading}
        />
      </CmsModal>
    </Layout>
  );
};

export default FacilitiesPage;
