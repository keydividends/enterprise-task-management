import { useState } from 'react';
import { Trash2, UserMinus, UserPlus } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import teamService from '../services/teamService';

const MEMBER_ROLES = ['MEMBER', 'DEVELOPER', 'SENIOR_DEVELOPER', 'QA_TESTER', 'VIEWER', 'LEAD'];
const RAW_USER_OPTIONS = ['mock-admin', 'mock-maya', 'mock-alex'];

const TeamMemberManager = ({ teamId, team = null, members = [], onMembersChange, onMessage, onError }) => {
  const { user } = useAuth();
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [submitting, setSubmitting] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);

  // Unique user options: raw mock users + the current authenticated user.
  const userOptions = (() => {
    const seen = new Set(RAW_USER_OPTIONS.map((id) => String(id)));
    const list = [...RAW_USER_OPTIONS];
    if (user?.id && !seen.has(String(user.id))) {
      seen.add(String(user.id));
      list.unshift(user.id);
    }
    return list.map((id) => ({ id, label: `${id}${id === team?.leadId ? ' (current lead)' : ''}` }));
  })();

  const alreadyMember = (id) => members.some((m) => String(m.userId) === String(id));
  const reportedUserId = String(user?.id || '');

  const handleAdd = async (event) => {
    event.preventDefault();
    const trimmedUserId = String(userId || '').trim();
    if (!trimmedUserId) {
      onError?.('Select a user to add as a member.');
      return;
    }
    if (alreadyMember(trimmedUserId)) {
      onError?.('That user is already a member of this team.');
      return;
    }
    if (user?.role === 'MEMBER' && reportedUserId !== trimmedUserId && !alreadyMember(reportedUserId)) {
      // A plain member may only add themselves in this demo policy.
      const message = 'You may only add yourself to a team.';
      onError?.(message);
      return;
    }

    setSubmitting(true);
    try {
      const member = await teamService.addMember(teamId, { userId: trimmedUserId, role });
      onMembersChange?.([...members, member]);
      setUserId('');
      setRole('MEMBER');
      onMessage?.(`Added ${trimmedUserId} (${role}) to the team.`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to add member.';
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId) => {
    const member = members.find((entry) => String(entry.userId) === String(memberId));
    if (member?.role === 'LEAD' || String(memberId) === String(team?.leadId)) {
      onError?.('The team lead cannot be removed. Assign a new lead first.');
      return;
    }
    if (!window.confirm(`Remove ${memberId} from this team?`)) {
      return;
    }

    setBusyUserId(memberId);
    try {
      await teamService.removeMember(teamId, memberId);
      onMembersChange?.(members.filter((entry) => String(entry.userId) !== String(memberId)));
      onMessage?.(`Removed ${memberId} from the team.`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to remove member.';
      onError?.(message);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRoleChange = async (memberId, nextRole) => {
    try {
      const updated = await teamService.updateMember(teamId, memberId, { role: nextRole });
      onMembersChange?.(
        members.map((entry) => (String(entry.userId) === String(memberId) ? updated : entry))
      );
      onMessage?.(`Updated ${memberId}'s role to ${nextRole}.`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to update member.';
      onError?.(message);
    }
  };

  return (
    <div className="panel-block glass-card">
      <div className="panel-header">
        <h3>Team members</h3>
        <span className="status-tag review">{members.length} members</span>
      </div>

      <form className="member-add-form" onSubmit={handleAdd}>
        <div className="field-group">
          <label htmlFor="member-select">Add a member</label>
          <div className="input-wrap">
            <select
              id="member-select"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            >
              <option value="">-- Select a user --</option>
              {userOptions.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                  disabled={alreadyMember(option.id)}
                >
                  {option.label}{alreadyMember(option.id) ? ' (already added)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="member-role">Role</label>
          <div className="input-wrap">
            <select id="member-role" value={role} onChange={(event) => setRole(event.target.value)}>
              {MEMBER_ROLES.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, ' ').toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="primary-button member-add-btn" disabled={submitting || !userId.trim()}>
          <UserPlus size={15} /> {submitting ? 'Adding...' : 'Add member'}
        </button>
      </form>

      <div>
        {members.length === 0 ? (
          <div className="empty-state">No members yet. Add a member to get started.</div>
        ) : members.map((member) => {
          const isLead = member.role === 'LEAD' || String(member.userId) === String(team?.leadId);
          return (
            <div key={`${member.userId}-${member.role}-${member.joinedAt || ''}`} className="member-row">
              <div className="member-row-info">
                <span className={`status-tag ${isLead ? 'priority-tag high' : 'review'}`}>
                  {isLead ? 'LEAD' : member.role}
                </span>
                <span className="member-row-name">{member.userId}</span>
              </div>
              {isLead ? (
                <em style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginLeft: 'auto' }}>Team lead</em>
              ) : (
                <select
                  className="member-role-select"
                  value={member.role}
                  onChange={(event) => handleRoleChange(member.userId, event.target.value)}
                  aria-label={`Role for ${member.userId}`}
                >
                  {MEMBER_ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ').toLowerCase()}</option>
                  ))}
                </select>
              )}
              <button
                type="button"
                className="member-remove-btn"
                onClick={() => handleRemove(member.userId)}
                disabled={isLead || busyUserId === member.userId}
              >
                <Trash2 size={13} />
                {busyUserId === member.userId ? 'Removing...' : 'Remove'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamMemberManager;
