import { useEffect, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import teamService from '../services/teamService';
import { userService } from '../../users/services/userService';

const MEMBER_ROLES = ['MEMBER', 'DEVELOPER', 'SENIOR_DEVELOPER', 'QA_TESTER', 'VIEWER', 'LEAD'];

const TeamMemberManager = ({ teamId, team = null, members = [], onMembersChange, onMessage, onError }) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [submitting, setSubmitting] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);

  // Real users from the Users API
  const [availableUsers, setAvailableUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Multi-team confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState(null);
  // confirmDialog shape: { user: { id, name, email }, otherTeams: [{ id, name }], role }

  useEffect(() => {
    let cancelled = false;
    setUsersLoading(true);
    userService.getUsers({ pageSize: 100, status: 'ACTIVE' })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setAvailableUsers(list);
      })
      .catch(() => {
        if (!cancelled) setAvailableUsers([]);
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const alreadyMember = (id) => members.some((m) => String(m.userId) === String(id));

  // Resolve display name from the loaded users list by ID (safe inside async closures)
  const resolveUserName = (uid) => {
    const u = availableUsers.find((au) => String(au.id || au._id) === String(uid));
    return u ? `${u.firstName} ${u.lastName}`.trim() : uid;
  };

  const doAdd = async (targetUserId, targetRole) => {
    setSubmitting(true);
    try {
      const member = await teamService.addMember(teamId, { userId: targetUserId, role: targetRole });
      onMembersChange?.([...members, member]);
      setUserId('');
      setRole('MEMBER');
      onMessage?.(`Added ${resolveUserName(targetUserId)} (${targetRole}) to the team.`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to add member.';
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    const trimmedUserId = String(userId || '').trim();
    if (!trimmedUserId) {
      onError?.('Select a user to add as a member.');
      return;
    }

    // 1. Already a member of THIS team — reject immediately, no dialog
    if (alreadyMember(trimmedUserId)) {
      onError?.('This user is already a member of this team.');
      return;
    }

    // 2. Check other-team memberships
    try {
      const res = await userService.getUserTeams(trimmedUserId);
      const allTeams = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const otherTeams = allTeams.filter((t) => String(t.id) !== String(teamId));

      if (otherTeams.length > 0) {
        setConfirmDialog({
          user: { id: trimmedUserId, name: resolveUserName(trimmedUserId), email: availableUsers.find((u) => String(u.id || u._id) === trimmedUserId)?.email || '' },
          otherTeams,
          role,
        });
        return;
      }
    } catch {
      // teams-check failed — proceed without dialog (fail open)
    }

    // 3. No other teams — add directly
    await doAdd(trimmedUserId, role);
  };

  const handleConfirmAdd = async () => {
    if (!confirmDialog) return;
    const { user: dialogUser, role: dialogRole } = confirmDialog;
    setConfirmDialog(null);
    await doAdd(dialogUser.id, dialogRole);
  };

  const handleConfirmCancel = () => setConfirmDialog(null);

  const handleRemove = async (memberId) => {
    const member = members.find((entry) => String(entry.userId) === String(memberId));
    if (member?.role === 'LEAD' || String(memberId) === String(team?.leadId)) {
      onError?.('The team lead cannot be removed. Assign a new lead first.');
      return;
    }
    const memberUser = availableUsers.find((u) => String(u.id || u._id) === String(memberId));
    const displayName = memberUser
      ? `${memberUser.firstName} ${memberUser.lastName}`.trim()
      : memberId;
    if (!window.confirm(`Remove ${displayName} from this team?`)) return;

    setBusyUserId(memberId);
    try {
      await teamService.removeMember(teamId, memberId);
      onMembersChange?.(members.filter((entry) => String(entry.userId) !== String(memberId)));
      onMessage?.(`Removed ${displayName} from the team.`);
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
      const memberUser = availableUsers.find((u) => String(u.id || u._id) === String(memberId));
      const displayName = memberUser
        ? `${memberUser.firstName} ${memberUser.lastName}`.trim()
        : memberId;
      onMessage?.(`Updated ${displayName}'s role to ${nextRole}.`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to update member.';
      onError?.(message);
    }
  };

  // Resolve a member's display name from the loaded users list
  const getMemberDisplay = (member) => {
    const u = availableUsers.find((au) => String(au.id || au._id) === String(member.userId));
    if (u) {
      return {
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email || '',
      };
    }
    return { name: member.userId, email: '' };
  };

  return (
    <>
      {/* ── Multi-team confirmation dialog ─────────────────────────────────── */}
      {confirmDialog && (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="confirm-dialog glass-card">
            <h3 id="confirm-title" className="confirm-title">User already in other teams</h3>
            <p className="confirm-body">
              <strong>{confirmDialog.user.name}</strong> is already a member of:
            </p>
            <ul className="confirm-team-list">
              {confirmDialog.otherTeams.map((t) => (
                <li key={t.id}>• {t.name}</li>
              ))}
            </ul>
            <p className="confirm-body">
              Do you want to add <strong>{confirmDialog.user.name}</strong> to{' '}
              <strong>{team?.name || 'this team'}</strong> as well?
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleConfirmCancel}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleConfirmAdd}
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? 'Loading users...' : '-- Select a user --'}
                </option>
                {availableUsers.map((u) => {
                  const uid = String(u.id || u._id);
                  const isMember = alreadyMember(uid);
                  const label = `${u.firstName} ${u.lastName}`.trim()
                    + (u.email ? ` (${u.email})` : '')
                    + (uid === team?.leadId ? ' — current lead' : '')
                    + (isMember ? ' — already added' : '');
                  return (
                    <option key={uid} value={uid} disabled={isMember}>
                      {label}
                    </option>
                  );
                })}
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
          <button
            type="submit"
            className="primary-button member-add-btn"
            disabled={submitting || !userId.trim() || usersLoading}
          >
            <UserPlus size={15} /> {submitting ? 'Adding...' : 'Add member'}
          </button>
        </form>

        <div>
          {members.length === 0 ? (
            <div className="empty-state">No members yet. Add a member to get started.</div>
          ) : members.map((member) => {
            const isLead = member.role === 'LEAD' || String(member.userId) === String(team?.leadId);
            const { name, email } = getMemberDisplay(member);
            return (
              <div key={`${member.userId}-${member.role}-${member.joinedAt || ''}`} className="member-row">
                <div className="member-row-info">
                  <span className={`status-tag ${isLead ? 'priority-tag high' : 'review'}`}>
                    {isLead ? 'LEAD' : member.role}
                  </span>
                  <span className="member-row-name">
                    {name}
                    {email ? <span className="member-row-email"> — {email}</span> : null}
                  </span>
                </div>
                {isLead ? (
                  <em style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginLeft: 'auto' }}>Team lead</em>
                ) : (
                  <select
                    className="member-role-select"
                    value={member.role}
                    onChange={(event) => handleRoleChange(member.userId, event.target.value)}
                    aria-label={`Role for ${name}`}
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
    </>
  );
};

export default TeamMemberManager;
