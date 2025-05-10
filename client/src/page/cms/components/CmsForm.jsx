import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUpload, FaTimes } from "react-icons/fa";

const CmsForm = ({
  fields,
  initialValues = {},
  onSubmit,
  submitButtonText = "Simpan",
  submitButtonClass = "btn-primary",
  cancelButtonText = "Batal",
  onCancel,
  layout = "vertical",
  children,
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (typeof initialValues.image === "string" && initialValues.image) {
      setImagePreview(initialValues.image);
    }
  }, [initialValues.image]);

  const handleChange = (e, field) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });

      // Auto-resize textarea
      if (type === "textarea") {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
      }
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} harus diisi`;
      }

      if (field.pattern && formData[field.name]) {
        const regex = new RegExp(field.pattern);
        if (!regex.test(formData[field.name])) {
          newErrors[field.name] =
            field.patternMessage || `${field.label} tidak sesuai`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      placeholder,
      options,
      rows = 3,
      accept,
      helpText,
    } = field;

    return (
      <div className={`mb-3 ${layout === "horizontal" ? "row" : ""}`}>
        <label
          htmlFor={name}
          className={`form-label ${layout === "horizontal" ? "col-sm-3" : ""}`}
        >
          {label}
          {field.required && <span className="text-danger ms-1">*</span>}
        </label>

        <div className={layout === "horizontal" ? "col-sm-9" : ""}>
          {type === "textarea" ? (
            <textarea
              id={name}
              name={name}
              className={`form-control ${errors[name] ? "is-invalid" : ""}`}
              placeholder={placeholder}
              rows={rows}
              value={formData[name] || ""}
              onChange={(e) => handleChange(e, field)}
              style={{ minHeight: "200px", resize: "auto" }}
            />
          ) : type === "select" ? (
            <select
              id={name}
              name={name}
              className={`form-select ${errors[name] ? "is-invalid" : ""}`}
              value={formData[name] || ""}
              onChange={(e) => handleChange(e, field)}
            >
              <option value="">Select {label}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : type === "file" ? (
            <div>
              <div className="input-group">
                <input
                  id={name}
                  name={name}
                  type="file"
                  className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                  accept={accept}
                  onChange={(e) => handleChange(e, field)}
                />
                <label className="input-group-text" htmlFor={name}>
                  <FaUpload />
                </label>
              </div>
              {imagePreview && (
                <div className="mt-2 position-relative d-inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ maxHeight: "150px" }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, [name]: null });
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          ) : type === "checkbox" ? (
            <div className="form-check">
              <input
                id={name}
                name={name}
                type="checkbox"
                className={`form-check-input ${
                  errors[name] ? "is-invalid" : ""
                }`}
                checked={formData[name] || false}
                onChange={(e) =>
                  handleChange(
                    { target: { name, value: e.target.checked } },
                    field
                  )
                }
              />
              <label className="form-check-label" htmlFor={name}>
                {placeholder}
              </label>
            </div>
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              className={`form-control ${errors[name] ? "is-invalid" : ""}`}
              placeholder={placeholder}
              value={formData[name] || ""}
              onChange={(e) => handleChange(e, field)}
            />
          )}

          {errors[name] && (
            <div className="invalid-feedback">{errors[name]}</div>
          )}

          {helpText && !errors[name] && (
            <div className="form-text">{helpText}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {fields.map((field) => (
        <motion.div
          key={field.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {renderField(field)}
        </motion.div>
      ))}

      {/* Render custom children (e.g., Editor) here */}
      {children}

      <div className="d-flex justify-content-end gap-2 mt-4">
        {onCancel && (
          <motion.button
            type="button"
            className="btn btn-sm btn-warning"
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cancelButtonText}
          </motion.button>
        )}

        <motion.button
          type="submit"
          className={`btn btn-sm ${submitButtonClass}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {submitButtonText}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default CmsForm;
