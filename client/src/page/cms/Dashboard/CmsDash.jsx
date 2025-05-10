import React from "react";
import Layout from "../layout/Layout";
import { motion } from "framer-motion";
import {
  FaNewspaper,
  FaTags,
  FaBuilding,
  FaComments,
  FaChartLine,
  FaEye,
  FaUsers,
  FaClock,
  FaGlobe,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useGetCmsDashboardQuery } from "../../../controller/api/dashboard/ApiDashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const CmsDash = () => {
  const {
    data: cmsDashboardData,
    isLoading,
    error,
  } = useGetCmsDashboardQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const statsData = [
    {
      id: "total_visitors",
      title: "Total Pengunjung",
      value: cmsDashboardData?.stats?.total_visitors?.toLocaleString() || "0",
      icon: <FaEye />,
      color: "primary",
      change: `${
        cmsDashboardData?.stats?.changes?.visitors?.value > 0 ? "+" : ""
      }${cmsDashboardData?.stats?.changes?.visitors?.value}%`,
      period:
        cmsDashboardData?.stats?.changes?.visitors?.period || "vs Bulan lalu",
    },
    {
      id: "total_news",
      title: "Berita Terbit",
      value: cmsDashboardData?.stats?.total_news?.toLocaleString() || "0",
      icon: <FaNewspaper />,
      color: "success",
      change: `+${cmsDashboardData?.stats?.changes?.news?.value || 0}`,
      period: cmsDashboardData?.stats?.changes?.news?.period || "Bulan ini",
    },
    {
      id: "total_facilities",
      title: "Fasilitas",
      value: cmsDashboardData?.stats?.total_facilities?.toLocaleString() || "0",
      icon: <FaBuilding />,
      color: "info",
      change: cmsDashboardData?.stats?.changes?.facilities?.value || 0,
      period:
        cmsDashboardData?.stats?.changes?.facilities?.period || "Bulan ini",
    },
    {
      id: "total_testimonials",
      title: "Testimoni",
      value:
        cmsDashboardData?.stats?.total_testimonials?.toLocaleString() || "0",
      icon: <FaComments />,
      color: "warning",
      change: `+${cmsDashboardData?.stats?.changes?.testimonials?.value || 0}`,
      period:
        cmsDashboardData?.stats?.changes?.testimonials?.period || "Bulan ini",
    },
  ];

  // Format daily trend data for the chart
  const dailyTrendData = cmsDashboardData?.visitorStats?.daily_trend?.map(
    (day) => ({
      date: new Date(day.date).toLocaleDateString(),
      visitors: day.unique_visitors,
      visits: day.total_visits,
    })
  );

  // Format country data for the chart
  const countryData = cmsDashboardData?.visitorStats?.top_countries?.map(
    (country) => ({
      country: country.country,
      visitors: country.count,
    })
  );

  // Helper function to format time
  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "just now";
  };

  return (
    <Layout title='Dashboard' levels={["cms"]}>
      <div className='container-fluid py-3 py-md-4'>
        <motion.div
          className='row g-3 g-md-4'
          initial='hidden'
          animate='visible'
          variants={containerVariants}>
          {/* Stats Cards */}
          {statsData.map((stat) => (
            <motion.div
              key={stat.id}
              className='col-12 col-sm-6 col-lg-3'
              variants={itemVariants}>
              <div
                className={`card border-0 shadow-sm h-100 bg-${stat.color} bg-opacity-10`}>
                <div className='card-body'>
                  <div className='d-flex justify-content-between align-items-start'>
                    <div>
                      <h6 className='card-title text-muted mb-1'>
                        {stat.title}
                      </h6>
                      <h2 className='mb-1 fs-3'>{stat.value}</h2>
                      <div className='small text-success'>
                        {stat.change} {stat.period}
                      </div>
                    </div>
                    <div className={`display-6 text-${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Recent Activities */}
          <motion.div className='col-12 col-lg-8' variants={itemVariants}>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                  <h5 className='card-title mb-0'>Aktivitas Terakhir</h5>
                  <Link
                    to='/cms-news'
                    className='btn btn-sm btn-outline-primary'>
                    Lihat Semua
                  </Link>
                </div>
                <div className='timeline'>
                  {cmsDashboardData?.recentActivities?.map((activity) => (
                    <div
                      key={activity.id}
                      className='timeline-item mb-3 pb-3 border-bottom'>
                      <div className='d-flex justify-content-between'>
                        <div>
                          <div className='text-muted small mb-1'>
                            {activity.action}
                          </div>
                          <div className='fw-medium'>{activity.title}</div>
                        </div>
                        <div className='text-muted small'>
                          <FaClock className='me-1' />
                          {getTimeAgo(activity.time)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Page Analytics */}
          <motion.div className='col-12 col-lg-4' variants={itemVariants}>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body'>
                <h5 className='card-title mb-4'>Analisis Halaman</h5>
                <div className='d-flex align-items-center mb-3'>
                  <div className='flex-shrink-0'>
                    <div className='bg-primary bg-opacity-10 p-3 rounded'>
                      <FaChartLine className='text-primary fs-4' />
                    </div>
                  </div>
                  <div className='flex-grow-1 ms-3'>
                    <div className='text-muted small'>Total Halaman</div>
                    <div className='fs-5 fw-medium'>
                      {cmsDashboardData?.websiteAnalytics?.pageViews?.toLocaleString() ||
                        "0"}
                    </div>
                  </div>
                </div>
                <div className='d-flex align-items-center mb-3'>
                  <div className='flex-shrink-0'>
                    <div className='bg-success bg-opacity-10 p-3 rounded'>
                      <FaUsers className='text-success fs-4' />
                    </div>
                  </div>
                  <div className='flex-grow-1 ms-3'>
                    <div className='text-muted small'>Pengunjung Unik</div>
                    <div className='fs-5 fw-medium'>
                      {cmsDashboardData?.websiteAnalytics?.uniqueVisitors?.toLocaleString() ||
                        "0"}
                    </div>
                  </div>
                </div>
                <div className='d-flex align-items-center'>
                  <div className='flex-shrink-0'>
                    <div className='bg-info bg-opacity-10 p-3 rounded'>
                      <FaGlobe className='text-info fs-4' />
                    </div>
                  </div>
                  <div className='flex-grow-1 ms-3'>
                    <div className='text-muted small'>Negara</div>
                    <div className='fs-5 fw-medium'>
                      {cmsDashboardData?.visitorStats?.top_countries?.length ||
                        "0"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CmsDash;
