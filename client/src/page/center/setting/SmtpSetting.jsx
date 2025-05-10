import React, { useEffect, useState } from "react";
import {
  useUpdateSmtpMutation,
  useGetAppDataQuery,
} from "../../../controller/api/center/ApiApp";
import toast from "react-hot-toast";

const SmtpSetting = ({ app }) => {
  const [formData, setFormData] = useState({
    smtp_host: "",
    smtp_port: "",
    smtp_email: "",
    smtp_password: "",
    smtp_domain: "",
  });

  const [updateSmtp, { isLoading }] = useUpdateSmtpMutation();
  const { refetch } = useGetAppDataQuery();

  useEffect(() => {
    if (app) {
      setFormData({
        smtp_host: app.smtp_host || "",
        smtp_port: app.smtp_port || "",
        smtp_email: app.smtp_email || "",
        smtp_password: app.smtp_password || "",
        smtp_domain: app.smtp_domain || "",
      });
    }
  }, [app]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      smtp_host: formData.smtp_host,
      smtp_port: formData.smtp_port,
      smtp_email: formData.smtp_email,
      smtp_password: formData.smtp_password,
      smtp_domain: formData.smtp_domain,
    };

    toast.promise(
      updateSmtp(data)
        .unwrap()
        .then((res) => {
          // Refetch data immediately after successful update
          refetch();
          return res.message;
        }),
      {
        loading: "Menyimpan...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  return (
    <form className="d-flex flex-column gap-3 p-2" onSubmit={handleSubmit}>
      <p className="m-0 h6">Pengaturan SMTP Email</p>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="smtp-host-label"
        >
          SMTP Host
        </span>
        <input
          type="text"
          className="form-control"
          aria-label="SMTP Host"
          aria-describedby="smtp-host-label"
          name="smtp_host"
          placeholder="Masukkan Host SMTP"
          value={formData.smtp_host}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="smtp-port-label"
        >
          SMTP Port
        </span>
        <input
          type="text"
          className="form-control"
          aria-label="SMTP Port"
          aria-describedby="smtp-port-label"
          name="smtp_port"
          placeholder="Masukkan Port SMTP"
          value={formData.smtp_port}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="smtp-email-label"
        >
          SMTP Email
        </span>
        <input
          type="text"
          className="form-control"
          aria-label="SMTP Email"
          aria-describedby="smtp-email-label"
          name="smtp_email"
          placeholder="Masukkan Email SMTP"
          value={formData.smtp_email}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="smtp-password-label"
        >
          SMTP Password
        </span>
        <input
          type="password"
          className="form-control"
          aria-label="SMTP Password"
          aria-describedby="smtp-password-label"
          name="smtp_password"
          placeholder="Masukkan Password SMTP"
          value={formData.smtp_password}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="smtp-domain-label"
        >
          SMTP Domain
        </span>
        <input
          type="text"
          className="form-control"
          aria-label="SMTP Domain"
          aria-describedby="smtp-domain-label"
          name="smtp_domain"
          placeholder="Masukkan Domain"
          value={formData.smtp_domain}
          onChange={handleChange}
        />
      </div>

      <div className="text-end">
        <button
          className="btn btn-sm btn-success"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default SmtpSetting;
