import React from "react";
import { FaArrowLeft, FaCalendarAlt, FaFolder } from "react-icons/fa";
import Layout from "../layout/Layout";

const DetailNews = ({ news, onBack }) => {
  if (!news) return null;

  return (
    <Layout title={news.title} levels={["cms"]}>
      <div className="container py-5">
        <button
          className="btn btn-outline-secondary mb-4 d-flex align-items-center"
          onClick={onBack}
        >
          <FaArrowLeft className="me-2" /> Kembali
        </button>

        <article className="blog-post">
          <header className="mb-4">
            <h1 className="display-5 fw-bold mb-3">{news.title}</h1>
            <div className="d-flex align-items-center text-muted mb-4">
              <div className="d-flex align-items-center me-4">
                <FaFolder className="me-2" />
                <span>{news.category_name || news.category}</span>
              </div>
              {news.createdat && (
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="me-2" />
                  <span>
                    {new Date(news.createdat).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </header>

          {news.image && (
            <div className="mb-4">
              <img
                src={news.image}
                alt={news.title}
                className="img-fluid rounded shadow-sm"
                style={{
                  maxHeight: "500px",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          <div
            className="blog-content"
            style={{
              fontSize: "1.1rem",
              lineHeight: "1.8",
              color: "#333",
            }}
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </article>
      </div>
    </Layout>
  );
};

export default DetailNews;
