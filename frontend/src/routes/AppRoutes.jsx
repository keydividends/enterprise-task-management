import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import MainLayout from '../layouts/MainLayout';

import UserListPage from '../features/users/pages/UserListPage';
import CreateUserPage from '../features/users/pages/CreateUserPage';
import EditUserPage from '../features/users/pages/EditUserPage';
import UserDetailsPage from '../features/users/pages/UserDetailsPage';
import ProfilePage from '../features/users/pages/ProfilePage';
import TaskListPage from '../features/tasks/pages/TaskListPage';
import TaskBoardPage from '../features/tasks/pages/TaskBoardPage';
import TaskDetailsPage from '../features/tasks/pages/TaskDetailsPage';
import CreateTaskPage from '../features/tasks/pages/CreateTaskPage';
import EditTaskPage from '../features/tasks/pages/EditTaskPage';
import TeamListPage from '../features/teams/pages/TeamListPage';
import TeamDetailsPage from '../features/teams/pages/TeamDetailsPage';
import CreateTeamPage from '../features/teams/pages/CreateTeamPage';
import EditTeamPage from '../features/teams/pages/EditTeamPage';
import TeamMembersPage from '../features/teams/pages/TeamMembersPage';
import RoleListPage from '../features/roles/pages/RoleListPage';
import CreateRolePage from '../features/roles/pages/CreateRolePage';
import EditRolePage from '../features/roles/pages/EditRolePage';
import RoleDetailsPage from '../features/roles/pages/RoleDetailsPage';
import ProjectListPage from '../features/projects/pages/ProjectListPage';
import CreateProjectPage from '../features/projects/pages/CreateProjectPage';
import EditProjectPage from '../features/projects/pages/EditProjectPage';
import ProjectDetailsPage from '../features/projects/pages/ProjectDetailsPage';

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
          <Route path="/users" element={<UserListPage />} />
          <Route path="/users/create" element={<CreateUserPage />} />
          <Route path="/users/:userId" element={<UserDetailsPage />} />
          <Route path="/users/:userId/edit" element={<EditUserPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/tasks/board" element={<TaskBoardPage />} />
          <Route path="/tasks/new" element={<CreateTaskPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
          <Route path="/tasks/:taskId/edit" element={<EditTaskPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/create" element={<CreateProjectPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/projects/:projectId/edit" element={<EditProjectPage />} />
          <Route path="/teams" element={<TeamListPage />} />
          <Route path="/teams/create" element={<CreateTeamPage />} />
          <Route path="/teams/new" element={<CreateTeamPage />} />
          <Route path="/teams/:teamId" element={<TeamDetailsPage />} />
          <Route path="/teams/:teamId/edit" element={<EditTeamPage />} />
          <Route path="/teams/:teamId/members" element={<TeamMembersPage />} />
          <Route path="/roles" element={<RoleListPage />} />
          <Route path="/roles/create" element={<CreateRolePage />} />
          <Route path="/roles/:roleId" element={<RoleDetailsPage />} />
          <Route path="/roles/:roleId/edit" element={<EditRolePage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
