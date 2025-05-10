import React from "react";
import Layout from "../../../components/layout/Layout";
import AppSetting from "./AppSetting";
import SmtpSetting from "./SmtpSetting";
import Profile from "./Profile";
import { motion } from "framer-motion";
import "./CenterSetting.css";
import { useGetAppDataQuery } from "../../../controller/api/center/ApiApp";
import Loading from "../../../components/loader/Loading";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
};

const CenterSetting = () => {
  const { data, isLoading } = useGetAppDataQuery();
  const { admin, app } = data || {};

  if (isLoading) {
    return (
      <Loading title={"Pengaturan Aplikasi"} levels={["center", "admin"]} />
    );
  }

  return (
    <Layout title={"Pengaturan Aplikasi"} levels={["center"]}>
      <motion.div
        className='container-fluid py-4 px-lg-5'
        variants={containerVariants}
        initial='hidden'
        animate='visible'>
        <div className='row g-4'>
          <motion.div
            className='col-xl-6 col-lg-8 col-12'
            variants={itemVariants}>
            <div className='card border-0 h-100 shadow-sm hover-shadow-lg transition-all'>
              <div className='card-header bg-info-subtle border-0 py-3'>
                <h5 className='card-title mb-0 text-info fw-semibold'>
                  Pengaturan SMTP
                </h5>
              </div>
              <div className='card-body'>
                <SmtpSetting app={app} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className='col-xl-6 col-lg-8 col-12'
            variants={itemVariants}>
            <div className='card border-0 h-100 shadow-sm hover-shadow-lg transition-all'>
              <div className='card-header bg-success-subtle border-0 py-3'>
                <h5 className='card-title mb-0 text-success fw-semibold'>
                  Profil Admin
                </h5>
              </div>
              <div className='card-body'>
                <Profile admin={admin} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className='col-xl-6 col-lg-8 col-12'
            variants={itemVariants}>
            <div className='card border-0 h-100 shadow-sm hover-shadow-lg transition-all'>
              <div className='card-header bg-primary-subtle border-0 py-3'>
                <h5 className='card-title mb-0 text-primary fw-semibold'>
                  Pengaturan Aplikasi
                </h5>
              </div>
              <div className='card-body'>
                <AppSetting app={app} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default CenterSetting;
