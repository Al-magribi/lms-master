# Penjelasan Relasi Tabel Database LMS

## 1. Struktur Akademik Inti

- `a_homebase` adalah entitas tingkat atas yang merepresentasikan institusi pendidikan
- `a_grade` terhubung ke `a_homebase` (relasi one-to-many)
- `a_class` terhubung ke `a_grade` (relasi one-to-many)
- `a_major` terhubung ke `a_homebase` (relasi one-to-many)
- `a_periode` terhubung ke `a_homebase` (relasi one-to-many)
- `a_subject` terhubung ke `a_homebase` (relasi one-to-many)

## 2. Manajemen Pengguna

- `u_admin` terhubung ke `a_homebase` (relasi one-to-many)
- `u_teachers` terhubung ke `a_homebase` dan opsional ke `a_class` (untuk wali kelas)
- `u_students` terhubung ke `a_homebase`
- `u_parents` terhubung ke `u_students` (relasi one-to-one)

## 3. Pengajaran dan Pembelajaran

- `at_class` menghubungkan guru ke kelas dan mata pelajaran (relasi many-to-many)
- `at_subject` menghubungkan guru ke mata pelajaran (relasi many-to-many)
- `l_chapter` terhubung ke `a_subject` dan `u_teachers`
- `l_content` terhubung ke `l_chapter`
- `l_file` terhubung ke `l_content`
- `l_cclass` menghubungkan bab ke kelas (relasi many-to-many)

## 4. Sistem Ujian

- `c_bank` terhubung ke `a_homebase`, `a_subject`, dan `u_teachers`
- `c_question` terhubung ke `c_bank`
- `c_exam` terhubung ke `a_homebase` dan `u_teachers`
- `c_class` menghubungkan ujian ke kelas (relasi many-to-many)
- `c_ebank` menghubungkan ujian ke bank soal
- `c_answer` terhubung ke `u_students` dan `c_question`

## 5. Manajemen Kelas Siswa

- `cl_students` menghubungkan siswa ke kelas dan periode (relasi many-to-many)

## 6. Sistem Pembelajaran Al-Quran

- `t_juz` merepresentasikan bagian Al-Quran
- `t_surah` merepresentasikan surat Al-Quran
- `t_juzitems` menghubungkan juz ke surat dengan rentang ayat tertentu
- `t_target` menghubungkan kelas ke target juz
- `t_process` melacak kemajuan siswa dalam pembelajaran Al-Quran
- `t_scoring` melacak nilai siswa dengan berbagai kriteria
- `t_categories` dan `t_indicators` untuk kriteria penilaian
- `t_examiner` untuk penguji
- `t_type` untuk berbagai jenis penilaian

## 7. Sistem Logging

- `logs` melacak aktivitas siswa, guru, dan admin

## Catatan

Database ini merupakan Learning Management System (LMS) dengan fitur-fitur untuk:

- Manajemen akademik (kelas, tingkatan, mata pelajaran)
- Manajemen pengguna (admin, guru, siswa, orang tua)
- Manajemen konten (bab, file, video)
- Sistem ujian (bank soal, ujian, jawaban)
- Pembelajaran dan penilaian Al-Quran
- Pencatatan aktivitas

Database menggunakan foreign key constraints untuk menjaga integritas referensial antar tabel terkait. Sebagian besar tabel menyertakan timestamp `createdat` untuk melacak kapan record dibuat.
