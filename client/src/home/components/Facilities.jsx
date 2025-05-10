import React from "react";
import { useGetFacilitiesQuery } from "../../controller/api/cms/ApiFacility";
import { motion } from "framer-motion";

const Facilities = ({ metrics }) => {
  const { data, isLoading } = useGetFacilitiesQuery({
    page: "",
    limit: "",
    search: "",
  });

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
        duration: 0.5,
      },
    },
  };

  return (
    <section id="fasilitas" className="py-5 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">{metrics?.title_facility}</h2>
          <p className="text-muted">{metrics?.desc_facility}</p>
        </div>

        {isLoading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <motion.div
            className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {data?.map((facility) => (
              <motion.div
                key={facility.id}
                className="col"
                variants={itemVariants}
              >
                <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                  <div className="position-relative">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="card-img-top"
                      style={{
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-10"></div>
                  </div>
                  <div className="card-body text-center p-4">
                    <h5 className="card-title mb-0 fw-semibold">
                      {facility.name}
                    </h5>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Facilities;
