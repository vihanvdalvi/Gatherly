import React, { useState } from 'react';
import type { BestMeetingResult, CommonSlot } from '../../types/index';
import '../../styles/components.css';

interface BestMeetingResultsProps {
  result: BestMeetingResult;
}

export const BestMeetingResults: React.FC<BestMeetingResultsProps> = ({ result }) => {
  const [expandedSlots, setExpandedSlots] = useState<Set<number>>(new Set());

  console.log('[DEBUG] BestMeetingResults received:', result);
  console.log('[DEBUG] Total slots:', result.slots.length);
  result.slots.forEach((slot, idx) => {
    console.log(`[DEBUG] Slot ${idx}:`, {
      time: `${slot.start_hhmm} - ${slot.end_hhmm}`,
      location: slot.meeting_location,
      users: slot.user_locations.length,
    });
  });

  const getDayName = (dayNum: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || 'Unknown';
  };

  const toggleSlot = (index: number) => {
    const newExpanded = new Set(expandedSlots);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSlots(newExpanded);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* ===== SECTION 1: ALL AVAILABLE TIME SLOTS ===== */}
      {result.slots.length > 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏱️ All Available Time Slots ({result.slots.length} slots)</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              {result.slots.map((slot: CommonSlot, index: number) => {
                const isExpanded = expandedSlots.has(index);
                return (
                  <div 
                    key={index}
                    style={{
                      border: '1px solid var(--neutral-200)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'visible',
                      position: 'relative',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        console.log(`[DEBUG] CLICKED SLOT ${index}!`);
                        e.stopPropagation();
                        toggleSlot(index);
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        backgroundColor: isExpanded ? 'var(--primary)' : 'var(--neutral-50)',
                        color: isExpanded ? 'white' : 'inherit',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => {
                        if (!isExpanded) {
                          e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isExpanded ? 'var(--primary)' : 'var(--neutral-50)';
                      }}
                    >
                      <div style={{ pointerEvents: 'none' }}>
                        <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '600' }}>
                          {slot.start_hhmm} - {slot.end_hhmm}
                        </p>
                        <p style={{ margin: 0, color: isExpanded ? 'rgba(255,255,255,0.9)' : 'var(--neutral-600)', fontSize: 'var(--font-sm)' }}>
                          Duration: {Math.round((slot.end_seconds - slot.start_seconds) / 60)} minutes
                        </p>
                      </div>
                      <span style={{ fontSize: 'var(--font-lg)', marginLeft: 'var(--spacing-md)', pointerEvents: 'none' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          borderTop: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                          <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                            📍 Meeting Location:
                          </p>
                          <p style={{ margin: 0, fontSize: 'var(--font-base)', fontWeight: '600' }}>
                            {slot.meeting_location}
                          </p>
                        </div>

                        <div>
                          <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                            🚶 Member Travel Times:
                          </p>
                          {slot.user_locations && slot.user_locations.length > 0 ? (
                            <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                              {slot.user_locations.map((user, idx) => (
                                <div key={idx} style={{ padding: 'var(--spacing-xs)', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)' }}>
                                  <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                                    {user.name}
                                  </p>
                                  <p style={{ margin: 0, fontSize: 'var(--font-sm)' }}>
                                    From: {user.location}
                                  </p>
                                  <p style={{ margin: '0', fontSize: 'var(--font-sm)', fontWeight: '600' }}>
                                    ⏱️ {Math.round(user.walk_time / 60)} min walk
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'rgba(255,255,255,0.7)' }}>
                              No member data available
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== SECTION 2: SUGGESTED MEETING ===== */}
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

      {/* ===== SECTION 3: SUGGESTED LOCATION ===== */}
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

      {/* ===== SECTION 4: WALKING TIMES ===== */}
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
    </div>
  );
};
  
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
      {/* All Available Time Slots - MOVED TO TOP */}
      {result.slots.length > 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏱️ All Available Time Slots ({result.slots.length} slots)</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              {result.slots.map((slot: CommonSlot, index: number) => {
                const isExpanded = expandedSlots.has(index);
                return (
                  <div 
                    key={index}
                    style={{
                      border: '1px solid var(--neutral-200)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'visible',
                      position: 'relative',
                      zIndex: isExpanded ? 100 - index : 10 - index,
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        console.log(`[DEBUG] CLICKED SLOT ${index}!`, e);
                        e.stopPropagation();
                        toggleSlot(index);
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        backgroundColor: isExpanded ? 'var(--primary)' : 'var(--neutral-50)',
                        color: isExpanded ? 'white' : 'inherit',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        textAlign: 'left',
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 20,
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        console.log(`[DEBUG] Mouse enter slot ${index}`);
                        if (!isExpanded) {
                          e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isExpanded ? 'var(--primary)' : 'var(--neutral-50)';
                      }}
                    >
                      <div style={{ pointerEvents: 'none' }}>
                        <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '600' }}>
                          {slot.start_hhmm} - {slot.end_hhmm}
                        </p>
                        <p style={{ margin: 0, color: isExpanded ? 'rgba(255,255,255,0.9)' : 'var(--neutral-600)', fontSize: 'var(--font-sm)' }}>
                          Duration: {Math.round((slot.end_seconds - slot.start_seconds) / 60)} minutes
                        </p>
                      </div>
                      <span style={{ fontSize: 'var(--font-lg)', marginLeft: 'var(--spacing-md)', pointerEvents: 'none' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          borderTop: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {console.log(`[DEBUG] Expanding slot ${index}:`, { location: slot.meeting_location, userCount: slot.user_locations?.length })}
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                          <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                            📍 Meeting Location:
                          </p>
                          <p style={{ margin: 0, fontSize: 'var(--font-base)', fontWeight: '600' }}>
                            {slot.meeting_location}
                          </p>
                        </div>

                        <div>
                          <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                            🚶 Member Travel Times:
                          </p>
                          {slot.user_locations && slot.user_locations.length > 0 ? (
                            <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                              {slot.user_locations.map((user, idx) => (
                                <div key={idx} style={{ padding: 'var(--spacing-xs)', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)' }}>
                                  <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '500', fontSize: 'var(--font-sm)' }}>
                                    {user.name}
                                  </p>
                                  <p style={{ margin: 0, fontSize: 'var(--font-sm)' }}>
                                    From: {user.location}
                                  </p>
                                  <p style={{ margin: '0', fontSize: 'var(--font-sm)', fontWeight: '600' }}>
                                    ⏱️ {Math.round(user.walk_time / 60)} min walk
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'rgba(255,255,255,0.7)' }}>
                              No member data available
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};
