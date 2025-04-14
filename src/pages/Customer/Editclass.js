import React from 'react';
import CustomerLayout from '../../components/CustomerLayout';

// 더미 데이터
const defectData = [
  { name: 'Scratch', color: '#dbe4ff' },
  { name: 'Burr', color: '#fde2e2' },
  { name: 'Crack', color: '#fff3b0' },
  { name: 'Paticle', color: '#cbf1f5' },
  { name: 'Dent', color: '#c4c4c4' },
]; 

const Editclass = () => {
  return (
    <CustomerLayout>
      <div style={{ padding: '32px' }}>
        <button style={{
          backgroundColor: '#2C3EFD',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          float: 'right',
          marginBottom: '16px'
        }}>
          Add New Detect
        </button>
        
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 16px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 100px', textAlign: 'left' }}>Defect Type</th>
              <th style={{ textAlign: 'center' }}>Box Color</th>
              <th style={{ textAlign: 'center' }}>Setting</th>
            </tr>
          </thead>
          <tbody>
            {defectData.map((item, index) => (
              <tr key={index} style={{ backgroundColor: '#ffffff', borderRadius: '12px' }}>
                <td style={{ padding: '20px 100px', fontSize: '16px' }}>{item.name}</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%', // td 높이에 맞게
                    }}>
                    <div style={{
                      width: '100px',
                      height: '50px',
                      borderRadius: '9999px',
                      backgroundColor: item.color,
                    }}></div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button style={{
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        padding: '6px',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}>✏️</button>
                      <button style={{
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        padding: '6px',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </CustomerLayout>
  );
};

export default Editclass;

