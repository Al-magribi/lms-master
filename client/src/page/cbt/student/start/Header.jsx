import React from "react";
import { formatTime } from "../../../../utils/formatTime";

const Header = ({ name, user, examid, timeLeft, isExamStarted }) => {
  return (
    <div className='container-fluid bg-primary text-white'>
      <div className='container p-2'>
        <div className='d-flex justify-content-between align-items-center'>
          <div>
            <h4 className='card-title mb-0'>{name.replace(/-/g, " ")}</h4>
            <small>
              Nama: {user.name} | Kelas: {user.class}
            </small>
          </div>
          <div className='d-flex align-items-center gap-3'>
            {isExamStarted && (
              <div className='h3 m-0'>{formatTime(timeLeft)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
