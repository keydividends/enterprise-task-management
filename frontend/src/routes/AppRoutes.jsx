import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import MainLayout from '../layouts/MainLayout';
import TaskListPage from '../features/tasks/pages/TaskListPage';
import TaskBoardPage from '../features/tasks/pages/TaskBoardPage';
import TaskDetailsPage from '../features/tasks/pages/TaskDetailsPage';
import CreateTaskPage from '../features/tasks/pages/CreateTaskPage';
import EditTaskPage from '../features/tasks/pages/EditTaskPage';
import TeamListPage from '../features/teams/pages/TeamListPage';
import TeamDetailsPage from '../features/teams/pages/TeamDetailsPage';
import CreateTeamPage from '../features/teams/pages/CreateTeamPage';
import EditTeamPage from '../features/teams/pages/EditTeamPage';

const AppRoutes = ({ toggleTheme }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout toggleTheme={toggleTheme} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/tasks/board" element={<TaskBoardPage />} />
          <Route path="/tasks/new" element={<CreateTaskPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
          <Route path="/tasks/:taskId/edit" element={<EditTaskPage />} />
          <Route path="/teams" element={<TeamListPage />} />
          <Route path="/teams/create" element={<CreateTeamPage />} />
          <Route path="/teams/new" element={<CreateTeamPage />} />
          <Route path="/teams/:teamId" element={<TeamDetailsPage />} />
          <Route path="/teams/:teamId/edit" element={<EditTeamPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
