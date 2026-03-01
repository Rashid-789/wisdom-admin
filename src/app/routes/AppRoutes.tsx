import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import RequireAdmin from "../../auth/RequireAdmin";
import NotFoundPage from "../../pages/Dashboard/NotFoundPage";
import DashboardPage from "../../pages/Dashboard/DashboardPage";
import ForgotPasswordPage from "../../pages/auth/ForgotPasswordPage";
import LoginPage from "../../pages/auth/LoginPage";
import BooksLayoutPage from "../../pages/books/BooksLayoutPage";
import BooksPage from "../../pages/books/pages/BooksPage";
import ContentLayoutPage from "../../pages/content/layout/ContentLayoutPage";
import BasicCoursesPage from "../../pages/content/courses/BasicCoursesPage";
import SkillCoursesPage from "../../pages/content/courses/SkillCoursesPage";
import CourseChaptersPage from "../../pages/content/courses/chapters/CourseChaptersPage";
import ChapterTopicsPage from "../../pages/content/courses/topics/ChapterTopicsPage";
import LiveClassDetailsPage from "../../pages/live-classes/details/LiveClassDetailsPage";
import LiveClassesCalendarPage from "../../pages/live-classes/calendar/LiveClassesCalendarPage";
import LiveClassesLayoutPage from "../../pages/live-classes/LiveClassesLayoutPage";
import LiveClassesPage from "../../pages/live-classes/sessions/LiveClassesPage";
import SettingsLayoutPage, { SettingsIndexRedirect } from "../../pages/settings/SettingsLayoutPage";
import SettingsAccountPage from "../../pages/settings/account/SettingsAccountPage";
import SettingsNotificationsPage from "../../pages/settings/notifications/SettingsNotificationsPage";
import UsersLayoutPage from "../../pages/users/UsersLayoutPage";
import UsersListPage from "../../pages/users/UsersListPage";
import AdminLayout from "../layout/AdminLayout/AdminLayout";
import BookSubjectDetailsPage from "../../pages/books/pages/BookSubjectDetailsPage";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="users" element={<UsersLayoutPage />}>
            <Route index element={<UsersListPage />} />
            <Route path="students" element={<Navigate to="/admin/users" replace />} />
            <Route path="teachers" element={<Navigate to="/admin/users" replace />} />
            <Route path="admins" element={<Navigate to="/admin/users" replace />} />
          </Route>

          <Route path="content" element={<ContentLayoutPage />}>
            <Route index element={<Navigate to="basic-courses" replace />} />
            <Route path="basic-courses" element={<BasicCoursesPage />} />
            <Route path="skill-courses" element={<SkillCoursesPage />} />
            <Route path="courses/:courseId" element={<CourseChaptersPage />} />
            <Route path="courses/:courseId/chapters/:chapterId" element={<ChapterTopicsPage />} />
            <Route path="courses" element={<Navigate to="/admin/content/basic-courses" replace />} />
          </Route>

          <Route path="live-classes" element={<LiveClassesLayoutPage />}>
            <Route index element={<LiveClassesPage />} />
            <Route path="calendar" element={<LiveClassesCalendarPage />} />
            <Route path=":id" element={<LiveClassDetailsPage />} />
          </Route>
<Route path="/admin/books" element={<BooksLayoutPage />}>
  <Route index element={<BooksPage />} />
  <Route path=":id" element={<BookSubjectDetailsPage />} />
</Route>

          <Route path="settings" element={<SettingsLayoutPage />}>
            <Route index element={<SettingsIndexRedirect />} />
            <Route path="account" element={<SettingsAccountPage />} />
            <Route path="notifications" element={<SettingsNotificationsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
