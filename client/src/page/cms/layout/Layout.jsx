import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaLightbulb,
  FaBuilding,
  FaComments,
  FaTags,
  FaNewspaper,
  FaCog,
  FaBars,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../../../controller/api/auth/ApiAuth";
import { setLogout } from "../../../controller/slice/AuthSlice";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import Meta from "../../../components/meta/Meta";

const Layout = ({ children, title, desc, levels }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user, isSignin } = useSelector((state) => state.auth);
  const [logout, { isSuccess, isLoading, error, reset }] = useLogoutMutation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  const logoutHandler = () => {
    toast.promise(
      logout()
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      dispatch(setLogout());
      window.location.href = "/signin";
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user || !isSignin || !levels.includes(user?.level)) {
        if (user === null || (user && Object.keys(user).length === 0)) {
          window.location.href = "/signin";
        } else {
          window.location.href = "/signin";
        }
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [user, isSignin, levels]);

  const menuItems = [
    {
      id: "Dashboard",
      name: "Dashboard",
      icon: <FaHome />,
      path: "/cms-dashboard",
    },
    {
      id: "reason",
      name: "Alasan",
      icon: <FaLightbulb />,
      path: "/cms-reason",
    },
    {
      id: "facility",
      name: "Fasilitas",
      icon: <FaBuilding />,
      path: "/cms-facility",
    },
    {
      id: "testimoni",
      name: "Testimoni",
      icon: <FaComments />,
      path: "/cms-testimoni",
    },
    {
      id: "category",
      name: "Kategori",
      icon: <FaTags />,
      path: "/cms-category",
    },
    { id: "news", name: "Berita", icon: <FaNewspaper />, path: "/cms-news" },
    {
      id: "settings",
      name: "Pengaturan",
      icon: <FaCog />,
      path: "/cms-settings",
    },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const contentVariants = {
    open: {
      marginLeft: isMobile ? "0" : "250px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      marginLeft: "0",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div className='d-flex'>
      <Meta title={title} desc={desc} />
      {/* Sidebar */}
      <motion.div
        className='sidebar bg-dark text-white'
        initial={isSidebarOpen ? "open" : "closed"}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "250px",
          zIndex: 1050,
          overflowY: "auto",
        }}>
        <div className='p-3 d-flex justify-content-between align-items-center border-bottom'>
          <h5 className='mb-0'>CMS Admin</h5>
          <motion.button
            className='btn btn-sm btn-outline-light'
            onClick={() => setIsSidebarOpen(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}>
            <i className='bi bi-x-lg'></i>
          </motion.button>
        </div>

        <div className='p-3'>
          <ul className='nav flex-column'>
            {menuItems.map((item) => (
              <li className='nav-item mb-2' key={item.id}>
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center ${
                    location.pathname === item.path
                      ? "active bg-primary text-white"
                      : "text-white"
                  }`}
                  onClick={() => isMobile && setIsSidebarOpen(false)}>
                  <span className='me-2'>{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className='main-content'
        initial={isSidebarOpen ? "open" : "closed"}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={contentVariants}
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}>
        {/* Top Navigation */}
        <nav className='navbar navbar-expand-lg navbar-light bg-white shadow-sm'>
          <div className='container-fluid d-flex justify-content-between align-items-center px-2'>
            <motion.button
              className='btn d-flex align-items-center justify-content-center p-2'
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ width: "40px", height: "40px" }}>
              <FaBars className='fs-5' />
            </motion.button>

            <div className='d-flex align-items-center'>
              <div className='dropdown'>
                <button
                  className='btn btn-sm btn-outline-primary'
                  type='button'
                  id='dropdownMenuButton'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'>
                  <FaUser className='me-1 fs-5' />
                  <span className='d-none d-lg-inline'>Admin</span>
                </button>
                <ul
                  className='dropdown-menu dropdown-menu-end shadow-sm'
                  aria-labelledby='dropdownMenuButton'>
                  <li>
                    <a className='dropdown-item py-2' href='#'>
                      <FaUser className='me-2' /> Profile
                    </a>
                  </li>
                  <li>
                    <a className='dropdown-item py-2' href='#'>
                      <FaCog className='me-2' /> Settings
                    </a>
                  </li>
                  <li>
                    <hr className='dropdown-divider' />
                  </li>
                  <li>
                    <a
                      className='dropdown-item py-2 text-danger'
                      onClick={logoutHandler}>
                      <FaTimes className='me-2' /> Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className='p-3 p-md-4'>{children}</div>
      </motion.div>
    </div>
  );
};

export default Layout;
