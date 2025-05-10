import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import TableQues from "./TableQues";
import { useClearBankMutation } from "../../../controller/api/cbt/ApiBank";
import { toast } from "react-hot-toast";
import Upload from "./Upload";

const CbtQuesList = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { subject, name, bankid } = params;

  const [clearBank, { isLoading }] = useClearBankMutation();

  const clearHandler = () => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin akan menghapus bank soal ini?"
    );
    if (!confirmDelete) {
      return;
    }

    toast.promise(
      clearBank(bankid)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const goToLink = () => {
    const nameFormat = name.replace(/[\s/]/g, "-");
    const subjectFormat = subject.replace(/[\s/]/g, "-");
    navigate(
      `/admin-cbt-bank/${subjectFormat}/${nameFormat}/${bankid}/tambah-soal`
    );
  };

  const download = () => {
    window.open("/temp/template_soal.xlsx", "_blank");
  };

  return (
    <Layout title={"Daftar Soal "} levels={["admin", "teacher"]}>
      <div className="container-fluid bg-white p-2 rounded shadow border mb-2">
        <div className="row g-2">
          <div className="col-lg-6 col-12 d-flex align-items-center">
            <div className="d-flex gap-2">
              <p className="m-0">
                Mata Pelajaran: <strong>{subject.replace(/-/g, " ")}</strong>
              </p>
              <p className="m-0">
                Bank Soal: <strong>{name.replace(/-/g, " ")}</strong>
              </p>
            </div>
          </div>
          <div className="col-lg-6 col-12">
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <button
                className="btn btn-sm btn-secondary"
                data-toggle="tooltip"
                data-placement="bottom"
                title="Template"
                onClick={download}
              >
                <i className="bi bi-filetype-xlsx"></i>
                <span className="d-none d-sm-inline">Template</span>
              </button>
              <button
                className="btn btn-sm btn-primary"
                data-toggle="tooltip"
                data-placement="bottom"
                title="Upload"
                data-bs-toggle="modal"
                data-bs-target="#upload"
              >
                <i className="bi bi-file-earmark-arrow-up"></i>
                <span className="d-none d-sm-inline">Upload Soal</span>
              </button>
              <button
                data-toggle="tooltip"
                data-placement="bottom"
                title="Tambah Soal"
                className="btn btn-sm btn-success"
                onClick={goToLink}
              >
                <i className="bi bi-file-earmark-plus"></i>
                <span className="d-none d-sm-inline">Tambah Soal</span>
              </button>
              <button
                className="btn btn-sm btn-danger"
                data-toggle="tooltip"
                data-placement="bottom"
                title="Hapus Soal"
                disabled={isLoading}
                onClick={clearHandler}
              >
                <i className="bi bi-folder-x"></i>
                <span className="d-none d-sm-inline">Hapus Semua Soal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <TableQues subject={subject} name={name} bankid={bankid} />
      <Upload bankid={bankid} />
    </Layout>
  );
};

export default CbtQuesList;
