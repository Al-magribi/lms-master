import React, { useState, useMemo } from "react";
import Layout from "../../../components/layout/Layout";
import Table from "../../../components/table/Table";
import { useGetFamilyDataQuery } from "../../../controller/api/center/ApiCenterData";

const CenterMarket = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  const { data, isLoading } = useGetFamilyDataQuery({
    page,
    limit,
    search,
    family_age: ageFilter || undefined,
    family_gender: genderFilter || undefined,
  });
  const { results = [], totalData, totalPages } = data || {};

  const uniqueAges = useMemo(() => {
    const ages = results.map((result) => result.family_age);
    return [...new Set(ages)].sort((a, b) => a - b);
  }, [results]);

  const handleAgeChange = (e) => {
    setAgeFilter(e.target.value);
    setPage(1);
  };

  const handleGenderChange = (e) => {
    setGenderFilter(e.target.value);
    setPage(1);
  };

  return (
    <Layout title={"Potensial Calon Siswa"} levels={["center"]}>
      <div className='mb-3'>
        <div className='row'>
          <div className='col-md-3'>
            <select
              className='form-select'
              id='ageFilter'
              value={ageFilter}
              onChange={handleAgeChange}>
              <option value=''>Semua Umur</option>
              {uniqueAges.map((age) => (
                <option key={age} value={age}>
                  {age} tahun
                </option>
              ))}
            </select>
          </div>
          <div className='col-md-3'>
            <select
              className='form-select'
              id='genderFilter'
              value={genderFilter}
              onChange={handleGenderChange}>
              <option value=''>Semua Gender</option>
              <option value='L'>Laki-laki</option>
              <option value='P'>Perempuan</option>
            </select>
          </div>
        </div>
      </div>
      <Table
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        totalData={totalData}
        totalPages={totalPages}>
        <table className='mb-0 table table-hover table-bordered table-striped'>
          <thead>
            <tr>
              <th className='text-center'>No</th>
              <th className='text-center'>Nama Siswa</th>
              <th className='text-center'>Nama Keluarga</th>
              <th className='text-center'>L/P</th>
              <th className='text-center'>Umur</th>
              <th className='text-center'>Kontak</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td className='text-center'>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className='align-middle'>{result.student_name}</td>
                <td className='align-middle'>{result.family_name}</td>
                <td className='text-center align-middle'>
                  {result.family_gender}
                </td>
                <td className='text-center align-middle'>
                  {result.family_age} tahun
                </td>
                <td className='text-center align-middle'>
                  <div className='d-flex justify-content-center gap-2'>
                    <button
                      className='btn btn-sm btn-success'
                      title={result.father_name}
                      onClick={() => {
                        window.open(
                          `https://wa.me/${result.father_phone}`,
                          "_blank"
                        );
                      }}
                      disabled={!result.father_phone}>
                      <i className='bi bi-whatsapp'></i>{" "}
                      <span className='ms-2'>Ayah</span>
                    </button>

                    <button
                      className='btn btn-sm btn-success'
                      title={result.mother_name}
                      onClick={() => {
                        window.open(
                          `https://wa.me/${result.mother_phone}`,
                          "_blank"
                        );
                      }}
                      disabled={!result.mother_phone}>
                      <i className='bi bi-whatsapp'></i>
                      <span className='ms-2'>Ibu</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Table>
    </Layout>
  );
};

export default CenterMarket;
