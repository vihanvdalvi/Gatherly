import React, { useState } from 'react';
import type { BestMeetingResult, CommonSlot } from '../../types/index';
import '../../styles/components.css';

interface BestMeetingResultsProps {
  result: BestMeetingResult;
}

export const BestMeetingResults: React.FC<BestMeetingResultsProps> = ({ result }) => {
  const [expandedSlot, setExpandedSlot] = useState<number | null>(null);

  // Helper function to get day name from number
  const getDayName = (dayNum: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || 'Unknown';
  };

  if (!result.slots || result.slots.length === 0) {
    return (
      <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: 'var(--error)' }}>
            ✗ No Available Meeting Times
          </h3>
        </div>
        <div className="card-body">
          <p style={{ margin: 0, color: 'var(--neutral-700)' }}>
            No common free time found for all group members on {getDayName(result.day_of_week)}.
          </p>
        </div>
      </div>
    );
  }

  const bestSlot = result.slots[0];
  
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
      {/* Suggested Meeting */}
      <div className="card" style={{ backgroundColor: '#d1fae5', borderColor: '#6ee7b7' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: 'var(--success)' }}>
            ✓ Suggested Meeting Time
          </h3>
        </div>
        <div className="card-body">
          <div>
            <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: '500', color: 'var(--neutral-700)' }}>
              Date & Day:
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-lg)', fontWeight: '600' }}>
              {getDayName(result.day_of_week)}
            </p>
          </div>
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: '500', color: 'var(--neutral-700)' }}>
              Time:
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-lg)', fontWeight: '600' }}>
              {bestSlot.start_hhmm} - {bestSlot.end_hhmm}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Location */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📍 Suggested Meeting Location</h3>
        </div>
        <div className="card-body">
          <div
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              fontSize: 'var(--font-xl)',
              fontWeight: '600',
            }}
          >
            {bestSlot.meeting_location}
          </div>
        </div>
      </div>

      {/* Walking Times Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🚶 Member Travel Times to {bestSlot.meeting_location}</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {bestSlot.user_locations.map((user, idx) => (
              <div
                key={idx}
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--neutral-50)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '600' }}>
                      {user.name}
                    </p>
                    <p style={{ margin: 0, color: 'var(--neutral-600)', fontSize: 'var(--font-sm)' }}>
                      From: {user.location}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: 'var(--font-lg)' }}>
                      {Math.round(user.walk_time / 60)} min
                    </p>
                    <p style={{ margin: 0, color: 'var(--neutral-600)', fontSize: 'var(--font-sm)' }}>
                      {user.walk_time}s
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Available Time Slots */}
      {result.slots.length > 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏱️ All Available Time Slots ({result.slots.length} slots)</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              {result.slots.map((slot: CommonSlot, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--primary)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => setExpandedSlot(expandedSlot === index ? null : index)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--neutral-50)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '600' }}>
                        {slot.start_hhmm} - {slot.end_hhmm}
                      </p>
                      <p style={{ margin: 0, color: 'var(--neutral-600)', fontSize: 'var(--font-sm)' }}>
                        Duration: {Math.round((slot.end_seconds - slot.start_seconds) / 60)} minutes
                      </p>
                    </div>
                    <span style={{ fontSize: 'var(--font-lg)' }}>
                      {expandedSlot === index ? '▼' : '▶'}
                    </span>
                  </div>

                  {expandedSlot === index && (
                    <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--neutral-200)' }}>
                      <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                        Meeting Location: <strong>{slot.meeting_location}</strong>
                      </p>
                      <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                        Travel times:
                      </p>
                      <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                        {slot.user_locations.map((user, idx) => (
                          <p key={idx} style={{ margin: 0, color: 'var(--neutral-700)', fontSize: 'var(--font-sm)' }}>
                            • {user.name}: {Math.round(user.walk_time / 60)} min from {user.location}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
