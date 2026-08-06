import { MOCK_USERS } from '../../../features/tasks/hooks/useTasks';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('etms_user') || 'null');
  } catch {
    return null;
  }
};

const nameMap = (() => {
  const currentUser = getStoredUser();
  const map = {};
  (MOCK_USERS || []).forEach((user) => {
    map[user.id] = user.fullName || `${user.firstName} ${user.lastName}`.trim();
  });
  if (currentUser?.id) {
    const name = currentUser.fullName || [currentUser.firstName, currentUser.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (name) map[currentUser.id] = name;
  }
  return map;
})();

export const resolveDisplayName = (authorId, authorName) => {
  if (authorName) return authorName;
  if (!authorId) return 'Unknown';
  return nameMap[String(authorId)] || `User ${String(authorId).slice(-4)}`;
};
