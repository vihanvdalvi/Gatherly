import React, { useState, useEffect } from 'react';
import type { ScheduleSlot } from '../../types/index';
import { scheduleAPI } from '../../services/api';
import { AddScheduleModal } from './AddScheduleModal';
import '../../styles/components.css';

interface ScheduleTableProps {
  userId: string;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({ userId }) => {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await scheduleAPI.getUserSchedule(userId);
      setSlots(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [userId]);

  const handleDeleteSlot = async (availabilityId: string) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      try {
        await scheduleAPI.deleteSlot(availabilityId);
        setSlots(slots.filter((s) => s.availability_id !== availabilityId));
      } catch (err) {
        setError('Failed to delete slot');
        console.error(err);
      }
    }
  };

  const handleAddSlot = async () => {
    await fetchSlots();
    setShowAddModal(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>Loading schedule...</div>;
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Time Slot
        </button>
      </div>

      {slots.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--spacing-2xl)',
            backgroundColor: 'var(--neutral-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--neutral-200)',
          }}
        >
          <p style={{ color: 'var(--neutral-500)', margin: 0 }}>
            No time slots added yet. Start by adding your availability!
          </p>
        </div>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <table className="table">
            <thead>
              <tr>
                <th>Day/Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.availability_id}>
                  <td>{slot.day_of_week || new Date(slot.start_time).toLocaleDateString()}</td>
                  <td>{new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{slot.location}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteSlot(slot.availability_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && <AddScheduleModal userId={userId} onClose={() => setShowAddModal(false)} onAdd={handleAddSlot} />}
    </div>
  );
};
