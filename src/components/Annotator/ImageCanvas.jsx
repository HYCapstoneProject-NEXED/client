import React from 'react';
import './ImageCanvas.css';

const ImageCanvas = ({ defects, selectedDefect, onDefectSelect }) => {
  return (
    <div className="image-container">
      {/* 이미지 플레이스홀더 */}
      <div className="image-placeholder">
        {/* 실제 프로젝트에서는 여기에 이미지를 로드하게 됨 */}
        <div className="placeholder-text">이미지 영역</div>
        
        {/* 결함 바운딩 박스 */}
        {defects.map((defect) => (
          <div 
            key={defect.id}
            className={`bounding-box ${selectedDefect === defect.id ? 'selected' : ''} ${defect.type === 'Defect_A' ? 'defect-a-box' : 'defect-b-box'}`}
            style={{
              left: `${defect.coordinates.x}px`,
              top: `${defect.coordinates.y}px`,
              width: `${defect.coordinates.width}px`,
              height: `${defect.coordinates.height}px`
            }}
            onClick={() => onDefectSelect(defect.id)}
          >
            <div className="box-label">
              ({defect.id}) {defect.confidence.toFixed(2)}
            </div>
            {/* 리사이즈 핸들 */}
            <div className="resize-handle top-left"></div>
            <div className="resize-handle top-right"></div>
            <div className="resize-handle bottom-left"></div>
            <div className="resize-handle bottom-right"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageCanvas; 