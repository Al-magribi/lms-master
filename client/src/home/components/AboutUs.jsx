import React, { useState, useEffect } from "react";

const AboutUs = ({ metrics }) => {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const videoContainer = document.getElementById("video-container");
    if (videoContainer) {
      observer.observe(videoContainer);
    }

    return () => observer.disconnect();
  }, []);

  // Convert regular YouTube URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return "";
    // Handle both regular and embed URLs
    if (url.includes("embed")) return url;

    // Extract video ID from various YouTube URL formats
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  return (
    <section id="tentang-kami" className="py-5 my-5 bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-12">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="mb-4">{metrics?.name}</h2>

                <p className="card-text">{metrics?.description}</p>
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-12">
            <div id="video-container" className="ratio ratio-16x9">
              {shouldLoadVideo ? (
                <iframe
                  src={getEmbedUrl(metrics?.video_url)}
                  title="Video Profil NIBS"
                  allowFullScreen
                  className="rounded"
                  loading="lazy"
                />
              ) : (
                <div className="bg-light rounded d-flex align-items-center justify-content-center">
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
