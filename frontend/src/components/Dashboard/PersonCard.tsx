import React from 'react';
import type { GroupMember } from '../../types/index';
import '../../styles/components.css';

interface PersonCardProps {
  member: GroupMember;
}

export const PersonCard: React.FC<PersonCardProps> = ({ member }) => {
  return (
    <div
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: member.is_creator ? 'var(--neutral-100)' : 'white',
        border: '1px solid var(--neutral-200)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '600',
          flexShrink: 0,
        }}
      >
        {member.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontWeight: member.is_creator ? '600' : '500',
            color: 'var(--neutral-900)',
          }}
        >
          {member.name}
        </p>
        {member.is_creator && (
          <small style={{ color: 'var(--primary)', fontWeight: '500' }}>Creator</small>
        )}
      </div>
    </div>
  );
};
