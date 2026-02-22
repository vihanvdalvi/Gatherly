import React, { useState, useEffect } from 'react';
import type { Group } from '../../types/index';
import { userAPI } from '../../services/api';
import { GroupCard } from './GroupCard';
import '../../styles/components.css';

interface GroupsTabProps {
  userId: string;
  selectedGroup: Group | null;
  onSelectGroup: (group: Group | null) => void;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({ userId, selectedGroup, onSelectGroup }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await userAPI.listGroups(userId);
        setGroups(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load groups');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [userId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>Loading groups...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Your Groups</h2>
        <button className="btn btn-primary btn-sm">
          + Create Group
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {groups.length === 0 ? (
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
            No groups yet. Create one or ask someone to invite you!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)',
          }}
        >
          {groups.map((group) => (
            <GroupCard
              key={group.group_id}
              group={group}
              isSelected={selectedGroup?.group_id === group.group_id}
              onSelect={() => onSelectGroup(group)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
