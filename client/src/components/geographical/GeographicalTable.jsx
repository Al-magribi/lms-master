import React from "react";

const GeographicalTable = ({ data, level }) => {
  const totalStudents =
    data?.reduce((sum, item) => sum + item.student_count, 0) || 0;

  const calculatePercentage = (value) => {
    return ((value / totalStudents) * 100).toFixed(1);
  };

  return (
    <div className='table-responsive'>
      <table className='table table-striped table-hover table-bordered'>
        <thead>
          <tr>
            <th className='text-center'>
              {level === "province"
                ? "Provinsi"
                : level === "city"
                ? "Kota"
                : level === "district"
                ? "Kecamatan"
                : "Desa"}
            </th>
            {level !== "province" && <th>Provinsi</th>}
            {level === "district" && <th>Kota</th>}
            {level === "village" && <th>Kecamatan</th>}
            <th className='text-center'>Jumlah</th>
            <th className='text-center'>Persentase</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td className='text-center'>{item[`${level}_name`]}</td>
              {level !== "province" && (
                <td className='text-center'>{item.province_name}</td>
              )}
              {level === "district" && (
                <td className='text-center'>{item.city_name}</td>
              )}
              {level === "village" && (
                <td className='text-center'>{item.district_name}</td>
              )}
              <td className='text-center'>{item.student_count}</td>
              <td className='text-center'>
                {calculatePercentage(item.student_count)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeographicalTable;
