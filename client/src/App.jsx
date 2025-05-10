import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Meta from "./components/meta/Meta";
import { useDispatch } from "react-redux";
import { useLoadUserMutation } from "./controller/api/auth/ApiAuth";
import { setLogin } from "./controller/slice/AuthSlice";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LoadingScreen from "./components/loader/LoadingScreen";
import { useGetAppQuery } from "./controller/api/center/ApiApp";
import Homepage from "./home/Homepage";

// Otentikasi
const Activation = lazy(() => import("./components/auth/Activation"));
const Signin = lazy(() => import("./components/auth/Signin"));

// Public
const News = lazy(() => import("./home/news/News"));
const Detail = lazy(() => import("./home/news/Detail"));

// CMS
const CmsDash = lazy(() => import("./page/cms/Dashboard/CmsDash"));
const CmsNews = lazy(() => import("./page/cms/News/NewsPage"));
const CmsReasons = lazy(() => import("./page/cms/Reasons/ReasonsPage"));
const CmsFacilities = lazy(() =>
  import("./page/cms/Facilities/FacilitiesPage")
);
const CmsTestimonials = lazy(() =>
  import("./page/cms/Testimonials/TestimonialsPage")
);
const CmsGraduation = lazy(() =>
  import("./page/cms/Graduation/GraduationPage")
);
const CmsCategories = lazy(() =>
  import("./page/cms/Categories/CategoriesPage")
);
const CmsSettings = lazy(() => import("./page/cms/Settings/SettingsPage"));

// Admin Pusat
const CenterDash = lazy(() => import("./page/center/dashboard/CenterDash"));
const CenterHomebase = lazy(() =>
  import("./page/center/homebase/CenterHomebase")
);
const CenterAdmin = lazy(() => import("./page/center/admin/CenterAdmin"));
const CenterTeacher = lazy(() => import("./page/center/teacher/CenterTeacher"));
const CenterStudents = lazy(() =>
  import("./page/center/student/CenterStudents")
);
const CenterMarket = lazy(() => import("./page/center/market/CenterMarket"));
const CenterSetting = lazy(() => import("./page/center/setting/CenterSetting"));

// Admin Satuan
const AdminDash = lazy(() => import("./page/admin/dashboard/AdminDash"));
const AdminMajor = lazy(() => import("./page/admin/major/AdminMajor"));
const AdminPeriode = lazy(() => import("./page/admin/periode/AdminPeriode"));
const AdminGrade = lazy(() => import("./page/admin/grade/AdminGrade"));
const AdminGraduation = lazy(() =>
  import("./page/admin/graduation/AdminGraduation")
);
const AdminStudents = lazy(() => import("./page/admin/student/AdminStudents"));
const AdminTeachers = lazy(() => import("./page/admin/teacher/AdminTeachers"));
const AdminClass = lazy(() => import("./page/admin/class/AdminClass"));
const AdminSubject = lazy(() => import("./page/admin/subject/AdminSubject"));
const AdminCbt = lazy(() => import("./page/admin/cbt/AdminCbt"));
const AdminExam = lazy(() => import("./page/admin/cbt/AdminExam"));
const AdminProfile = lazy(() => import("./page/admin/profile/AdminProfile"));

// Teacher
const TeacherDash = lazy(() => import("./page/teacher/dashboard/TeacherDash"));
const TeacherCbt = lazy(() => import("./page/teacher/cbt/TeacherCbt"));
const TeacherExam = lazy(() => import("./page/teacher/cbt/TeacherExam"));
const TeacherDatabase = lazy(() =>
  import("./page/teacher/database/TeacherDatabase")
);
const TeacherProfile = lazy(() =>
  import("./page/teacher/profile/TeacherProfile")
);

// Student
const StudentDash = lazy(() => import("./page/student/Dashborad/StudentDash"));
const StudentSubject = lazy(() =>
  import("./page/student/subjects/StudentSubject")
);
const StudentCbt = lazy(() => import("./page/student/cbt/StudentCbt"));
const StudentProfile = lazy(() =>
  import("./page/student/profile/StudentProfile")
);

// CBT
const CbtAddQues = lazy(() => import("./page/cbt/bank/CbtAddQues"));
const CbtQuesList = lazy(() => import("./page/cbt/bank/CbtQuesList"));
const StartPage = lazy(() => import("./page/cbt/student/start/StartPage"));
const ExamReport = lazy(() => import("./page/cbt/exam/report/ExamReport"));

// LMS
const TeacherSubject = lazy(() => import("./page/teacher/lms/TeacherSubject"));
const LmsSubject = lazy(() => import("./page/lms/subject/LmsSubject"));
const Subject = lazy(() => import("./page/lms/list/Subject"));

// Tahfiz
const TahfizDash = lazy(() => import("./page/tahfiz/dashboard/TahfizDash"));
const TahfizJuz = lazy(() => import("./page/tahfiz/juz/TahfizJuz"));
const TahfizSurah = lazy(() => import("./page/tahfiz/surah/TahfizSurah"));
const TahfizTarget = lazy(() => import("./page/tahfiz/target/TahfizTarget"));
const TahfizExaminer = lazy(() =>
  import("./page/tahfiz/examnier/TahfizExaminer")
);
const TahfizType = lazy(() => import("./page/tahfiz/type/TahfizType"));
const TahfizMetric = lazy(() => import("./page/tahfiz/metric/TahfizMetric"));
const TahfizMemo = lazy(() => import("./page/tahfiz/memo/TahfizMemo"));
const TahfizStudent = lazy(() => import("./page/tahfiz/memo/TahfizStudent"));
const TahfizReport = lazy(() => import("./page/tahfiz/report/TahfizReport"));
const StudentReport = lazy(() => import("./page/tahfiz/report/StudentReport"));
const TahfizProfile = lazy(() => import("./page/tahfiz/profile/TahfizProfile"));

// Database
const DbPage = lazy(() => import("./page/Database/DbPage"));
const DbList = lazy(() => import("./page/Database/DbList"));

function App() {
  const dispatch = useDispatch();
  const [loadUser] = useLoadUserMutation();
  const { data: appData } = useGetAppQuery();

  // Update favicon when app.logo is available
  useEffect(() => {
    if (appData?.logo) {
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon) {
        favicon.href = appData.logo;
      } else {
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.type = "image/svg+xml";
        newFavicon.href = appData.logo;
        document.head.appendChild(newFavicon);
      }
    }
  }, [appData]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Use a timeout to prevent hanging if the server doesn't respond
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), 10000)
        );

        // Race between the actual request and the timeout
        const response = await Promise.race([
          loadUser().unwrap(),
          timeoutPromise,
        ]);

        dispatch(setLogin(response));
      } catch (error) {
        // Don't show error to user, just silently fail
        // This allows the app to continue functioning for non-logged in users
        console.error("Error loading user data:", error);
      }
    };

    // Always fetch user data from server on app load
    fetchUser();
  }, [dispatch, loadUser]);

  return (
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <Toaster />
        <Meta
          title={"Nuraida Islamic Boarding School"}
          desc={
            "Nuraida Islamic Boarding School adalah sekolah yang berdedikasi untuk pendidikan Islam yang berkualitas tinggi."
          }
          favicon={appData?.logo}
        />
        <Suspense fallback={<LoadingScreen logo={appData?.logo} />}>
          <Routes>
            <Route path='*' element={<Homepage />} />

            <Route path='/' element={<Homepage />} />

            <Route path='/berita' element={<News />} />

            <Route path='/berita/:id' element={<Detail />} />

            {/* Otentikasi */}
            <Route path='/aktivasi-akun/:code' element={<Activation />} />

            <Route path='/signin' element={<Signin />} />

            {/* CMS */}

            <Route path='/cms-dashboard' element={<CmsDash />} />

            <Route path='/cms-news' element={<CmsNews />} />

            <Route path='/cms-reason' element={<CmsReasons />} />

            <Route path='/cms-facility' element={<CmsFacilities />} />

            <Route path='/cms-testimoni' element={<CmsTestimonials />} />

            <Route path='/cms-graduation' element={<CmsGraduation />} />

            <Route path='/cms-category' element={<CmsCategories />} />

            <Route path='/cms-settings' element={<CmsSettings />} />

            {/* Admin Pusat */}
            <Route path='/center-dashboard' element={<CenterDash />} />

            <Route path='/center-satuan' element={<CenterHomebase />} />

            <Route path='/center-admin' element={<CenterAdmin />} />

            <Route path='/center-guru' element={<CenterTeacher />} />

            <Route path='/center-siswa' element={<CenterStudents />} />

            <Route path='/center-market' element={<CenterMarket />} />

            <Route path='/center-pengaturan' element={<CenterSetting />} />

            {/*Admin Satuan */}
            <Route path='/admin-dashboard' element={<AdminDash />} />

            <Route path='/admin-jurusan' element={<AdminMajor />} />

            <Route path='/admin-periode' element={<AdminPeriode />} />

            <Route path='/admin-tingkat' element={<AdminGrade />} />

            <Route path='/admin-lulusan' element={<AdminGraduation />} />

            <Route path='/admin-siswa' element={<AdminStudents />} />

            <Route path='/admin-guru' element={<AdminTeachers />} />

            <Route path='/admin-kelas' element={<AdminClass />} />

            <Route path='/admin-mapel' element={<AdminSubject />} />

            <Route path='/admin-cbt-bank' element={<AdminCbt />} />

            <Route path='/admin-cbt-exam' element={<AdminExam />} />

            <Route path='/admin-profile' element={<AdminProfile />} />

            {/* Teacher */}
            <Route path='/guru-dashboard' element={<TeacherDash />} />

            <Route path='/guru-bank' element={<TeacherCbt />} />

            <Route path='/guru-ujian' element={<TeacherExam />} />

            <Route
              path='/guru-wali-kelas/:classname/:classid'
              element={<TeacherDatabase />}
            />

            <Route path='/guru-profile' element={<TeacherProfile />} />

            {/* Student */}
            <Route path='/siswa-dashboard' element={<StudentDash />} />

            <Route path='/siswa-pelajaran' element={<StudentSubject />} />

            <Route path='/siswa-daftar-ujian' element={<StudentCbt />} />

            <Route path='/siswa-profile' element={<StudentProfile />} />

            {/* CBT */}
            <Route
              path='/admin-cbt-bank/:subject/:name/:bankid'
              element={<CbtQuesList />}
            />

            <Route
              path='/admin-cbt-bank/:subject/:name/:bankid/tambah-soal'
              element={<CbtAddQues />}
            />

            <Route
              path='/admin-cbt-bank/:subject/:name/:bankid/:questionid/edit-soal'
              element={<CbtAddQues />}
            />

            <Route
              path='/siswa-cbt/:name/:examid/:token'
              element={<StartPage />}
            />

            <Route
              path='/laporan-ujian/:name/:examid/:token'
              element={<ExamReport />}
            />

            {/* LMS */}
            <Route path='/guru-mapel' element={<TeacherSubject />} />

            <Route path='/guru-mapel/:name/:id' element={<LmsSubject />} />

            <Route path='/pelajaran/:name/:id' element={<Subject />} />

            {/* Tahfiz */}
            <Route path='/tahfiz-dashboard' element={<TahfizDash />} />

            <Route path='/tahfiz-juz' element={<TahfizJuz />} />

            <Route path='/tahfiz-surah' element={<TahfizSurah />} />

            <Route path='/tahfiz-target' element={<TahfizTarget />} />

            <Route path='/tahfiz-penguji' element={<TahfizExaminer />} />

            <Route path='/tahfiz-penilaian' element={<TahfizType />} />

            <Route path='/tahfiz-metrik' element={<TahfizMetric />} />

            <Route path='/tahfiz-hafalan' element={<TahfizMemo />} />

            <Route
              path='/tahfiz-hafalan-siswa/:periodeId/:name/:userid'
              element={<TahfizStudent />}
            />

            <Route path='/tahfiz-laporan' element={<TahfizReport />} />

            <Route
              path='/tahfiz-laporan-siswa/:userid/:name'
              element={<StudentReport />}
            />

            <Route path='/tahfiz-profile' element={<TahfizProfile />} />

            {/* Database */}
            <Route path='/database/:userid/:name' element={<DbPage />} />

            <Route path='/database' element={<DbList />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </DndProvider>
  );
}

export default App;
