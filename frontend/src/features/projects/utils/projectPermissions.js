export const hasProjectPermission = (user, permission) => {
  const role = String(user?.role || '').toUpperCase();
  // Project access is role-based by product requirement: administrators and
  // managers can manage projects, while regular users can only view details.
  if (['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION_ADMIN', 'MANAGER', 'PROJECT_MANAGER'].includes(role)) return true;
  return permission === 'PROJECT_VIEW' && Array.isArray(user?.permissions) && user.permissions.includes(permission);
};
