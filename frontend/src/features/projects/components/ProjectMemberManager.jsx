import { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import projectService from '../services/projectService';

const ProjectMemberManager = ({ projectId, members = [], onMembersChange, onMessage, onError }) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!userId.trim()) {
      onError?.('Enter a user ID to add as a member.');
      return;
    }

    setSubmitting(true);
    try {
      const member = await projectService.addProjectMember(projectId, { userId: userId.trim(), projectRole: role });
      onMembersChange?.([...(members || []), member]);
      setUserId('');
      onMessage?.(`Added member ${member.userId}.`);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to add project member.';
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId) => {
    try {
      await projectService.removeProjectMember(projectId, memberId);
      onMembersChange?.((members || []).filter((member) => member.userId !== memberId));
      onMessage?.(`Removed member ${memberId}.`);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to remove project member.';
      onError?.(message);
    }
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
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="user_demo_1" />
          </div>
        </div>
        <div className="field-group">
          <span>Role</span>
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
        <button type="submit" className="primary-button compact" disabled={submitting}>
          <UserPlus size={16} /> {submitting ? 'Adding...' : 'Add member'}
        </button>
      </form>

      <div className="task-list" style={{ marginTop: '16px' }}>
        {(members || []).map((member) => (
          <div key={`${member.userId}-${member.projectRole}`} className="task-row">
            <div className="task-pill-wrap">
              <span className="status-tag review">{member.projectRole}</span>
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

export default ProjectMemberManager;
