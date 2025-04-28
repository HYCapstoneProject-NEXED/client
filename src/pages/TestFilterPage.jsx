import React from 'react';
import FilterBar from '../components/Annotator/Filter/FilterBar';

/**
 * 필터 컴포넌트 테스트 페이지
 */
const TestFilterPage = () => {
  return (
    <div style={{ padding: '30px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px', color: '#343C6A' }}>필터 컴포넌트 테스트</h2>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <FilterBar />
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
          <p>필터 적용 결과가 여기에 표시됩니다.</p>
          <p>각 필터를 클릭하여 팝업을 확인하고 옵션을 선택해보세요.</p>
        </div>
      </div>
    </div>
  );
};

export default TestFilterPage; 