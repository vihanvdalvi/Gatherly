import React, { useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { GroupsTab } from '../components/Dashboard/GroupsTab';
import { ScheduleTab } from '../components/Schedule/ScheduleTab';
import { BestMeetingResults } from '../components/Algorithm/BestMeetingResults';
import { useAuth } from '../contexts/AuthContext';
import { algorithmAPI } from '../services/api';
import type { BestMeetingResult } from '../types/index';
import '../styles/components.css';

interface DashboardPageProps {
  onLogout?: () => void;
}

type TabType = 'groups' | 'schedule' | 'results';

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const { user, selectedGroup, setSelectedGroup } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [bestMeetingResult, setBestMeetingResult] = useState<BestMeetingResult | null>(null);
  const [calculatingBestMeeting, setCalculatingBestMeeting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculateBestMeeting = async () => {
    if (!selectedGroup) {
      setError('Please select a group first');
      return;
    }

    try {
      setCalculatingBestMeeting(true);
      const response = await algorithmAPI.getBestMeetingTimes(selectedGroup.group_id);
      setBestMeetingResult(response.data);
      setActiveTab('results');
      setError(null);
    } catch (err) {
      setError('Failed to calculate best meeting times');
      console.error(err);
    } finally {
      setCalculatingBestMeeting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-50)' }}>
      <DashboardHeader onLogout={onLogout} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-lg)' }}>
            {error}
          </div>
        )}

        {/* Selected Group Info */}
        {selectedGroup && (
          <div
            className="card"
            style={{
              marginBottom: 'var(--spacing-xl)',
              backgroundColor: '#dbeafe',
              borderColor: '#93c5fd',
              borderWidth: '2px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--spacing-lg)',
              }}
            >
              <div>
                <p style={{ margin: '0 0 var(--spacing-xs) 0', color: 'var(--info)', fontWeight: '600' }}>
                  Selected Group:
                </p>
                <h3 style={{ margin: 0, color: 'var(--neutral-900)' }}>
                  {selectedGroup.name}
                </h3>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleCalculateBestMeeting}
                disabled={calculatingBestMeeting}
              >
                {calculatingBestMeeting ? 'Calculating...' : '🎯 Calculate Best Meeting'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedGroup(null)}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            👥 Groups
          </button>
          <button
            className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            📅 My Schedule
          </button>
          {bestMeetingResult && (
            <button
              className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              📊 Meeting Results
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
          {activeTab === 'groups' && (
            <GroupsTab
              userId={user.user_id}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
            />
          )}

          {activeTab === 'schedule' && <ScheduleTab />}

          {activeTab === 'results' && bestMeetingResult && (
            <div>
              <h2 style={{ marginTop: 0 }}>Meeting Analysis for {selectedGroup?.name}</h2>
              <BestMeetingResults result={bestMeetingResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
