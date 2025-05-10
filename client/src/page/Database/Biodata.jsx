import React, { useState, useEffect } from "react";
import {
  useGetProvinceQuery,
  useGetCityQuery,
  useGetDistrictQuery,
  useGetVillageQuery,
} from "../../controller/api/database/ApiArea";
import {
  useAddStudentDataMutation,
  useGetPeriodeQuery,
  useGetHomebaseQuery,
} from "../../controller/api/database/ApiDatabase";
import toast from "react-hot-toast";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // Handle invalid dates
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Biodata = ({ studentData, onRefetch, userid }) => {
  const [formData, setFormData] = useState({
    userid: userid,
    entryid: studentData?.entryid || "",
    entry_name: studentData?.entry_name || "",
    homebaseid: studentData?.homebaseid || "",
    homebase_name: studentData?.homebase_name || "",
    academic_year: studentData?.academic_year || "",
    gender: studentData?.gender || "",
    name: studentData?.name || "",
    nisn: studentData?.nisn || "",
    nis: studentData?.nis || "",
    birth_place: studentData?.birth_place || "",
    birth_date: studentData?.birth_date
      ? formatDate(studentData.birth_date)
      : formatDate(new Date()),
    order_number: studentData?.order_number || "",
    siblings: studentData?.siblings || "",
    height: studentData?.height || "",
    weight: studentData?.weight || "",
    head: studentData?.head || "",
    provinceid: studentData?.provinceid || "",
    province_name: studentData?.province_name || "",
    cityid: studentData?.cityid || "",
    city_name: studentData?.city_name || "",
    districtid: studentData?.districtid || "",
    district_name: studentData?.district_name || "",
    villageid: studentData?.villageid?.trim() || "",
    village_name: studentData?.village_name || "",
    postal_code: studentData?.postal_code || "",
    address: studentData?.address || "",
  });

  // Query hooks
  const { data: periode } = useGetPeriodeQuery();
  const { data: homebase } = useGetHomebaseQuery();
  const { data: provinces } = useGetProvinceQuery();
  const { data: cities } = useGetCityQuery(formData.provinceid, {
    skip: !formData.provinceid,
  });
  const { data: districts } = useGetDistrictQuery(formData.cityid, {
    skip: !formData.cityid,
  });
  const { data: villages } = useGetVillageQuery(formData.districtid, {
    skip: !formData.districtid,
  });
  const [addStudentData, { isLoading, isSuccess, isError, reset }] =
    useAddStudentDataMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev };

      if (name === "birth_date") {
        // Use formatDate for date input values
        newData[name] = value; // No need to format here as HTML date input provides YYYY-MM-DD
      } else if (name === "entryid") {
        const selectedPeriode = periode?.find((p) => p.id === parseInt(value));
        if (selectedPeriode) {
          newData.entryid = selectedPeriode.id;
          newData.entry_name = selectedPeriode.name;
        }
      }
      // Handle homebase selection
      else if (name === "homebaseid") {
        const selectedHomebase = homebase?.find((h) => h.id == value);
        if (selectedHomebase) {
          newData.homebaseid = selectedHomebase.id;
          newData.homebase_name = selectedHomebase.name;
        }
      }
      // Handle location selections
      else if (name === "provinceid") {
        const selectedProvince = provinces?.find((p) => p.id === value);
        if (selectedProvince) {
          newData.provinceid = selectedProvince.id;
          newData.province_name = selectedProvince.name;
          // Reset dependent fields
          newData.cityid = "";
          newData.city_name = "";
          newData.districtid = "";
          newData.district_name = "";
          newData.villageid = "";
          newData.village_name = "";
        }
      } else if (name === "cityid") {
        const selectedCity = cities?.find((c) => c.id === value);
        if (selectedCity) {
          newData.cityid = selectedCity.id;
          newData.city_name = selectedCity.name;
          // Reset dependent fields
          newData.districtid = "";
          newData.district_name = "";
          newData.villageid = "";
          newData.village_name = "";
        }
      } else if (name === "districtid") {
        const selectedDistrict = districts?.find((d) => d.id === value);
        if (selectedDistrict) {
          newData.districtid = selectedDistrict.id;
          newData.district_name = selectedDistrict.name;
          // Reset dependent fields
          newData.villageid = "";
          newData.village_name = "";
        }
      } else if (name === "villageid") {
        const selectedVillage = villages?.find((v) => v.id.trim() === value);
        if (selectedVillage) {
          newData.villageid = selectedVillage.id.trim();
          newData.village_name = selectedVillage.name;
        }
      } else {
        newData[name] = value;
      }

      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.promise(
      addStudentData(formData)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses data...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      onRefetch();
    }

    if (isError) {
      reset();
    }
  }, [isSuccess, isError, reset, onRefetch]);

  return (
    <div className="container mt-3">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="entryid" className="form-label">
                Tahun Pelajaran
              </label>
              <select
                id="entryid"
                className="form-select"
                aria-label="Pilih Tahun Pelajaran"
                name="entryid"
                value={formData.entryid}
                onChange={handleChange}
              >
                <option value="" hidden>
                  Pilih Tahun Pelajaran
                </option>
                {periode?.map((periode) => (
                  <option key={periode.id} value={periode.id}>
                    {periode.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="homebaseid" className="form-label">
                Satuan Pendidikan
              </label>
              <select
                id="homebaseid"
                className="form-select"
                aria-label="Pilih Satuan Pendidikan"
                name="homebaseid"
                value={formData.homebaseid}
                onChange={handleChange}
              >
                <option value="" hidden>
                  Pilih Satuan Pendidikan
                </option>
                {homebase?.map((homebase) => (
                  <option key={homebase.id} value={homebase.id}>
                    {homebase.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                className="form-control"
                placeholder="Nama Lengkap"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="nisn" className="form-label">
                NISN
              </label>
              <input
                id="nisn"
                type="text"
                className="form-control"
                placeholder="NISN"
                name="nisn"
                value={formData.nisn}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="nis" className="form-label">
                NIS
              </label>
              <input
                id="nis"
                type="text"
                className="form-control"
                placeholder="NIS"
                name="nis"
                value={formData.nis}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="gender" className="form-label">
                Jenis Kelamin
              </label>
              <select
                id="gender"
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="" hidden>
                  Pilih Jenis Kelamin
                </option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="birth_place" className="form-label">
                Tempat Lahir
              </label>
              <input
                id="birth_place"
                type="text"
                className="form-control"
                placeholder="Tempat Lahir"
                name="birth_place"
                value={formData.birth_place}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="birth_date" className="form-label">
                Tanggal Lahir
              </label>
              <input
                id="birth_date"
                type="date"
                className="form-control"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="siblings" className="form-label">
                Jumlah Keluarga
              </label>
              <input
                id="siblings"
                type="number"
                className="form-control"
                placeholder="Jumlah Keluarga"
                name="siblings"
                value={formData.siblings}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="order_number" className="form-label">
                Urutan Kelahiran
              </label>
              <input
                id="order_number"
                type="text"
                className="form-control"
                placeholder="Urutan Kelahiran"
                name="order_number"
                value={formData.order_number}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="height" className="form-label">
                Tinggi Badan (cm)
              </label>
              <input
                id="height"
                type="text"
                className="form-control"
                placeholder="TB"
                name="height"
                value={formData.height}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="weight" className="form-label">
                Berat Badan (kg)
              </label>
              <input
                id="weight"
                type="text"
                className="form-control"
                placeholder="BB"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="head" className="form-label">
                Lingkar Kepala (cm)
              </label>
              <input
                id="head"
                type="text"
                className="form-control"
                placeholder="Lingkar Kepala"
                name="head"
                value={formData.head}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="provinceid" className="form-label">
                Provinsi
              </label>
              <select
                id="provinceid"
                className="form-select"
                aria-label="Pilih Provinsi"
                name="provinceid"
                value={formData.provinceid}
                onChange={handleChange}
              >
                <option value="" hidden>
                  Pilih Provinsi
                </option>
                {provinces?.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="cityid" className="form-label">
                Kota/Kabupaten
              </label>
              <select
                id="cityid"
                className="form-select"
                aria-label="Pilih Kota / Kabupaten"
                name="cityid"
                value={formData.cityid}
                onChange={handleChange}
                disabled={!formData.provinceid}
              >
                <option value="" hidden>
                  Pilih Kota / Kabupaten
                </option>
                {cities?.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="districtid" className="form-label">
                Kecamatan
              </label>
              <select
                id="districtid"
                className="form-select"
                aria-label="Pilih Kecamatan"
                name="districtid"
                value={formData.districtid}
                onChange={handleChange}
                disabled={!formData.cityid}
              >
                <option value="" hidden>
                  Pilih Kecamatan
                </option>
                {districts?.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="villageid" className="form-label">
                Desa/Kelurahan
              </label>
              <select
                id="villageid"
                className="form-select"
                aria-label="Pilih Desa"
                name="villageid"
                value={formData.villageid}
                onChange={handleChange}
                disabled={!formData.districtid}
              >
                <option value="" hidden>
                  Pilih Desa
                </option>
                {villages?.map((village) => (
                  <option key={village.id} value={village.id.trim()}>
                    {village.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="postal_code" className="form-label">
                Kode Pos
              </label>
              <input
                id="postal_code"
                type="text"
                className="form-control"
                placeholder="Kode Pos"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                Alamat Lengkap
              </label>
              <textarea
                id="address"
                className="form-control"
                rows="4"
                placeholder="Alamat"
                name="address"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-12 text-end">
            <button type="submit" className="btn btn-sm btn-success">
              Simpan Data
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Biodata;
