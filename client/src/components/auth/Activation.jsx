import { useNavigate, useParams } from "react-router-dom";
import { useActivateMutation } from "../../controller/api/center/ApiAdmin";
import toast from "react-hot-toast";
import { useEffect } from "react";

const Activation = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { code } = params;
  const [activate, { isSuccess, isLoading, error, reset }] =
    useActivateMutation();

  const active = () => {
    toast.promise(
      activate(code)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Proses aktivasi...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      navigate("/");
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);
  return (
    <div>
      <div className="area">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>

      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <button
          className="btn btn-lg btn-light"
          disabled={isLoading}
          onClick={active}
        >
          Aktivasi Akun
        </button>
      </div>
    </div>
  );
};

export default Activation;
