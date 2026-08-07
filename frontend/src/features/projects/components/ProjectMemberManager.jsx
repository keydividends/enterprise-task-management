import { useState, useEffect, useRef } from 'react';
import { Trash2, UserPlus, User } from 'lucide-react';
import projectService from '../services/projectService';
import userService from '../../users/services/userService';

const ProjectMemberManager = ({ projectId, members = [], onMembersChange, onMessage, onError }) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [submitting, setSubmitting] = useState(false);
  const [resolvedUser, setResolvedUser] = useState(null);
  const [resolving, setResolving] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const trimmed = userId.trim();
    setResolvedUser(null);
    if (!trimmed) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setResolving(true);
      try {
        const res = await userService.getUserByCustomId(trimmed);
        const u = res?.data?.data || res?.data || res;
        if (u?.firstName || u?.email) {
          setResolvedUser({
            name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
            email: u.email,
          });
        }
      } catch {
        setResolvedUser(null);
      } finally {
        setResolving(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [userId]);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!userId.trim()) {
      onError?.('Enter a user ID to add as a member.');
      return;
    }
    setSubmitting(true);
    try {
      const member = await projectService.addProjectMember(projectId, { userId: userId.trim(), projectRole: role });
      const enriched = { ...member, displayName: resolvedUser?.name || null };
      onMembersChange?.([...(members || []), enriched]);
      setUserId('');
      setResolvedUser(null);
      onMessage?.('Member added successfully.');
    } catch (err) {
      onError?.(err?.response?.data?.message || err?.message || 'Unable to add project member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId) => {
    try {
      await projectService.removeProjectMember(projectId, memberId);
      onMembersChange?.((members || []).filter((m) => m.userId !== memberId));
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
    return `${member.userId?.slice(0, 8)}…`;
  };

  return (
    <div className="panel-block glass-card">
      <div className="panel-header">
        <h3>Project members</h3>
      </div>

      <form className="auth-form" onSubmit={handleAdd} style={{ gap: '12px', display: 'grid' }}>
        <div className="field-group">
          <span>User ID</span>
          <div className="input-wrap">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. trisha.dev or EMP-042"
            />
          </div>
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
        <div className="field-group">
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
        <button type="submit" className="primary-button compact" disabled={submitting}>
          <UserPlus size={16} /> {submitting ? 'Adding...' : 'Add member'}
        </button>
      </form>

      <div className="task-list" style={{ marginTop: '16px' }}>
        {(members || []).length === 0 ? (
          <p className="helper-copy">No members added yet.</p>
        ) : (
          (members || []).map((member) => (
            <div key={`${member.userId}-${member.projectRole}`} className="task-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                  {getMemberDisplay(member).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{getMemberDisplay(member)}</div>
                  <div style={{ fontSize: '11px', opacity: 0.5, fontFamily: 'monospace' }}>
                    {member.customId || `${member.userId?.slice(0, 8)}…`}
                  </div>
                </div>
              </div>
              <div className="task-pill-wrap">
                <span className="status-tag review">{member.projectRole}</span>
              </div>
              <button type="button" className="ghost-button" onClick={() => handleRemove(member.userId)}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectMemberManager;
