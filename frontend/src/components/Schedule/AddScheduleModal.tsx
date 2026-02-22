import React, { useState } from 'react';
import { scheduleAPI } from '../../services/api';
import '../../styles/components.css';

interface AddScheduleModalProps {
  userId: string;
  onClose: () => void;
  onAdd: () => void;
}

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({ userId, onClose, onAdd }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startTime || !endTime || !location) {
      setError('All fields are required');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      await scheduleAPI.addTimeSlot(userId, {
        start_time: startTime,
        end_time: endTime,
        location,
      });
      onAdd();
    } catch (err) {
      setError('Failed to add time slot');
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
            <label className="form-label">Start Date & Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date & Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter location (e.g., Library, Coffee Shop)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
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
