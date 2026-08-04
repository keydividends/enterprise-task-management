import { useState } from 'react';
import teamService from '../services/teamService';

const TeamMemberManager = ({ teamId, members = [], onChange }) => {
  const [userId, setUserId] = useState('');

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!userId.trim()) return;
    const member = await teamService.addMember(teamId, { userId: userId.trim() });
    onChange?.([...members, member]);
    setUserId('');
  };

  return (
    <div className="panel-block glass-card">
      <div className="panel-header">
        <h3>Members</h3>
      </div>
      <form className="auth-form" onSubmit={handleAdd}>
        <div className="field-group">
          <span>Add member</span>
          <div className="input-wrap">
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="mock-maya" />
          </div>
        </div>
        <button type="submit" className="primary-button">Add member</button>
      </form>
      <div className="task-list">
        {members.map((member) => (
          <div key={`${member.userId}-${member.role}`} className="task-row">
            <strong>{member.userId}</strong>
            <div className="task-meta">
              <span>{member.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMemberManager;
