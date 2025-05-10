import React, { Fragment, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  useGetNewsByIdQuery,
  useTrackVisitorMutation,
} from "../../controller/api/cms/ApiNews";

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: news, isLoading, isError } = useGetNewsByIdQuery(id);
  const [trackVisitor] = useTrackVisitorMutation();

  useEffect(() => {
    // Track news article visit
    trackVisitor({
      pageType: "news",
      contentId: parseInt(id),
    });
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Fragment>
        <Header />
        <main className='container py-5'>
          <div className='text-center'>
            <div className='spinner-border' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        </main>
        <Footer />
      </Fragment>
    );
  }

  if (isError) {
    return (
      <Fragment>
        <Header />
        <main className='container py-5'>
          <div className='alert alert-danger' role='alert'>
            Error loading news. Please try again later.
          </div>
        </main>
        <Footer />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Header />
      <main style={{ marginTop: 40 }} className='container py-5'>
        <div className='row justify-content-center'>
          <div className='col-lg-8'>
            <article>
              <h1 className='mb-3'>{news.title}</h1>
              <div className='d-flex align-items-center mb-4'>
                <span className='badge bg-primary me-2'>
                  {news.category_name}
                </span>
                <span className='text-muted'>{formatDate(news.createdat)}</span>
              </div>

              <div
                className='news-content'
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </article>

            <button
              className='btn btn-outline-secondary mb-4'
              onClick={() => navigate("/berita")}>
              ← Kembali
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </Fragment>
  );
};

export default Detail;
