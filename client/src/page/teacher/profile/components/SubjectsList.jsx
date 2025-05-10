import React from "react";

const SubjectsList = ({ subjects }) => {
  return (
    <div className="card shadow mb-4">
      <div className="card-header bg-primary text-white">
        <h4 className="mb-0">
          <i className="bi bi-book me-2"></i>
          Mata Pelajaran
        </h4>
      </div>
      <div className="card-body">
        {subjects && subjects.length > 0 ? (
          <div className="row">
            {subjects.map((subject) => (
              <div className="col-md-6 mb-3" key={subject.id}>
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      {subject.cover && (
                        <img
                          src={subject.cover}
                          alt={subject.name}
                          className="me-3"
                          style={{
                            width: 60,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                      )}
                      <h5 className="card-title mb-0">{subject.name}</h5>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">
            Tidak ada mata pelajaran yang ditugaskan
          </p>
        )}
      </div>
    </div>
  );
};

export default SubjectsList;
