import React from 'react';
import { ScheduleTable } from './ScheduleTable';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components.css';

export const ScheduleTab: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h2 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Your Schedule</h2>
        <p style={{ margin: 0, color: 'var(--neutral-600)' }}>Email: {user.email}</p>
      </div>

      <ScheduleTable userId={user.user_id} />
    </div>
  );
};
