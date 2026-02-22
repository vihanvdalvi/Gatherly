import React, { useState } from 'react';
import type { BestMeetingResult } from '../../types/index';
import '../../styles/components.css';

interface BestMeetingResultsProps {
  result: BestMeetingResult;
}

export const BestMeetingResults: React.FC<BestMeetingResultsProps> = ({ result }) => {
  const [expandedInterval, setExpandedInterval] = useState<number | null>(null);

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
      {/* Suggested Meeting */}
      {result.suggested_time && (
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
                {result.suggested_time.day_of_week}
              </p>
            </div>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: '500', color: 'var(--neutral-700)' }}>
                Time:
              </p>
              <p style={{ margin: 0, fontSize: 'var(--font-lg)', fontWeight: '600' }}>
                {result.suggested_time.start_time} - {result.suggested_time.end_time}
              </p>
            </div>
          </div>
        </div>
      )}

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
            {result.suggested_location}
          </div>
        </div>
      </div>

      {/* Free Intervals */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⏱️ All Free Intervals</h3>
        </div>
        <div className="card-body">
          {result.free_intervals.length === 0 ? (
            <p style={{ color: 'var(--neutral-500)', margin: 0 }}>No common free time found for all members.</p>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              {result.free_intervals.map((interval, index) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--primary)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedInterval(expandedInterval === index ? null : index)}
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
                        {interval.day_of_week}
                      </p>
                      <p style={{ margin: 0, color: 'var(--neutral-600)' }}>
                        {interval.start_time} - {interval.end_time}
                      </p>
                    </div>
                    <span style={{ fontSize: 'var(--font-lg)' }}>
                      {expandedInterval === index ? '▼' : '▶'}
                    </span>
                  </div>

                  {expandedInterval === index && (
                    <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--neutral-200)' }}>
                      <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                        Available members:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                        {interval.members_available.map((member) => (
                          <span
                            key={member}
                            style={{
                              backgroundColor: 'var(--primary)',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: 'var(--radius-md)',
                              fontSize: 'var(--font-sm)',
                            }}
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Placeholder for Matplotlib Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Availability Visualization</h3>
        </div>
        <div className="card-body" style={{ textAlign: 'center', color: 'var(--neutral-500)' }}>
          <p style={{ margin: 0 }}>Matplotlib chart will be displayed here</p>
          <small>(Backend returns matplotlib figure as image)</small>
        </div>
      </div>
    </div>
  );
};
