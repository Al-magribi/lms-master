import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

const Meta = ({ title, desc, favicon }) => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="icon" type="image/svg+xml" href={favicon || "/logo.png"} />
      </Helmet>
    </HelmetProvider>
  );
};

export default Meta;
