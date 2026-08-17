import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import projectService from '../services/projectService';
import userService from '../../users/services/userService';

const employeeCode = (user) => user?.customId || user?.employeeId || user?.user_id || '';
const employeeName = (user) => user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || employeeCode(user);

const ProjectMemberManager = ({ projectId, members = [], onMembersChange, onMessage, onError, canManageMembers = false }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [submitting, setSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    const query = employeeId.trim();
    clearTimeout(searchTimerRef.current);

    if (!canManageMembers || !isUserPickerOpen) {
      setAvailableUsers([]);
      setLoadingUsers(false);
      return undefined;
    }

    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await userService.searchUsers(query, 10);
        setAvailableUsers((Array.isArray(response?.data) ? response.data : []).filter(employeeCode));
      } catch (error) {
        setAvailableUsers([]);
        onError?.(error?.response?.data?.message || 'Unable to load available users.');
      } finally {
        setLoadingUsers(false);
      }
    };

    if (query) searchTimerRef.current = setTimeout(loadUsers, 250);
    else loadUsers();

    return () => clearTimeout(searchTimerRef.current);
  }, [employeeId, canManageMembers, isUserPickerOpen, onError]);

  const selectableUsers = useMemo(() => {
    const existingIds = new Set(members.map((member) => String(member.employeeId || '')));
    return availableUsers.filter((user) => !existingIds.has(String(employeeCode(user))));
  }, [availableUsers, members]);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!employeeId.trim()) {
      onError?.('Select a user from the available-user list.');
      return;
    }

    setSubmitting(true);
    try {
      const member = await projectService.addProjectMember(projectId, { employeeId: employeeId.trim(), projectRole: role });
      onMembersChange?.([...members, member]);
      setEmployeeId('');
      setIsUserPickerOpen(false);
      onMessage?.('Member added successfully.');
    } catch (error) {
      onError?.(error?.response?.data?.message || error?.message || 'Unable to add project member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberEmployeeId) => {
    try {
      await projectService.removeProjectMember(projectId, memberEmployeeId);
      onMembersChange?.(members.filter((member) => member.employeeId !== memberEmployeeId));
      onMessage?.('Member removed.');
    } catch (error) {
      onError?.(error?.response?.data?.message || error?.message || 'Unable to remove project member.');
    }
  };

  const memberDisplay = (member) => member.displayName || member.userName || member.name || [member.firstName, member.lastName].filter(Boolean).join(' ') || member.employeeId || 'Unknown employee';

  return (
    <div className="panel-block glass-card project-members-card">
      <div className="panel-header project-members-heading">
        <div><p className="project-section-kicker">Collaboration</p><h3>Project members</h3></div>
      </div>

      {canManageMembers ? (
        <form className="auth-form project-member-form" onSubmit={handleAdd}>
          <div className="field-group project-member-user-field">
            <span>Available users</span>
            <div className="input-wrap">
              <input
                value={employeeId}
                onChange={(event) => {
                  setEmployeeId(event.target.value);
                  setIsUserPickerOpen(true);
                }}
                onFocus={() => setIsUserPickerOpen(true)}
                onBlur={() => setTimeout(() => setIsUserPickerOpen(false), 150)}
                placeholder="Search by name, email, or employee ID"
                autoComplete="off"
              />
            </div>
            {isUserPickerOpen ? <div className="employee-match-menu" role="listbox" aria-label="Available users">
              <p className="employee-match-state">{employeeId.trim() ? 'Search results' : 'All available users'}</p>
              {loadingUsers ? <p className="employee-match-state">Loading users…</p> : null}
              {!loadingUsers && selectableUsers.length === 0 ? <p className="employee-match-state">No available users found.</p> : null}
              {!loadingUsers && selectableUsers.map((user) => (
                <button
                  key={user.id || employeeCode(user)}
                  type="button"
                  className="employee-match-option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setEmployeeId(employeeCode(user));
                    setIsUserPickerOpen(false);
                  }}
                  role="option"
                >
                  <span className="employee-match-avatar">{employeeName(user).charAt(0).toUpperCase()}</span>
                  <span className="employee-match-copy">
                    <strong>{employeeName(user)}</strong>
                    <small>{employeeCode(user)}{user.email ? ` · ${user.email}` : ''}</small>
                  </span>
                </button>
              ))}
            </div> : null}
          </div>
          <div className="field-group project-member-role-field">
            <span>Project role</span>
            <div className="input-wrap">
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="DEVELOPER">Developer</option>
                <option value="QA_TESTER">QA Tester</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
          </div>
          <button type="submit" className="primary-button compact project-member-add-button" disabled={submitting}>
            <UserPlus size={16} /> {submitting ? 'Adding...' : 'Add member'}
          </button>
        </form>
      ) : null}

      <div className="task-list project-member-list">
        {members.length === 0 ? <p className="helper-copy">No members added yet.</p> : members.map((member) => (
          <div key={`${member.employeeId}-${member.projectRole}`} className="task-row project-member-row">
            <div className="project-member-identity">
              <div className="project-member-avatar">{memberDisplay(member).charAt(0).toUpperCase()}</div>
              <div className="project-member-copy">
                <div className="project-member-name">{memberDisplay(member)}</div>
                <div className="project-member-id">{member.employeeId || 'No employee ID'}</div>
              </div>
            </div>
            <div className="task-pill-wrap"><span className="status-tag review">{member.projectRole}</span></div>
            {canManageMembers ? <button type="button" className="ghost-button" onClick={() => handleRemove(member.employeeId)}><Trash2 size={14} /> Remove</button> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectMemberManager;
