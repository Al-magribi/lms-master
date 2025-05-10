import React from "react";

const Footer = ({ metrics }) => {
  return (
    <footer className='bg-dark text-light py-5'>
      <div className='container'>
        <div className='row'>
          {/* Contact Information */}
          <div className='col-md-6 col-12'>
            <h5 className='mb-3'>Kontak Kami</h5>
            <ul className='list-unstyled'>
              <li className='mb-2'>
                <i className='bi bi-telephone-fill me-2'></i>
                SMP: 0896-7489-9341
              </li>
              <li className='mb-2'>
                <i className='bi bi-telephone-fill me-2'></i>
                SMA: 0857-1418-1610
              </li>
              <li className='mb-2'>
                <i className='bi bi-telephone-fill me-2'></i>
                Humas: 0813-1114-1632
              </li>
              <li className='mb-2'>
                <i className='bi bi-envelope-fill me-2'></i>
                info@nibs.sch.id
              </li>
            </ul>
          </div>

          {/* Location */}
          <div className='col-md-6 col-12'>
            <h5 className='mb-3'>Lokasi</h5>
            <p
              className='mb-2 pointer'
              onClick={() => {
                window.open(
                  `https://www.google.com/search?q=${metrics?.name}`,
                  "_blank"
                );
              }}>
              {metrics?.address}
            </p>
            <h5 className='mb-3 mt-4'>Media Sosial</h5>
            <div className='d-flex gap-3'>
              <a
                href={metrics?.facebook}
                className='text-light'
                target='_blank'>
                <i className='bi bi-facebook fs-5'></i>
              </a>
              <a
                href={metrics?.instagram}
                className='text-light'
                target='_blank'>
                <i className='bi bi-instagram fs-5'></i>
              </a>
              <a href={metrics?.youtube} className='text-light' target='_blank'>
                <i className='bi bi-youtube fs-5'></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className='row mt-4'>
          <div className='col-12'>
            <hr className='border-light' />
            <p className='text-center mb-0'>&copy; ALMADEV | {metrics?.name}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
