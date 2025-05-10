import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetHomepageQuery } from "../../controller/api/cms/ApiHomepage";

const Header = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useGetHomepageQuery();

  const handleLogin = () => {
    navigate("/signin");
  };

  const handleBerita = () => {
    navigate("/berita");
  };

  return (
    <>
      <style>
        {`
          .hover-shadow:hover {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }
          .transition-all {
            transition: all 0.3s ease;
          }
          .nav-link:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }
          .navbar-toggler:focus {
            box-shadow: none;
            outline: none;
          }
          .navbar-toggler:not(.collapsed) {
            background-color: transparent;
          }
        `}
      </style>
      <div className="container-fluid fixed-top bg-white shadow">
        <nav className="container navbar navbar-expand-lg navbar-white bg-white py-2">
          <div className="container-fluid">
            {isLoading ? null : (
              <a className="navbar-brand" href="/">
                <img
                  src={data?.logo}
                  alt="logo"
                  height={45}
                  width={150}
                  loading="lazy"
                  style={{ objectFit: "contain" }}
                />
              </a>
            )}

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div
              className="collapse bg-white navbar-collapse justify-content-end"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav mb-2 mb-lg-0">
                <li className="nav-item mx-1">
                  <a
                    className="nav-link active btn rounded-pill hover-shadow transition-all"
                    aria-current="page"
                    href="#tentang-kami"
                  >
                    <i className="bi bi-info-circle me-1"></i>
                    Tentang Kami
                  </a>
                </li>

                <li className="nav-item mx-1">
                  <a
                    className="nav-link btn rounded-pill hover-shadow transition-all"
                    href="#fasilitas"
                  >
                    <i className="bi bi-building me-1"></i>
                    Fasilitas
                  </a>
                </li>

                <li className="nav-item mx-1">
                  <a
                    className="nav-link btn rounded-pill hover-shadow transition-all"
                    href="#infografis"
                  >
                    <i className="bi bi-graph-up me-1"></i>
                    Infografis
                  </a>
                </li>

                <li className="nav-item mx-1">
                  <a
                    className="nav-link btn rounded-pill hover-shadow transition-all"
                    onClick={handleBerita}
                  >
                    <i className="bi bi-newspaper me-1"></i>
                    Berita
                  </a>
                </li>

                <li className="nav-item mx-1">
                  <a
                    className="nav-link btn rounded-pill hover-shadow transition-all"
                    target="_blank"
                    onClick={() => window.open(data?.ppdb_url, "_blank")}
                  >
                    <i className="bi bi-journal-text me-1"></i>
                    PPDB
                  </a>
                </li>

                <li className="nav-item mx-1">
                  <button
                    style={{
                      backgroundColor: data?.primary_color,
                      color: data?.secondary_color,
                    }}
                    className="btn rounded-pill hover-shadow transition-all"
                    onClick={handleLogin}
                    tabIndex="-1"
                    aria-disabled="true"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Login
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
