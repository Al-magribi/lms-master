import React from "react";
import { motion } from "framer-motion";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import { useGetReasonsQuery } from "../../controller/api/cms/ApiReason";

const Reason = ({ metrics }) => {
  const { data, isLoading } = useGetReasonsQuery({
    page: "",
    limit: "",
    search: "",
  });

  if (isLoading) {
    return (
      <section className='py-5 bg-light'>
        <div className='container'>
          <div className='text-center'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='py-5 bg-light'>
      <div className='container'>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className='text-center mb-5'>
          <h2 className='display-5 fw-bold mb-3'>{metrics?.title_reason}</h2>
          <p className='lead text-muted mx-auto' style={{ maxWidth: "700px" }}>
            {metrics?.desc_reason}
          </p>
        </motion.div>

        <div className='row g-4'>
          {data?.map((reason, index) => {
            // Get the icon component from either FA5 or FA6
            // Format expected in database: "FaQuran" or "Fa6Quran"
            const isFa6 = reason?.icon?.startsWith("Fa6");
            const iconName = isFa6 ? reason?.icon : reason?.icon;
            const IconComponent = isFa6
              ? Fa6Icons[iconName] || Fa6Icons.FaRegLightbulb
              : FaIcons[iconName] || FaIcons.FaLightbulb;

            return (
              <motion.div
                key={reason.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className='col-md-6 col-lg-4'>
                <div className='card h-100 border-0 shadow-sm hover-shadow'>
                  <div className='card-body p-4'>
                    <div className='d-flex align-items-center mb-3'>
                      <div
                        style={{
                          backgroundColor: metrics?.secondary_color,
                          color: metrics?.primary_color,
                        }}
                        className='rounded-circle p-3 me-3'>
                        <IconComponent className='fs-2' />
                      </div>
                      <h3 className='card-title h5 mb-0 fw-bold'>
                        {reason.name}
                      </h3>
                    </div>
                    <p className='card-text text-muted small mb-0'>
                      {reason.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Reason;

/* Add these custom CSS classes to your global CSS file:
.hover-shadow {
  transition: box-shadow 0.3s ease-in-out;
}

.hover-shadow:hover {
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
*/
