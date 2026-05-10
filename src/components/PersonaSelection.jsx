import React from 'react';

const personas = [
  {
    id: 'grandchild',
    name: '손주',
    description: '따뜻하고 다정한 목소리로 챙겨드려요.',
    icon: '👶',
    color: '#fb7185'
  },
  {
    id: 'doctor',
    name: '전문의',
    description: '정확하고 전문적인 건강 조언을 드려요.',
    icon: '👨‍⚕️',
    color: 'var(--color-primary)'
  },
  {
    id: 'friend',
    name: '동네 친구',
    description: '친근하고 편안하게 말동무가 되어드려요.',
    icon: '🤝',
    color: '#34d399'
  }
];

const PersonaSelection = ({ onSelect }) => {
  return (
    <div style={{
      padding: 'var(--spacing-section) var(--spacing-base)',
      textAlign: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-surface-soft)',
      color: 'var(--color-ink-deep)'
    }}>
      <h1 style={{ fontSize: 'var(--font-heading-md)', fontWeight: 700, marginBottom: '40px' }}>
        어떤 친구와 이야기해볼까요?
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
        {personas.map((p) => (
          <div 
            key={p.id}
            className="card-meta"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px', 
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.2s'
            }}
            onClick={() => onSelect(p.id)}
          >
            <div style={{ 
              fontSize: '48px', 
              width: '80px', 
              height: '80px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '50%'
            }}>
              {p.icon}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-heading-sm)', margin: '0 0 4px', color: p.color }}>{p.name}</h2>
              <p style={{ fontSize: 'var(--font-body)', margin: 0, color: 'var(--color-ink)' }}>{p.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <p style={{ marginTop: '40px', color: 'var(--color-ink)', fontSize: 'var(--font-body)' }}>
        언제든지 설정을 통해 바꿀 수 있어요. ✨
      </p>
    </div>
  );
};

export default PersonaSelection;
