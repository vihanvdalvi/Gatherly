import React, { useState } from 'react';
import { groupAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Group } from '../../types/index';
import '../../styles/components.css';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupJoined: (group: Group) => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose, onGroupJoined }) => {
  const { user } = useAuth();
  const [groupId, setGroupId] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupId.trim() || !groupCode.trim()) {
      setError('Group ID and code are required');
      return;
    }

    if (!user) {
      setError('You must be logged in to join a group');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await groupAPI.join(groupId, groupCode, user.user_id);
      const group = response.data as Group;
      setGroupId('');
      setGroupCode('');
      onGroupJoined(group);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to join group'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setGroupId('');
    setGroupCode('');
    setError(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleCancel}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Join Existing Group</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Group ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter group ID"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Group Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter group code"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
