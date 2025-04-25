import React from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import './Dashboard.css';

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

// 테이블용 더미데이터
const dummyDefectData = [
  {
    id: 1,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 1,
    timestamp: '2025-04-19T10:00:00',
    type: 'Crack'
  },
  {
    id: 2,
    image: '/circle-placeholder.png',
    line: 'Line-B',
    cameraId: 2,
    timestamp: '2025-04-19T10:05:00',
    type: 'Scratch'
  },
  {
    id: 3,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 3,
    timestamp: '2025-04-19T10:10:00',
    type: 'Particle'
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

        {/* 테이블 영역 */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Real-time Check</h3>
          <div className="table-container">
            <table className="defect-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Line</th>
                  <th>Camera ID</th>
                  <th>Time</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {dummyDefectData.map((defect) => (
                  <tr key={defect.id}>
                    <td>
                      <img 
                        src={defect.image}
                        alt={`defect-${defect.id}`}
                        className="table-image"
                      />
                    </td>
                    <td>{defect.line}</td>
                    <td>{defect.cameraId}</td>
                    <td>{new Date(defect.timestamp).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}</td>
                    <td>{defect.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Dashboard;

