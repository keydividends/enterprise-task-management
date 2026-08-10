import { useEffect, useRef, useState } from 'react';
import { Trash2, UserPlus, User } from 'lucide-react';
import projectService from '../services/projectService';
import userService from '../../users/services/userService';

const ProjectMemberManager = ({ projectId, members = [], onMembersChange, onMessage, onError, canManageMembers = false }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [submitting, setSubmitting] = useState(false);
  const [employeeMatches, setEmployeeMatches] = useState([]);
  const [isSearchingEmployees, setIsSearchingEmployees] = useState(false);
  const [showEmployeeMatches, setShowEmployeeMatches] = useState(false);
  const searchTimerRef = useRef(null);
  const resolving = false;
  const resolvedUser = null;

  useEffect(() => {
    const query = employeeId.trim();
    clearTimeout(searchTimerRef.current);

    if (!query) {
      setEmployeeMatches([]);
      setIsSearchingEmployees(false);
      return undefined;
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearchingEmployees(true);
      try {
        const response = await userService.searchUsers(query);
        const users = Array.isArray(response?.data) ? response.data : [];
        setEmployeeMatches(users.filter((user) => user.customId || user.employeeId || user.user_id));
      } catch {
        // Search suggestions are optional; member creation still validates the ID.
        setEmployeeMatches([]);
      } finally {
        setIsSearchingEmployees(false);
      }
    }, 250);

    return () => clearTimeout(searchTimerRef.current);
  }, [employeeId]);

  const selectEmployee = (employee) => {
    setEmployeeId(employee.customId || employee.employeeId || employee.user_id || '');
    setShowEmployeeMatches(false);
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!employeeId.trim()) {
      onError?.('Enter an employee ID to add as a member.');
      return;
    }
    setSubmitting(true);
    try {
      const member = await projectService.addProjectMember(projectId, { employeeId: employeeId.trim(), projectRole: role });
      onMembersChange?.([...(members || []), member]);
      setEmployeeId('');
      setEmployeeMatches([]);
      setShowEmployeeMatches(false);
      onMessage?.('Member added successfully.');
    } catch (err) {
      onError?.(err?.response?.data?.message || err?.message || 'Unable to add project member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberEmployeeId) => {
    try {
      await projectService.removeProjectMember(projectId, memberEmployeeId);
      onMembersChange?.((members || []).filter((m) => m.employeeId !== memberEmployeeId));
      onMessage?.('Member removed.');
    } catch (err) {
      onError?.(err?.response?.data?.message || err?.message || 'Unable to remove project member.');
    }
  };

  const getMemberDisplay = (member) => {
    if (member.displayName) return member.displayName;
    if (member.userName) return member.userName;
    if (member.name) return member.name;
    if (member.firstName) return [member.firstName, member.lastName].filter(Boolean).join(' ');
    return member.employeeId || 'Unknown employee';
  };

  return (
    <div className="panel-block glass-card project-members-card">
      <div className="panel-header project-members-heading">
        <div><p className="project-section-kicker">Collaboration</p><h3>Project members</h3></div>
      </div>

      {canManageMembers ? <form className="auth-form project-member-form" onSubmit={handleAdd}>
        <div className="field-group project-member-user-field">
          <span>Employee ID</span>
          <div className="input-wrap">
            <input
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setShowEmployeeMatches(true);
              }}
              onFocus={() => setShowEmployeeMatches(true)}
              onBlur={() => setTimeout(() => setShowEmployeeMatches(false), 150)}
              placeholder="e.g. EMP-042"
              autoComplete="off"
            />
          </div>
          {showEmployeeMatches && employeeId.trim() && (
            <div className="employee-match-menu" role="listbox" aria-label="Matching employees">
              {isSearchingEmployees ? (
                <p className="employee-match-state">Searching employees…</p>
              ) : employeeMatches.length > 0 ? employeeMatches.map((employee) => {
                const employeeCode = employee.customId || employee.employeeId || employee.user_id;
                const employeeName = employee.fullName || [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.email;
                return (
                  <button
                    key={employee.id || employeeCode}
                    type="button"
                    className="employee-match-option"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectEmployee(employee)}
                    role="option"
                  >
                    <span className="employee-match-avatar">{employeeName?.charAt(0)?.toUpperCase() || 'E'}</span>
                    <span className="employee-match-copy">
                      <strong>{employeeName}</strong>
                      <small>{employeeCode}</small>
                    </span>
                  </button>
                );
              }) : (
                <p className="employee-match-state">No matching employee IDs.</p>
              )}
            </div>
          )}
          {resolving && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.5 }}>Looking up user…</p>
          )}
          {resolvedUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <User size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>{resolvedUser.name}</span>
              {resolvedUser.email && (
                <span style={{ fontSize: '12px', opacity: 0.6 }}>· {resolvedUser.email}</span>
              )}
            </div>
          )}
        </div>
        <div className="field-group project-member-role-field">
          <span>Role</span>
          <div className="input-wrap">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
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
      </form> : null}

      <div className="task-list project-member-list">
        {(members || []).length === 0 ? (
          <p className="helper-copy">No members added yet.</p>
        ) : (
          (members || []).map((member) => (
            <div key={`${member.employeeId}-${member.projectRole}`} className="task-row project-member-row">
              <div className="project-member-identity">
                <div className="project-member-avatar">
                  {getMemberDisplay(member).charAt(0).toUpperCase()}
                </div>
                <div className="project-member-copy">
                  <div className="project-member-name">{getMemberDisplay(member)}</div>
                  <div className="project-member-id">
                    {member.employeeId || 'No employee ID'}
                  </div>
                </div>
              </div>
              <div className="task-pill-wrap">
                <span className="status-tag review">{member.projectRole}</span>
              </div>
              {canManageMembers ? <button type="button" className="ghost-button" onClick={() => handleRemove(member.employeeId)}><Trash2 size={14} /> Remove</button> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectMemberManager;
