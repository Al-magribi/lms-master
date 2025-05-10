import { configureStore } from "@reduxjs/toolkit";
// otentikasi
import AuthSlice from "./slice/AuthSlice";
import { ApiAuth } from "./api/auth/ApiAuth";

// CMS
import { ApiHomepage } from "./api/cms/ApiHomepage";
import { ApiReason } from "./api/cms/ApiReason";
import { ApiFacility } from "./api/cms/ApiFacility";
import { ApiTestimoni } from "./api/cms/ApiTestimoni";
import { ApiCategory } from "./api/cms/ApiCategory";
import { ApiNews } from "./api/cms/ApiNews";

// center
import { ApiHomebase } from "./api/center/ApiHomebase";
import { ApiAdmin } from "./api/center/ApiAdmin";
import { ApiCenterData } from "./api/center/ApiCenterData";
import { ApiApp } from "./api/center/ApiApp";

// Admin satuan
import { ApiPeriode } from "./api/admin/ApiPeriode";
import { ApiGrade } from "./api/admin/ApiGrade";
import { ApiStudent } from "./api/admin/ApiStudent";
import { ApiTeacher } from "./api/admin/ApiTeacher";
import { ApiMajor } from "./api/admin/ApiMajor";
import { ApiClass } from "./api/admin/ApiClass";
import { ApiSubject } from "./api/admin/ApiSubject";
import { ApiGraduation } from "./api/admin/ApiGraduation";

// CBT
import { ApiBank } from "./api/cbt/ApiBank";
import { ApiExam } from "./api/cbt/ApiExam";
import { ApiAnswer } from "./api/cbt/ApiAnswer";

// LMS
import { ApiChapter } from "./api/lms/ApiChapter";
import { ApiLms } from "./api/lms/ApiLms";
// Tahfiz
import { ApiQuran } from "./api/tahfiz/ApiQuran";
import { ApiScoring } from "./api/tahfiz/ApiScoring";
import { ApiExaminer } from "./api/tahfiz/ApiExaminer";
import { ApiMetric } from "./api/tahfiz/ApiMetric";
import { ApiReport } from "./api/tahfiz/ApiReport";

// Dashboard
import { ApiDashboard } from "./api/dashboard/ApiDashboard";

// Database
import { ApiDatabase } from "./api/database/ApiDatabase";
import { ApiArea } from "./api/database/ApiArea";

// Logs
import { ApiLog } from "./api/log/ApiLog";

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    [ApiAuth.reducerPath]: ApiAuth.reducer,

    [ApiHomepage.reducerPath]: ApiHomepage.reducer,
    [ApiReason.reducerPath]: ApiReason.reducer,
    [ApiFacility.reducerPath]: ApiFacility.reducer,
    [ApiTestimoni.reducerPath]: ApiTestimoni.reducer,
    [ApiCategory.reducerPath]: ApiCategory.reducer,
    [ApiNews.reducerPath]: ApiNews.reducer,

    [ApiHomebase.reducerPath]: ApiHomebase.reducer,
    [ApiAdmin.reducerPath]: ApiAdmin.reducer,
    [ApiCenterData.reducerPath]: ApiCenterData.reducer,
    [ApiApp.reducerPath]: ApiApp.reducer,

    [ApiPeriode.reducerPath]: ApiPeriode.reducer,
    [ApiGrade.reducerPath]: ApiGrade.reducer,
    [ApiStudent.reducerPath]: ApiStudent.reducer,
    [ApiTeacher.reducerPath]: ApiTeacher.reducer,
    [ApiMajor.reducerPath]: ApiMajor.reducer,
    [ApiClass.reducerPath]: ApiClass.reducer,
    [ApiSubject.reducerPath]: ApiSubject.reducer,
    [ApiGraduation.reducerPath]: ApiGraduation.reducer,

    [ApiBank.reducerPath]: ApiBank.reducer,
    [ApiExam.reducerPath]: ApiExam.reducer,
    [ApiAnswer.reducerPath]: ApiAnswer.reducer,

    [ApiChapter.reducerPath]: ApiChapter.reducer,
    [ApiLms.reducerPath]: ApiLms.reducer,

    [ApiQuran.reducerPath]: ApiQuran.reducer,
    [ApiScoring.reducerPath]: ApiScoring.reducer,
    [ApiExaminer.reducerPath]: ApiExaminer.reducer,
    [ApiMetric.reducerPath]: ApiMetric.reducer,
    [ApiReport.reducerPath]: ApiReport.reducer,

    [ApiDashboard.reducerPath]: ApiDashboard.reducer,

    [ApiLog.reducerPath]: ApiLog.reducer,

    [ApiDatabase.reducerPath]: ApiDatabase.reducer,
    [ApiArea.reducerPath]: ApiArea.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      ApiAuth.middleware,

      ApiHomepage.middleware,
      ApiReason.middleware,
      ApiFacility.middleware,
      ApiTestimoni.middleware,
      ApiCategory.middleware,
      ApiNews.middleware,

      ApiHomebase.middleware,
      ApiAdmin.middleware,
      ApiCenterData.middleware,
      ApiApp.middleware,

      ApiPeriode.middleware,
      ApiGrade.middleware,
      ApiStudent.middleware,
      ApiTeacher.middleware,
      ApiMajor.middleware,
      ApiClass.middleware,
      ApiSubject.middleware,
      ApiGraduation.middleware,

      ApiBank.middleware,
      ApiExam.middleware,
      ApiAnswer.middleware,

      ApiChapter.middleware,
      ApiLms.middleware,
      ApiQuran.middleware,
      ApiScoring.middleware,
      ApiExaminer.middleware,
      ApiMetric.middleware,
      ApiReport.middleware,

      ApiDashboard.middleware,

      ApiLog.middleware,

      ApiDatabase.middleware,
      ApiArea.middleware,
    ]),
});

export default store;
