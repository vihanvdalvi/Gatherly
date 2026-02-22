import React, { useState, useEffect } from 'react';
import { scheduleAPI } from '../../services/api';
import '../../styles/components.css';

interface AddScheduleModalProps {
  userId: string;
  onClose: () => void;
  onAdd: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// Convert time string (HH:MM) to seconds past 7:00 AM
const timeToSeconds = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  // 7:00 AM is the base (0 seconds)
  return (hours - 7) * 3600 + minutes * 60;
};

// Convert seconds past 7:00 AM back to time string (HH:MM)
const secondsToTime = (seconds: number): string => {
  const baseHour = 7;
  const hours = Math.floor(seconds / 3600) + baseHour;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({ userId, onClose, onAdd }) => {
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [startTime, setStartTime] = useState('09:00'); // 9:00 AM
  const [endTime, setEndTime] = useState('10:00'); // 10:00 AM
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await scheduleAPI.getLocationsList();
        setLocations(response.data.locations || []);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // Filter locations based on input
  useEffect(() => {
    if (location.trim()) {
      const filtered = locations.filter((loc) =>
        loc.toLowerCase().includes(location.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowLocationDropdown(true);
    } else {
      setFilteredLocations(locations);
      setShowLocationDropdown(false);
    }
  }, [location, locations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);

    // Validate times are within 7:00 AM - 7:00 PM (0 - 43200 seconds)
    if (startSeconds < 0 || endSeconds > 12 * 3600) {
      setError('Time must be between 7:00 AM and 7:00 PM');
      return;
    }

    if (startSeconds >= endSeconds) {
      setError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      await scheduleAPI.addTimeSlot(userId, {
        day_of_week: dayOfWeek,
        start_seconds: startSeconds,
        end_seconds: endSeconds,
        location,
        purpose: purpose || undefined,
      });
      onAdd();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to add time slot'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ margin: 0 }}>Add Time Slot</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Day of Week *</label>
            <select
              className="form-select"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              required
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Time (7:00 AM - 7:00 PM) *</label>
            <input
              type="time"
              className="form-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min="07:00"
              max="19:00"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Time (7:00 AM - 7:00 PM) *</label>
            <input
              type="time"
              className="form-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min="07:00"
              max="19:00"
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Location *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Start typing to search locations..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => location && setShowLocationDropdown(true)}
              autoComplete="off"
              required
            />
            {showLocationDropdown && filteredLocations.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid var(--neutral-300)',
                  borderRadius: 'var(--radius-md)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  marginTop: '4px',
                }}
              >
                {filteredLocations.map((loc) => (
                  <div
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setShowLocationDropdown(false);
                    }}
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--neutral-200)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--neutral-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                  >
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Purpose (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Study, Work, Exercise"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Add Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
