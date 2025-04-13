import React, { useState } from 'react';
import Header from '../../components/Annotator/Header';
import Sidebar from '../../components/Annotator/Sidebar';
import ImageCanvas from '../../components/Annotator/ImageCanvas';
import ClassSelector from '../../components/Annotator/ClassSelector';
import './AnnotationEditPage.css';

const AnnotationEditPage = () => {
  // 상태 관리
  const [defects, setDefects] = useState([
    { 
      id: '1', 
      type: 'Defect_A', 
      confidence: 0.96,
      coordinates: { x: 523.86, y: 328.36, width: 193.79, height: 212.49 }
    },
    { 
      id: '2', 
      type: 'Defect_A', 
      confidence: 0.88,
      coordinates: { x: 867.10, y: 472.65, width: 160.86, height: 207.25 }
    },
    { 
      id: '3', 
      type: 'Defect_B', 
      confidence: 0.96,
      coordinates: { x: 606.18, y: 626.12, width: 165.92, height: 106.25 }
    },
    { 
      id: '4', 
      type: 'Defect_B', 
      confidence: 0.97,
      coordinates: { x: 806.30, y: 275.90, width: 73.46, height: 127.23 }
    }
  ]);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [dataInfo] = useState({
    dataId: 'IMG_03',
    confidenceScore: 0.45,
    state: 'Pending Task'
  });

  // 결함 선택 핸들러
  const handleDefectSelect = (defectId) => {
    setSelectedDefect(defectId);
  };

  // 저장 핸들러
  const handleSave = () => {
    console.log('Saving annotations:', defects);
    // API 호출 로직 추가
  };

  // 클래스 선택 핸들러
  const handleClassSelect = (className) => {
    if (selectedDefect) {
      setDefects(defects.map(defect => 
        defect.id === selectedDefect 
          ? { ...defect, type: className } 
          : defect
      ));
    }
  };

  return (
    <div className="annotation-edit-page">
      {/* 헤더 */}
      <Header onSave={handleSave} />

      <div className="content-container">
        {/* 좌측 사이드바 */}
        <Sidebar 
          dataInfo={dataInfo} 
          defects={defects} 
          selectedDefect={selectedDefect} 
          onDefectSelect={handleDefectSelect} 
        />

        {/* 메인 편집 영역 */}
        <main className="edit-area">
          <ImageCanvas 
            defects={defects} 
            selectedDefect={selectedDefect} 
            onDefectSelect={handleDefectSelect} 
          />

          {/* 클래스 선택 영역 */}
          <ClassSelector onClassSelect={handleClassSelect} />
        </main>
      </div>
    </div>
  );
};

export default AnnotationEditPage; 