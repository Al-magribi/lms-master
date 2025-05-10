import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSigninMutation } from "../../controller/api/auth/ApiAuth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLogin } from "../../controller/slice/AuthSlice";
import "./Index.css";
import { useGetAppQuery } from "../../controller/api/center/ApiApp";

const Signin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isSignin } = useSelector((state) => state.auth);

  const { data: app } = useGetAppQuery();

  const routes = {
    center: "/center-dashboard",
    admin: "/admin-dashboard",
    student: "/siswa-dashboard",
    teacher: "/guru-dashboard",
    parent: "/wali-dashboard",
    tahfiz: "/tahfiz-dashboard",
    cms: "/cms-dashboard",
  };

  // Add useEffect for initial auth check
  useEffect(() => {
    // If user is already authenticated, redirect to appropriate dashboard
    if (isSignin && user?.level) {
      navigate(routes[user.level]);
    }
  }, [isSignin, user, navigate]);

  const [role, setRole] = useState("none");
  const [isSignup, setSignup] = useState(false);
  const [accountValue, setAccountValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signin, { isLoading, data }] = useSigninMutation();

  // Add form validation state
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!accountValue.trim()) {
      errors.account = "Field ini wajib diisi";
    }
    if (!password) {
      errors.password = "Password wajib diisi";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRoleChange = (value) => {
    setRole(value);
    setAccountValue(""); // Reset account value when role changes
    setFormErrors({}); // Clear any existing errors
  };

  const handleSignup = () => {
    setRole("");
    setSignup(true);
    setAccountValue("");
    setFormErrors({}); // Clear any existing errors
  };

  const back = () => {
    setRole("none");
    setSignup(false);
    setAccountValue("");
    setFormErrors({}); // Clear any existing errors
  };

  const loginHandler = async (e) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    const toastId = toast.loading("Memproses login...");

    const credentials = {
      password,
      ...(role === "student"
        ? { nis: accountValue }
        : role === "teacher"
        ? { username: accountValue }
        : role === "parent"
        ? { name: accountValue }
        : { email: accountValue }),
    };

    try {
      // Sign in the user and get complete user data in one request
      const signinResult = await signin(credentials).unwrap();

      // Update with complete user data
      dispatch(setLogin(signinResult.user));

      // Show success message
      toast.success("Login berhasil", { id: toastId });

      // Navigate to appropriate dashboard
      navigate(routes[signinResult.user.level] || "/");
    } catch (error) {
      // Handle different types of errors
      const errorMessage =
        error.data?.message || "Gagal masuk. Silakan coba lagi.";
      toast.error(errorMessage, { id: toastId });

      // Clear sensitive data on error
      setPassword("");
    }
  };

  // If user is authenticated, show loading state instead of null
  if (isSignin && user?.level) {
    return (
      <div
        className='d-flex align-items-center justify-content-center'
        style={{ height: "100vh" }}>
        <div className='text-center'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
          <p className='mt-2'>Mengalihkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='area'>
        <ul className='circles'>
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
        className='d-flex align-items-center justify-content-center flex-column gap-3'
        style={{ height: "100vh" }}>
        <img
          src={app?.logo ? app?.logo : "/logo.png"}
          alt='logo'
          style={{ height: 120, width: 120, marginBottom: "1rem" }}
          className='pointer'
          onClick={() => (window.location.href = "/")}
        />

        {role === "none" && (
          <div className='d-flex flex-wrap justify-content-center gap-3'>
            <div
              className='card bg-info text-white transition-card'
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => handleRoleChange("admin")}>
              <div className='card-body d-flex flex-column align-items-center justify-content-center gap-2'>
                <i
                  className='bi bi-person-badge-fill transition-icon'
                  style={{ fontSize: "2rem" }}></i>
                <h5 className='card-title mb-0'>Admin</h5>
              </div>
            </div>

            <div
              className='card bg-info text-white transition-card'
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => handleRoleChange("teacher")}>
              <div className='card-body d-flex flex-column align-items-center justify-content-center gap-2'>
                <i
                  className='bi bi-person-workspace transition-icon'
                  style={{ fontSize: "2rem" }}></i>
                <h5 className='card-title mb-0'>Guru</h5>
              </div>
            </div>

            <div
              className='card bg-info text-white transition-card'
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => handleRoleChange("student")}>
              <div className='card-body d-flex flex-column align-items-center justify-content-center gap-2'>
                <i
                  className='bi bi-mortarboard-fill transition-icon'
                  style={{ fontSize: "2rem" }}></i>
                <h5 className='card-title mb-0'>Siswa</h5>
              </div>
            </div>

            <div
              className='card bg-info text-white transition-card'
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => handleRoleChange("parent")}>
              <div className='card-body d-flex flex-column align-items-center justify-content-center gap-2'>
                <i
                  className='bi bi-people-fill transition-icon'
                  style={{ fontSize: "2rem" }}></i>
                <h5 className='card-title mb-0'>Wali Murid</h5>
              </div>
            </div>

            <div
              className='card bg-info text-white transition-card'
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={handleSignup}>
              <div className='card-body d-flex flex-column align-items-center justify-content-center gap-2'>
                <i
                  className='bi bi-person-plus-fill transition-icon'
                  style={{ fontSize: "2rem" }}></i>
                <h5 className='card-title mb-0'>Pendaftaran</h5>
              </div>
            </div>
          </div>
        )}

        {role !== "none" && !isSignup && (
          <form
            style={{ width: 300 }}
            className='d-flex flex-column gap-3'
            onSubmit={loginHandler}>
            <div className='input-group'>
              <span className='input-group-text'>
                <i
                  className={`bi ${
                    role === "student"
                      ? "bi-person-badge"
                      : role === "teacher"
                      ? "bi-person-workspace"
                      : "bi-envelope"
                  }`}></i>
              </span>
              <input
                type={role === "admin" || role === "parent" ? "email" : "text"}
                placeholder={
                  role === "student"
                    ? "NIS"
                    : role === "teacher"
                    ? "USERNAME"
                    : "EMAIL"
                }
                value={accountValue}
                onChange={(e) => {
                  setAccountValue(e.target.value);
                  setFormErrors({ ...formErrors, account: "" });
                }}
                required
                className={`form-control ${
                  formErrors.account ? "is-invalid" : ""
                }`}
              />
              {formErrors.account && (
                <div className='invalid-feedback'>{formErrors.account}</div>
              )}
            </div>

            <div className='input-group'>
              <span className='input-group-text'>
                <i className='bi bi-lock-fill'></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder='Password'
                className={`form-control ${
                  formErrors.password ? "is-invalid" : ""
                }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormErrors({ ...formErrors, password: "" });
                }}
                required
              />
              {formErrors.password && (
                <div className='invalid-feedback'>{formErrors.password}</div>
              )}
            </div>

            <div className='form-check'>
              <input
                className='form-check-input'
                type='checkbox'
                id='flexCheckDefault'
                checked={showPassword}
                onChange={handlePasswordToggle}
              />
              <label
                className='form-check-label text-white'
                htmlFor='flexCheckDefault'>
                Tampilkan Password
              </label>
            </div>

            <div className='d-flex justify-content-between'>
              <button
                type='button'
                className='btn btn-danger d-flex align-items-center gap-2'
                onClick={() => setRole("none")}>
                <i className='bi bi-arrow-left'></i>
                Kembali
              </button>
              <button
                type='submit'
                className='btn btn-success d-flex align-items-center gap-2'
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm'
                      aria-hidden='true'></span>
                    <span role='status'>Loading...</span>
                  </>
                ) : (
                  <>
                    <i className='bi bi-box-arrow-in-right'></i>
                    Masuk
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {isSignup && <SignUp setRole={back} />}
      </div>
    </div>
  );
};

export default Signin;
