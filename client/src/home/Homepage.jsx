import React, { Fragment, lazy, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import "./home.css";
import { useTrackVisitorMutation } from "../controller/api/cms/ApiNews";

// Lazy load components that are below the fold
const AboutUs = lazy(() => import("./components/AboutUs"));
const Reason = lazy(() => import("./components/Reason"));
const Facilities = lazy(() => import("./components/Facilities"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const Footer = lazy(() => import("./components/Footer"));
const Infographic = lazy(() => import("./components/Infographic"));

import LoadingScreen from "../components/loader/LoadingScreen";

const Homepage = ({ data, isLoading }) => {
  const [trackVisitor] = useTrackVisitorMutation();

  useEffect(() => {
    // Track homepage visit
    trackVisitor({ pageType: "homepage" });
  }, []);

  // Optimize animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Fragment>
      <Header />
      <section className='hero-container'>
        <div className='hero-section'>
          <div className='hero-overlay'></div>
          <motion.div
            className='hero-content'
            initial='hidden'
            whileInView='visible'
            viewport={{ amount: 0.3, once: true }}
            variants={staggerContainer}>
            <motion.h1 variants={fadeInUp}>{data?.name}</motion.h1>
            <motion.p variants={fadeInUp}>{data?.tagline}</motion.p>
            <motion.button
              className='btn'
              variants={fadeInUp}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(data?.ppdb_url, "_blank")}
              style={{
                backgroundColor: data?.primary_color,
                color: data?.secondary_color,
              }}>
              Yuk, Daftar Sekarang!
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Suspense fallback={<div className='text-center py-5'>Loading...</div>}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ amount: 0.3, once: true }}>
          <AboutUs metrics={data} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ amount: 0.3, once: true }}>
          <Reason metrics={data} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ amount: 0.3, once: true }}>
          <Facilities metrics={data} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ amount: 0.3, once: true }}>
          <Infographic metrics={data} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ amount: 0.3, once: true }}>
          <Testimonials />
        </motion.div>

        <Footer metrics={data} />
      </Suspense>
    </Fragment>
  );
};

export default Homepage;
