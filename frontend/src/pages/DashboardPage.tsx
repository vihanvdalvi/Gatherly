import React, { useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { GroupsTab } from '../components/Dashboard/GroupsTab';
import { ScheduleTab } from '../components/Schedule/ScheduleTab';
import { MeetingVisualization } from '../components/Algorithm/MeetingVisualization';
import { useAuth } from '../contexts/AuthContext';
import { algorithmAPI } from '../services/api';
import type { BestMeetingResult } from '../types/index';
import '../styles/components.css';

interface DashboardPageProps {
  onLogout?: () => void;
}

type TabType = 'groups' | 'schedule' | 'results';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const { user, selectedGroup, setSelectedGroup } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [bestMeetingResult, setBestMeetingResult] = useState<BestMeetingResult | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [calculatingBestMeeting, setCalculatingBestMeeting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [meetingDuration, setMeetingDuration] = useState<number>(30); // 30 minutes

  const handleCalculateBestMeeting = async () => {
    if (!selectedGroup) {
      setError('Please select a group first');
      return;
    }

    try {
      setCalculatingBestMeeting(true);
      setError(null);
      console.log('📡 Calling algorithm API with:', {
        groupId: selectedGroup.group_id,
        dayOfWeek,
        meetingDuration,
      });
      const response = await algorithmAPI.getBestMeetingTimes(
        selectedGroup.group_id,
        dayOfWeek,
        meetingDuration
      );
      console.log('✅ Algorithm API response:', response.data);
      setBestMeetingResult(response.data);
      setSelectedSlot(response.data.slots[0]);
      setActiveTab('results');
    } catch (err: any) {
      console.error('❌ Algorithm API error:', {
        status: err.response?.status,
        detail: err.response?.data?.detail,
        fullError: err,
      });
      const errorMessage = err.response?.data?.detail || 'Failed to calculate best meeting times';
      setError(errorMessage);
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
                display: 'grid',
                gap: 'var(--spacing-lg)',
                gridTemplateColumns: '1fr auto',
              }}
            >
              <div>
                <p style={{ margin: '0 0 var(--spacing-xs) 0', color: 'var(--info)', fontWeight: '600' }}>
                  Selected Group
                </p>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>{selectedGroup.name}</h3>
                <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--neutral-600)', fontSize: 'var(--font-sm)' }}>
                  {selectedGroup.members.length} member{selectedGroup.members.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Calculate Settings */}
              <div
                style={{
                  display: 'grid',
                  gap: 'var(--spacing-md)',
                  alignSelf: 'center',
                  paddingLeft: 'var(--spacing-lg)',
                  borderLeft: '2px solid var(--info)',
                }}
              >
                <div>
                  <label style={{ fontSize: 'var(--font-sm)', fontWeight: '500', color: 'var(--neutral-700)' }}>
                    Day of Week
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    style={{
                      marginTop: '4px',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--neutral-300)',
                      fontWeight: '500',
                    }}
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 'var(--font-sm)', fontWeight: '500', color: 'var(--neutral-700)' }}>
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="240"
                    step="15"
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(Number(e.target.value))}
                    style={{
                      marginTop: '4px',
                      width: '80px',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--neutral-300)',
                      fontWeight: '500',
                    }}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleCalculateBestMeeting}
                  disabled={calculatingBestMeeting || !selectedGroup}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {calculatingBestMeeting ? '⏳ Calculating...' : '🎯 Find Best Time'}
                </button>
              </div>
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
            <MeetingVisualization
              result={bestMeetingResult}
              selectedSlot={selectedSlot}
              onSlotSelect={(slot) => {
                console.log('Selected slot:', slot);
                setSelectedSlot(slot);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
