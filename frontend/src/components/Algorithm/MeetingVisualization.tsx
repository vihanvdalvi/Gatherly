import React, { useMemo } from 'react';
import type { BestMeetingResult, CommonSlot, UserLocationSlot } from '../../types/index';
import '../../styles/components.css';

interface MeetingVisualizationProps {
  result: BestMeetingResult;
  selectedSlot?: CommonSlot;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Convert seconds past 7:00 AM to time string
const secondsToTime = (seconds: number): string => {
  const baseHour = 7;
  const hours = Math.floor(seconds / 3600) + baseHour;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Convert seconds to minutes
const secondsToMinutes = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
};

export const MeetingVisualization: React.FC<MeetingVisualizationProps> = ({
  result,
  selectedSlot,
}) => {
  const slot = selectedSlot || result.slots[0];

  if (!slot) {
    return (
      <div className="alert alert-error">No meeting slots available for this group.</div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
      <div className="card" style={{ backgroundColor: '#dbeafe', borderColor: '#93c5fd' }}>
        <div className="card-header">
          <h3 className="card-title">📍 Optimal Meeting Details</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
              <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '500', color: 'var(--neutral-600)' }}>
                Day
              </p>
              <p style={{ margin: 0, fontSize: 'var(--font-lg)', fontWeight: '600' }}>
                {DAYS_OF_WEEK[result.day_of_week]}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '500', color: 'var(--neutral-600)' }}>
                Time
              </p>
              <p style={{ margin: 0, fontSize: 'var(--font-lg)', fontWeight: '600' }}>
                {slot.start_hhmm} - {slot.end_hhmm}
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '500', color: 'var(--neutral-600)' }}>
                Meeting Location
              </p>
              <p style={{
                margin: 0,
                fontSize: 'var(--font-lg)',
                fontWeight: '600',
                color: 'var(--primary)',
                backgroundColor: 'white',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--primary)',
              }}>
                📍 {slot.meeting_location}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Walktimes */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">👥 Members & Walking Times</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {slot.user_locations.map((user) => (
              <div
                key={user.user_id}
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--neutral-50)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                      Member
                    </p>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: 'var(--font-md)' }}>
                      {user.name}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                      Starting Location
                    </p>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: 'var(--font-md)', color: 'var(--neutral-700)' }}>
                      {user.location}
                    </p>
                  </div>
                </div>

                {/* Path visualization */}
                <div
                  style={{
                    marginTop: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: '500', fontSize: 'var(--font-sm)', color: 'var(--neutral-600)' }}>
                    Route to Meeting:
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                    {user.path.map((node, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && (
                          <span style={{ color: 'var(--neutral-400)', fontWeight: '600' }}>→</span>
                        )}
                        <span
                          style={{
                            backgroundColor: idx === 0 ? 'var(--info)' : idx === user.path.length - 1 ? 'var(--success)' : 'var(--neutral-200)',
                            color: idx === 0 || idx === user.path.length - 1 ? 'white' : 'var(--neutral-700)',
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-sm)',
                            fontWeight: '500',
                          }}
                        >
                          {node.location}
                          {idx > 0 && (
                            <span style={{ fontSize: 'var(--font-xs)', marginLeft: '4px', opacity: 0.7 }}>
                              ({node.lat.toFixed(3)}, {node.lon.toFixed(3)})
                            </span>
                          )}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Total walktime */}
                <div
                  style={{
                    marginTop: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    backgroundColor: '#fef3c7',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    borderLeft: '4px solid #f59e0b',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: '600', fontSize: 'var(--font-md)', color: '#92400e' }}>
                    ⏱️ Walking Time: {secondsToMinutes(user.walk_time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All available slots */}
      {result.slots.length > 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 All Available Slots</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
              {result.slots.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: s === slot ? 'var(--neutral-100)' : 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    border: s === slot ? '2px solid var(--primary)' : '1px solid var(--neutral-200)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600' }}>
                        {s.start_hhmm} - {s.end_hhmm}
                      </p>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--neutral-600)', fontSize: 'var(--font-sm)' }}>
                        📍 {s.meeting_location}
                      </p>
                    </div>
                    {s === slot && (
                      <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: 'var(--font-sm)', fontWeight: '500' }}>
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
