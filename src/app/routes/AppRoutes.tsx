import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout/AdminLayout";
import RequireAdmin from "../../auth/RequireAdmin";
import NotFoundPage from "../../pages/Dashboard/NotFoundPage";

// Public auth pages
import LoginPage from "../../pages/auth/LoginPage";
import ForgotPasswordPage from "../../pages/auth/ForgotPasswordPage";

// Admin pages (your existing imports)
import DashboardPage from "../../pages/Dashboard/DashboardPage";
import UsersLayoutPage from "../../pages/users/UsersLayoutPage";
import UsersListPage from "../../pages/users/UsersListPage";

import ContentLayoutPage from "../../pages/content/ContentLayoutPage";
import LecturesLibraryPage from "../../pages/content/lectures/LecturesLibraryPage";
import ExercisesBankPage from "../../pages/content/exercises/ExercisesBankPage";
import SubjectsPage from "../../pages/content/subjects/SubjectsPage";
import CoursesPage from "../../pages/content/courses/CoursesPage";
import CourseDetailsPage from "../../pages/content/courses/CourseDetailsPage";

import LiveClassesLayoutPage from "../../pages/live-classes/LiveClassesLayoutPage";
import LiveClassesCalendarPage from "../../pages/live-classes/calendar/LiveClassesCalendarPage";
import LiveClassesPage from "../../pages/live-classes/sessions/LiveClassesPage";
import LiveClassDetailsPage from "../../pages/live-classes/details/LiveClassDetailsPage";

import BooksLayoutPage from "../../pages/books/BooksLayoutPage";
import BooksPage from "../../pages/books/list/BooksPage";
import BookOrdersPage from "../../pages/books/orders/BookOrdersPage";
import BookDetailsPage from "../../pages/books/details/BookDetailsPage";

import PaymentsLayoutPage from "../../pages/payments/Payments layout/PaymentsLayoutPage";
import PaymentsTransactionsPage from "../../pages/payments/Transactions page/TransactionsPage";
import PaymentsPlansPage from "../../pages/payments/plans/PaymentsPlansPage";
import PaymentsRefundsPage from "../../pages/payments/refunds/PaymentsRefundsPage";

import SettingsLayoutPage, { SettingsIndexRedirect } from "../../pages/settings/SettingsLayoutPage";
import SettingsAccountPage from "../../pages/settings/account/SettingsAccountPage";
import SettingsNotificationsPage from "../../pages/settings/notifications/SettingsNotificationsPage";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin (protected) */}
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
            <Route index element={<Navigate to="subjects" replace />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:courseId" element={<CourseDetailsPage />} />
            <Route path="lectures" element={<LecturesLibraryPage />} />
            <Route path="exercises" element={<ExercisesBankPage />} />
          </Route>

          <Route path="live-classes" element={<LiveClassesLayoutPage />}>
            <Route index element={<LiveClassesPage />} />
            <Route path="calendar" element={<LiveClassesCalendarPage />} />
            <Route path=":id" element={<LiveClassDetailsPage />} />
          </Route>

          <Route path="books" element={<BooksLayoutPage />}>
            <Route index element={<BooksPage />} />
            <Route path="orders" element={<BookOrdersPage />} />
            <Route path=":id" element={<BookDetailsPage />} />
          </Route>

          <Route path="payments" element={<PaymentsLayoutPage />}>
            <Route path="transactions" element={<PaymentsTransactionsPage />} />
            <Route path="plans" element={<PaymentsPlansPage />} />
            <Route path="refunds" element={<PaymentsRefundsPage />} />
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
