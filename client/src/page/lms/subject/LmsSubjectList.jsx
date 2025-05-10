import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LmsSubjectList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const subjects = user?.subjects;

  const goToLink = (name, id) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/guru-mapel/${formattedName}/${id}`);
  };

  return (
    <div className='row g-2'>
      {subjects?.map((subject) => (
        <div key={subject.id} className='col-lg-2 col-md-4 col-6'>
          <div
            className='card shadow pointer'
            onClick={() => goToLink(subject.name, subject.id)}>
            <div className='card-header h5 bg-primary text-white'>
              {subject.name}
            </div>
            <div className='card-body'>
              <img
                src={
                  subject.cover
                    ? `${window.location.origin}${subject.cover}`
                    : `/logo.png`
                }
                alt={subject.name}
                className='w-100 object-fit-contain'
                style={{ height: 220 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LmsSubjectList;
