import React from "react";
import { motion } from "framer-motion";
import { FaPlus, FaSearch, FaFilter } from "react-icons/fa";

const CmsPageLayout = ({
  title,
  children,
  onAdd,
  onSearch,
  searchPlaceholder = "Search...",
  showSearch = true,
  showFilter = false,
  onFilter,
  filterOptions,
  activeFilter,
  setActiveFilter,
}) => {
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

  return (
    <motion.div
      className="container-fluid py-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="card shadow-sm mb-4" variants={itemVariants}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="card-title mb-0">{title}</h2>
            {onAdd && (
              <motion.button
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAdd}
              >
                <FaPlus className="me-2" />
                Add New
              </motion.button>
            )}
          </div>

          {(showSearch || showFilter) && (
            <div className="row mb-4">
              {showSearch && (
                <div className="col-md-6 mb-3 mb-md-0">
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={searchPlaceholder}
                      onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {showFilter && filterOptions && (
                <div className="col-md-6">
                  <div className="d-flex">
                    <span className="input-group-text bg-light">
                      <FaFilter />
                    </span>
                    <select
                      className="form-select"
                      value={activeFilter}
                      onChange={(e) =>
                        setActiveFilter && setActiveFilter(e.target.value)
                      }
                    >
                      {filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <motion.div variants={itemVariants}>{children}</motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CmsPageLayout;
