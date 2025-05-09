import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import MainPage from "./page/MainPage";
import StudentInfo from "./page/StudentInfoPage";
import CounselingPage from "./page/CounselingPage";
import CounselingWritePage from "./page/CounselingWritePage";
import FeedbackPage from "./page/FeedbackPage";
import SignInPage from "./page/SignInPage";
import StudentManagementPage from "./page/StudentManagementPage";
import GradePage from "./page/GradePage";
import ReportPage from "./page/ReportPage";
import AdminPage from "./page/AdminPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route
          path="/main"
          element={
            <MainLayout>
              <MainPage />
            </MainLayout>
          }
        />

        {/* ★ 관리자 전용 */}
        <Route
          path="/admin"
          element={
            <MainLayout>
              <AdminPage />
            </MainLayout>
          }
        />
        
        <Route
          path="/student-info"
          element={
            <MainLayout>
              <StudentInfo />
            </MainLayout>
          }
        />
        <Route
          path="/counseling"
          element={
            <MainLayout>
              <CounselingPage />
            </MainLayout>
          }
        />
        <Route
          path="/counseling/write"
          element={
            <MainLayout>
              <CounselingWritePage />
            </MainLayout>
          }
        />
        <Route
          path="/feedback"
          element={
            <MainLayout>
              <FeedbackPage />
            </MainLayout>
          }
        />
        <Route
          path="/student-manage"
          element={
            <MainLayout>
              <StudentManagementPage />
            </MainLayout>
          }
        />
        <Route
          path="/grade"
          element={
            <MainLayout>
              <GradePage />
            </MainLayout>
          }
        />
        <Route
          path="/report"
          element={
            <MainLayout>
              <ReportPage />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
