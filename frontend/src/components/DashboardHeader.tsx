import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/components.css';

interface DashboardHeaderProps {
  onLogout?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--primary)',
        color: 'white',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)' }}>Gatherly</h1>
        <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: 'var(--font-base)' }}>
          Hi, {user?.name || 'Guest'}! 👋
        </p>
      </div>
      <button onClick={handleLogout} className="btn btn-secondary">
        Logout
      </button>
    </header>
  );
};
