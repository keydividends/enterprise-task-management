import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import teamService from '../services/teamService';

const TeamDetailsPage = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const loadTeam = async () => {
      const currentTeam = await teamService.getTeam(teamId);
      const teamMembers = await teamService.listMembers(teamId);
      setTeam(currentTeam);
      setMembers(teamMembers);
    };

    loadTeam();
  }, [teamId]);

  if (!team) {
    return <div className="panel-block glass-card">Loading team...</div>;
  }

  return (
    <div className="dashboard-page">
      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow secondary">Team detail</p>
          <h1>{team.name}</h1>
          <p className="helper-copy">{team.description || 'Shared work context for projects and tasks.'}</p>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-block glass-card">
          <div className="panel-header">
            <h3>Overview</h3>
          </div>
          <p><strong>Lead:</strong> {team.leadId}</p>
          <p><strong>Active:</strong> {team.isActive ? 'Yes' : 'No'}</p>
          <p><strong>Projects:</strong> {team.projectIds?.join(', ') || 'None'}</p>
        </div>

        <div className="panel-block glass-card">
          <div className="panel-header">
            <h3>Members</h3>
          </div>
          {members.map((member) => (
            <div key={`${member.userId}-${member.role}`} className="task-row">
              <strong>{member.userId}</strong>
              <div className="task-meta">
                <span>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TeamDetailsPage;
