import React from 'react';

const options = [
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

const DateRangeFilter = ({ value, onChange }) => {
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', padding: 20, minWidth: 220 }}>
      <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 16 }}>Date Range:</div>
      <div>
        {options.map(opt => (
          <div
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              background: value === opt.value ? '#f1f5ff' : 'transparent',
              color: value === opt.value ? '#1a237e' : '#222',
              fontWeight: value === opt.value ? 600 : 400,
              marginBottom: 4,
              transition: 'background 0.2s',
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DateRangeFilter; 