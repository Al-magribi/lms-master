import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaNewspaper } from "react-icons/fa";
import Layout from "../layout/Layout";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import Editor from "../components/editor/Editor";
import Table from "../../../components/table/Table";
import {
  useGetNewsQuery,
  useAddNewsMutation,
  useDeleteNewsMutation,
} from "../../../controller/api/cms/ApiNews";
import { toast } from "react-hot-toast";
import { useGetCategoryQuery } from "../../../controller/api/cms/ApiCategory";
import DetailNews from "./DetailNews";

const NewsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedNews, setSelectedNews] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [content, setContent] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailNews, setDetailNews] = useState(null);

  const { data: categories } = useGetCategoryQuery({
    page: "",
    limit: "",
    search: "",
  });

  const { data, isLoading, refetch } = useGetNewsQuery({
    page,
    limit,
    search,
  });

  const { result: news, totalData, totalPage } = data || {};

  const [
    addNews,
    { isSuccess, error, isLoading: addLoading, data: msg, reset },
  ] = useAddNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();

  const handleAdd = () => {
    setModalType("add");
    setSelectedNews(null);
    setContent("");
    setIsModalOpen(true);
  };

  const handleEdit = (newsItem) => {
    setModalType("edit");
    setSelectedNews({
      ...newsItem,
      category: String(newsItem.category_id),
      image: newsItem.image,
    });
    setContent(newsItem.content);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah anda yakin ingin menghapus berita ini?")) {
      try {
        await deleteNews(id).unwrap();
        toast.success("Berita berhasil dihapus");
        refetch();
      } catch (error) {
        toast.error(error.data?.message || "Gagal menghapus berita");
      }
    }
  };

  const handleSubmit = async (formData) => {
    const submitData = {
      ...formData,
      content,
      id: selectedNews?.id,
    };

    // Validasi: hanya wajib gambar saat tambah
    if (
      !submitData.title ||
      !submitData.category ||
      !submitData.content ||
      (!submitData.image && !selectedNews)
    ) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("title", submitData.title);
    dataToSend.append("category", submitData.category);
    dataToSend.append("content", submitData.content);
    if (submitData.id) dataToSend.append("id", submitData.id);

    if (submitData.image instanceof File) {
      dataToSend.append("image", submitData.image);
    } else if (typeof submitData.image === "string" && submitData.image) {
      dataToSend.append("image", submitData.image);
    }

    try {
      await addNews(dataToSend).unwrap();
    } catch (error) {
      toast.error(error.data?.message || "Gagal menyimpan berita");
    }
  };

  const handleCancel = () => {
    setSelectedNews(null);
    setContent("");
    setIsModalOpen(false);
    setFormKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(msg.message);
      setIsModalOpen(false);
      refetch();
      setSelectedNews(null);
      setContent("");
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
    setSelectedNews(null);
    setContent("");
    setFormKey((prev) => prev + 1);
  };

  const handleView = (newsItem) => {
    setDetailNews(newsItem);
    setShowDetail(true);
  };

  const handleBack = () => {
    setShowDetail(false);
    setDetailNews(null);
  };

  const formFields = [
    {
      name: "title",
      label: "Judul",
      type: "text",
      required: true,
      placeholder: "Masukkan judul berita",
    },
    {
      name: "category",
      label: "Kategori",
      type: "select",
      required: true,
      options: categories?.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    },
    {
      name: "image",
      label: "Gambar",
      type: "file",
      accept: "image/*",
      required: !selectedNews,
      helpText: "Upload gambar untuk berita",
    },
  ];

  if (showDetail && detailNews) {
    return <DetailNews news={detailNews} onBack={handleBack} />;
  }

  return (
    <Layout title="Berita" levels={["cms"]}>
      <div className="container-fluid py-3 py-md-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <FaNewspaper className="text-primary fs-4" />
              </div>
              <h4 className="mb-0">Berita</h4>
            </div>
            <button className="btn btn-sm btn-primary" onClick={handleAdd}>
              <i className="bi bi-plus-circle"></i>
              <span className="ms-2">Tambah Berita</span>
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
                      <th className="text-center align-middle">Judul</th>
                      <th className="text-center align-middle">Kategori</th>
                      <th className="text-center align-middle">
                        Tanggal Dibuat
                      </th>
                      <th className="text-center align-middle">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news?.map((item, index) => (
                      <tr key={item.id}>
                        <td className="text-center align-middle">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="align-middle">{item.title}</td>
                        <td className="text-center align-middle">
                          {item.category_name}
                        </td>
                        <td className="text-center align-middle">
                          {new Date(item.createdat).toLocaleDateString()}
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-info"
                              title="Lihat Detail"
                              onClick={() => handleView(item)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEdit(item)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(item.id)}
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
        title={modalType === "add" ? "Tambah Berita" : "Edit Berita"}
        size="lg"
      >
        <CmsForm
          key={formKey}
          fields={formFields}
          initialValues={
            selectedNews || {
              title: "",
              category: "",
              image: "",
            }
          }
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText={
            modalType === "add" ? "Tambah Berita" : "Ubah Berita"
          }
          cancelButtonText="Batal"
          isLoading={addLoading}
        >
          <div className="mb-3">
            <label className="form-label">Konten</label>
            <Editor
              value={content}
              onChange={setContent}
              placeholder="Masukkan konten berita..."
              height="400px"
            />
          </div>
        </CmsForm>
      </CmsModal>
    </Layout>
  );
};

export default NewsPage;
