import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, Building, Briefcase, Calendar, Shield, Edit3, ArrowLeft, CheckCircle2, Clock, Folder, Users as UsersIcon } from 'lucide-react';
import userService from '../services/userService';
import { UserStatusBadge } from '../components/UserStatusBadge';

export const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserDetails = async () => {
      setLoading(true);
      try {
        const [userRes, workloadRes, projectsRes, teamsRes] = await Promise.allSettled([
          userService.getUserById(userId),
          userService.getUserWorkload(userId),
          userService.getUserProjects(userId),
          userService.getUserTeams(userId),
        ]);

        if (userRes.status === 'fulfilled' && userRes.value?.data) {
          setUser(userRes.value.data);
        }
        if (workloadRes.status === 'fulfilled' && workloadRes.value?.data) {
          setWorkload(workloadRes.value.data);
        }
        if (projectsRes.status === 'fulfilled' && projectsRes.value?.data) {
          setProjects(projectsRes.value.data);
        }
        if (teamsRes.status === 'fulfilled' && teamsRes.value?.data) {
          setTeams(teamsRes.value.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };

    loadUserDetails();
  }, [userId]);

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', opacity: 0.7 }}>Loading employee profile...</div>;
  }

  if (error || !user) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>{error || 'Employee not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/users')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          Back to Employee List
        </button>
      </div>
    );
  }

  const displayEmployeeId = user.customId || user.employeeId || user.user_id || (user.email ? `EMP-${user.email.split('@')[0]}` : 'EMP-001');

  return (
    <div className="user-details-page" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate('/users')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-color, #e2e8f0)',
          background: 'transparent',
          cursor: 'pointer',
          marginBottom: '20px',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} /> Back to Employees
      </button>

      {/* Header Profile Card */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 700,
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
              }}
            >
              {user.firstName?.charAt(0).toUpperCase() || 'E'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
                  {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`}
                </h1>
                <UserStatusBadge status={user.status} />
              </div>
              <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '15px' }}>
                {user.title || 'Team Member'} {user.department ? `• ${user.department}` : ''}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.8, fontFamily: 'monospace', userSelect: 'all' }}>
                <strong>Employee ID:</strong> {displayEmployeeId}
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px', opacity: 0.8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={14} /> {user.email}
                </span>
                {user.mobile && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={14} /> {user.mobile}
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={14} /> {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/users/${user.id || user.customId}/edit`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Workload Summary Metrics */}
      {workload && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', opacity: 0.7, fontWeight: 600 }}>Assigned Tasks</div>
            <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px' }}>{workload.assignedTasks || 0}</div>
          </div>
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', opacity: 0.7, fontWeight: 600 }}>Completed Tasks</div>
            <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: '#10b981' }}>{workload.completedTasks || 0}</div>
          </div>
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', opacity: 0.7, fontWeight: 600 }}>Overdue Tasks</div>
            <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: '#ef4444' }}>{workload.overdueTasks || 0}</div>
          </div>
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', opacity: 0.7, fontWeight: 600 }}>Logged Minutes</div>
            <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: '#4f46e5' }}>{workload.loggedMinutes || 0}m</div>
          </div>
        </div>
      )}

      {/* Projects and Teams Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={18} /> Assigned Projects ({projects.length})
          </h3>
          {projects.length === 0 ? (
            <p style={{ fontSize: '13px', opacity: 0.6 }}>No project assignments.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.map((proj) => (
                <div key={proj.id} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px' }}>{proj.name}</strong>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>Role: {proj.role || 'Member'}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontWeight: 600 }}>{proj.key}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UsersIcon size={18} /> Team Memberships ({teams.length})
          </h3>
          {teams.length === 0 ? (
            <p style={{ fontSize: '13px', opacity: 0.6 }}>No team memberships.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teams.map((t) => (
                <div key={t.id} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px' }}>{t.name}</strong>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>Lead: {t.lead || 'N/A'}</div>
                  </div>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>{t.memberCount} members</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
