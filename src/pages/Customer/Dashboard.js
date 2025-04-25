import React from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';

//더미데이터
const defectStats = [
  {
    class_name: 'Crack',
    class_color: '#FFF7CC',
    count: 28,
    change: -5
  },
  {
    class_name: 'Scratch',
    class_color: '#DBE4FF',
    count: 15,
    change: 3
  },
  {
    class_name: 'Particle',
    class_color: '#D4F7F4',
    count: 3,
    change: 0
  }
];

const Dashboard = () => {
  return (
    <CustomerLayout>
      <h2>Today</h2>
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* 왼쪽 요약 박스 */}
          <div style={{
            flex: '1',
            minWidth: '280px',
            height: '200px',
            borderRadius: '16px',
            background: '#2C3EFD',
            color: 'white',
            padding: '24px'
            }}>
            <h3 style={{ fontSize: '16px', marginBottom: '4px'}}>Total defect count</h3>
            <p style={{ fontSize: '20px' , marginBottom: '30px'}}>46</p>
            <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Most frequent defect</h3>
            <p style={{ fontSize: '20px' }}>Crack</p>
          </div>


          <div style={{
            flex: '1',
            minWidth: '280px',
            height: '200px',
            borderRadius: '16px',
            background: '#fff',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <p style={{
              color: 'gray',
              fontSize: '14px',
              textAlign: 'right',
              marginBottom: '12px'
            }}>
              Compared to the previous day
            </p>

            {defectStats.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: item.class_color
                }}></div>

                <div style={{ flex: 1, marginLeft: '12px' }}>
                  <p style={{ margin: 0, fontWeight: '500' }}>{item.class_name}</p>
                  <p style={{ margin: 0, color: '#5A69C9', fontSize: '14px' }}>{item.count}</p>
                </div>

                <div style={{
                  minWidth: '40px',
                  textAlign: 'right',
                  color: item.change > 0 ? '#D9534F' : item.change < 0 ? '#28A745' : '#888'
                }}>
                  {item.change > 0 ? `+${item.change}` : `${item.change}`}
                </div>
                </div>
            ))}
          </div>

        </div>
      </div>
      
      <p>Real-time Check </p>
      
    </CustomerLayout>
  );
};

export default Dashboard;

