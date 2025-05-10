import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import useragent from "express-useragent";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Otentikasi
import routerAuth from "./router/auth/routerAuth.js";

// CMS
import routerHomepage from "./router/cms/routerHomepage.js";
import routerReason from "./router/cms/routerReason.js";
import routerFacility from "./router/cms/routerFacility.js";
import routerTestimoni from "./router/cms/routerTestimoni.js";
import routerCategory from "./router/cms/routerCategory.js";
import routerNews from "./router/cms/routerNews.js";

// Admin Pusat
import routerHomebase from "./router/center/routerHomebase.js";
import routerAdmin from "./router/center/routerAdmin.js";
import routerCenterData from "./router/center/routerCenterData.js";
import routerApp from "./router/center/routerApp.js";

// Admin Satuan
import routerPeriode from "./router/admin/routerPeriode.js";
import routerGrade from "./router/admin/routerGrade.js";
import routerStudent from "./router/admin/routerStudent.js";
import routerMajor from "./router/admin/routerMajor.js";
import routerClass from "./router/admin/routerClass.js";
import routerTeacher from "./router/admin/routerTeacher.js";
import routerSubject from "./router/admin/routerSubject.js";
import routerGraduation from "./router/admin/routerGraduation.js";

// CBT
import routerBank from "./router/cbt/routerBank.js";
import routerExam from "./router/cbt/routerExam.js";
import routerAnswer from "./router/cbt/routerAnswer.js";

// LMS
import routerChapter from "./router/lms/routerChapter.js";
import routerLmsStudent from "./router/lms/routerLms.js";

// Tahfiz
import routerSurah from "./router/tahfiz/routerSurah.js";
import routerScoring from "./router/tahfiz/routerScoring.js";
import routerExaminer from "./router/tahfiz/routerExaminer.js";
import routerMetrics from "./router/tahfiz/routerMetrics.js";
import routerReport from "./router/tahfiz/routerReport.js";

// Dashboard
import routerDash from "./router/dashboard/routerDash.js";

// Logs
import routerLogs from "./router/logs/routersLogs.js";

// Database
import routerArea from "./router/database/routerArea.js";
import routerDatabase from "./router/database/routerDatabase.js";

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(useragent.express());
// Static Folder
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Router
app.use("/api/auth", routerAuth);

app.use("/api/cms/homepage", routerHomepage);
app.use("/api/cms/reasons", routerReason);
app.use("/api/cms/facilities", routerFacility);
app.use("/api/cms/testimonies", routerTestimoni);
app.use("/api/cms/categories", routerCategory);
app.use("/api/cms/news", routerNews);

app.use("/api/center/homebase", routerHomebase);
app.use("/api/center/admin", routerAdmin);
app.use("/api/center/data", routerCenterData);
app.use("/api/center/app", routerApp);

app.use("/api/admin/periode", routerPeriode);
app.use("/api/admin/major", routerMajor);
app.use("/api/admin/grade", routerGrade);
app.use("/api/admin/student", routerStudent);
app.use("/api/admin/class", routerClass);
app.use("/api/admin/teacher", routerTeacher);
app.use("/api/admin/subject", routerSubject);
app.use("/api/admin/graduation", routerGraduation);
app.use("/api/bank", routerBank);
app.use("/api/exam", routerExam);
app.use("/api/answer", routerAnswer);
app.use("/api/chapter", routerChapter);
app.use("/api/lms", routerLmsStudent);

app.use("/api/quran", routerSurah);
app.use("/api/scoring", routerScoring);
app.use("/api/examiner", routerExaminer);
app.use("/api/metrics", routerMetrics);
app.use("/api/report", routerReport);

app.use("/api/dash", routerDash);

app.use("/api/logs", routerLogs);

app.use("/api/area", routerArea);
app.use("/api/database", routerDatabase);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
  // Give time for logging before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString(),
  });
});

export default app;
