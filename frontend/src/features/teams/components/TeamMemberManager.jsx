import { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import teamService from '../services/teamService';

const TeamMemberManager = ({ teamId, members = [], onMembersChange, onMessage, onError }) => {
  const [userId, setUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (event) => {
    event.preventDefault();
    const trimmedUserId = userId.trim();
    if (!trimmedUserId) {
      onError?.('Enter a user ID to add a member.');
      return;
    }

    setSubmitting(true);
    try {
      const member = await teamService.addMember(teamId, { userId: trimmedUserId });
      onMembersChange?.([...members, member]);
      setUserId('');
      onMessage?.(`Added ${trimmedUserId} to the team.`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to add member.';
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId) => {
    try {
      await teamService.removeMember(teamId, memberId);
      onMembersChange?.(members.filter((member) => member.userId !== memberId));
      onMessage?.(`Removed ${memberId} from the team.`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to remove member.';
      onError?.(message);
    }
  };

  return (
    <div className="panel-block glass-card">
      <div className="panel-header">
        <h3>Team members</h3>
      </div>
      <form className="auth-form" onSubmit={handleAdd}>
        <div className="field-group">
          <span>Add a member</span>
          <div className="input-wrap">
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="mock-alex" />
          </div>
        </div>
        <button type="submit" className="primary-button compact" disabled={submitting}>
          <UserPlus size={16} /> {submitting ? 'Adding...' : 'Add member'}
        </button>
      </form>
      <div className="task-list" style={{ marginTop: '16px' }}>
        {members.map((member) => (
          <div key={`${member.userId}-${member.role}`} className="task-row">
            <div className="task-pill-wrap">
              <span className="status-tag review">{member.role}</span>
            </div>
            <strong>{member.userId}</strong>
            <button type="button" className="ghost-button" onClick={() => handleRemove(member.userId)}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMemberManager;
