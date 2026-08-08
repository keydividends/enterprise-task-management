export const hasProjectPermission = (user, permission) => {
  const isManager = ['ADMIN', 'MANAGER'].includes(user?.role);
  if (permission === 'PROJECT_VIEW') return isManager || user?.permissions?.includes('PROJECT_VIEW');
  return isManager;
};
