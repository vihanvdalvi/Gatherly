import React from 'react';
import type { Group } from '../../types/index';
import { PersonCard } from './PersonCard';
import '../../styles/components.css';

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  onSelect: () => void;
  onGenerateCode?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  isSelected,
  onSelect,
  onGenerateCode,
}) => {
  return (
    <div
      className="card"
      style={{
        cursor: 'pointer',
        border: isSelected
          ? '2px solid var(--primary)'
          : '1px solid var(--neutral-200)',
        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.02)' : 'white',
        transition: 'all 0.2s ease',
      }}
      onClick={onSelect}
    >
      <div className="card-header">
        <h3 className="card-title">{group.name}</h3>
        <p className="card-subtitle">ID: {group.group_id}</p>
      </div>

      <div className="card-body">
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--neutral-700)' }}>
            Members ({group.members?.length || 0})
          </h4>
          <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
            {group.members && group.members.length > 0 ? (
              group.members.map((member) => (
                <PersonCard key={member.user_id} member={member} />
              ))
            ) : (
              <p style={{ color: 'var(--neutral-400)', margin: 0 }}>No members yet</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--neutral-200)' }}>
          {group.is_creator ? (
            <div>
              <p style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-sm)', color: 'var(--neutral-600)' }}>
                Share Code:
              </p>
              <div
                style={{
                  backgroundColor: 'var(--neutral-100)',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'monospace',
                  fontSize: 'var(--font-lg)',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  textAlign: 'center',
                }}
              >
                {group.code || 'N/A'}
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--neutral-500)' }}>
              💡 Ask the creator for the group code to invite others
            </p>
          )}
        </div>
      </div>

      <div className="card-footer">
        {isSelected && (
          <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: 'var(--font-sm)' }}>
            ✓ Selected
          </span>
        )}
        {group.is_creator && onGenerateCode && (
          <button className="btn btn-sm btn-secondary" onClick={(e) => {
            e.stopPropagation();
            onGenerateCode();
          }}>
            New Code
          </button>
        )}
      </div>
    </div>
  );
};
