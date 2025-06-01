import React, { useState, useEffect, useRef } from 'react';
import { FaCheck, FaClock } from 'react-icons/fa';
import { formatConfidenceScore } from '../../../utils/annotatorDashboardUtils';
import './AnnotationGrid.css';

// config 파일 대신 API 기본 URL 직접 정의
const API_BASE_URL = 'http://166.104.246.64:8000';

/**
 * 체크박스 컴포넌트 - 분리된 컴포넌트
 */
const CheckboxCell = ({ checked, onChange }) => {
  return (
    <div className="grid-checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
};

/**
 * 이미지 컴포넌트 - 이미지와 바운딩 박스 함께 렌더링
 */
const ThumbnailImage = ({ imageUrl, boundingBoxes, imageWidth, imageHeight, thumbnailSize }) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  // 이미지 로드 시 실제 렌더링된 크기 측정
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { width, height } = imageRef.current.getBoundingClientRect();
      setImageDimensions({ width, height });
      console.log('로드된 이미지 크기:', width, height);
    }
  };

  return (
    <div 
      className="thumbnail-container" 
      style={{ 
        width: `${thumbnailSize}px`, 
        height: `${thumbnailSize}px`,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      <img 
        ref={imageRef}
        src={imageUrl}
        alt="썸네일"
        onLoad={handleImageLoad}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
        }}
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%', 
          objectFit: 'contain',
          display: 'block'
        }}
      />
      {boundingBoxes && boundingBoxes.length > 0 && imageDimensions.width > 0 && (
        <BoundingBoxOverlay 
          boxes={boundingBoxes} 
          originalWidth={imageWidth}
          originalHeight={imageHeight}
          renderedWidth={imageDimensions.width}
          renderedHeight={imageDimensions.height}
          containerSize={thumbnailSize}
        />
      )}
    </div>
  );
};

/**
 * 바운딩 박스 오버레이 컴포넌트
 */
const BoundingBoxOverlay = ({ boxes, originalWidth, originalHeight, renderedWidth, renderedHeight, containerSize }) => {
  if (!boxes || boxes.length === 0) return null;
  
  console.log('바운딩 박스 오버레이:', {
    boxes, 
    originalDimensions: { width: originalWidth, height: originalHeight },
    renderedDimensions: { width: renderedWidth, height: renderedHeight },
    containerSize
  });
  
  // 이미지 위치 계산 (중앙 정렬)
  const offsetX = (containerSize - renderedWidth) / 2;
  const offsetY = (containerSize - renderedHeight) / 2;
  
  return (
    <div 
      className="bounding-boxes-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    >
      {boxes.map((box, index) => {
        let boxColor = box.class_color || '#FF5722';
        
        try {
          // API에서 넘어온 정규화된 값(0~1) 처리
          const h = box.h || 0;  // 높이 (정규화)
          const w = box.w || 0;  // 너비 (정규화)
          const cx = box.cx || 0; // x 중심점 (정규화)
          const cy = box.cy || 0; // y 중심점 (정규화)
          
          // 정규화된 값을 실제 렌더링 크기로 변환
          const boxWidth = w * renderedWidth;
          const boxHeight = h * renderedHeight;
          
          // 중심점에서 좌상단 좌표로 변환
          const x = offsetX + (cx * renderedWidth) - (boxWidth / 2);
          const y = offsetY + (cy * renderedHeight) - (boxHeight / 2);
          
          console.log(`박스 #${index}:`, { 
            원본정규화: { cx, cy, w, h }, 
            변환결과: { x, y, width: boxWidth, height: boxHeight } 
          });
          
          return (
            <div 
              key={index}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: `${boxWidth}px`,
                height: `${boxHeight}px`,
                border: `2px solid ${boxColor}`,
                backgroundColor: `${boxColor}20`,
                boxSizing: 'border-box'
              }}
              title={box.class_name || ''}
            />
          );
        } catch (error) {
          console.error('바운딩 박스 렌더링 오류:', error, box);
          return null;
        }
      }).filter(Boolean)}
    </div>
  );
};

/**
 * Annotation Grid Component
 * 썸네일 뷰로 데이터를 그리드 형태로 표시
 * 
 * @param {Object} props
 * @param {Array} props.annotations - List of annotations to display
 * @param {Function} props.onViewDetails - Function to call when a card is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Object} props.selectedItems - Object containing selected items with their IDs as keys
 * @param {Function} props.setSelectedItems - Function to update selected items
 */
const AnnotationGrid = ({ 
  annotations, 
  onViewDetails, 
  onDelete, 
  selectedItems = {}, 
  setSelectedItems = null 
}) => {
  // 내부 상태 사용 여부 결정 (부모로부터 props가 전달되지 않은 경우 내부 상태 사용)
  const [internalSelectedItems, setInternalSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  // 썸네일 크기 설정
  const THUMBNAIL_SIZE = 140; // 썸네일 크기 (픽셀)
  
  // 실제 사용할 상태 및 setter 결정
  const effectiveSelectedItems = setSelectedItems ? selectedItems : internalSelectedItems;
  const effectiveSetSelectedItems = setSelectedItems || setInternalSelectedItems;

  // 모든 항목 선택/해제
  const handleSelectAll = (e) => {
    e.stopPropagation();
    const isAllSelected = !selectAll;
    setSelectAll(isAllSelected);
    
    const newSelectedItems = {};
    if (isAllSelected) {
      annotations.forEach(item => {
        newSelectedItems[item.id] = true;
      });
    }
    effectiveSetSelectedItems(newSelectedItems);
  };

  // 개별 항목 선택/해제
  const handleSelectItem = (e, id) => {
    e.stopPropagation();
    
    // 이벤트 전파 중지 (클릭 하이라이트나 다른 이벤트 방지)
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    effectiveSetSelectedItems(prev => {
      const newItems = { ...prev };
      newItems[id] = !prev[id];
      
      // selectAll 업데이트
      const allSelected = annotations.every(item => 
        newItems[item.id] === true
      );
      setSelectAll(allSelected);
      
      return newItems;
    });
  };

  // annotations가 변경될 때 선택 상태 초기화
  useEffect(() => {
    effectiveSetSelectedItems({});
    setSelectAll(false);
  }, [annotations, effectiveSetSelectedItems]);

  // 카드 클릭시 세부 정보 보기
  const handleCardClick = (id) => {
    // 선택된 항목이 없을 때만 세부 정보로 바로 이동 
    if (Object.keys(effectiveSelectedItems).filter(itemId => effectiveSelectedItems[itemId]).length === 0) {
      onViewDetails(id);
    }
  };

  /**
   * 상태에 맞는 태그를 렌더링합니다
   */
  const renderStatusTag = (status) => {
    let backgroundColor = "#E0E0E0";
    let textColor = "#555555";
    let icon = null;
    let displayText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    if (status === "completed" || status === "Completed") {
      backgroundColor = "#E0F2F1";
      textColor = "#00B69B";
      icon = <FaCheck size={10} style={{ marginRight: '4px' }} />;
      displayText = "Completed";
    } else if (status === "pending" || status === "Pending") {
      backgroundColor = "#FFF8E1";
      textColor = "#FCAA0B";
      icon = <FaClock size={10} style={{ marginRight: '4px' }} />;
      displayText = "Pending";
    }
    
    return (
      <span 
        className="grid-status-tag"
        style={{ 
          backgroundColor: backgroundColor,
          color: textColor
        }}
      >
        {icon}
        {displayText}
      </span>
    );
  };

  /**
   * 그리드 카드 렌더링
   */
  const renderCard = (annotation) => {
    const isSelected = !!effectiveSelectedItems[annotation.id];
    
    // 이미지 경로 및 크기 정보
    const imagePath = annotation.filePath || (annotation.dimensions && annotation.dimensions.imagePath);
    const imageWidth = annotation.dimensions?.width || 640;
    const imageHeight = annotation.dimensions?.height || 640;
    
    // 이미지 URL 구성
    const imageUrl = imagePath ? 
      (imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}/${imagePath}`) : 
      null;
    
    return (
      <div 
        key={annotation.id}
        className={`annotation-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleCardClick(annotation.id)}
      >
        <div className="annotation-card-header">
          <div 
            className="checkbox-container" 
            onClick={(e) => e.stopPropagation()}
          >
            <CheckboxCell 
              checked={isSelected}
              onChange={(e) => handleSelectItem(e, annotation.id)}
            />
          </div>
          <div className="annotation-title">{annotation.id}</div>
        </div>
        
        <div className="annotation-card-image-container">
          {imageUrl ? (
            <ThumbnailImage 
              imageUrl={imageUrl}
              boundingBoxes={annotation.boundingBoxes || []}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              thumbnailSize={THUMBNAIL_SIZE}
            />
          ) : (
            <div className="thumbnail-placeholder">
              <span>Image</span>
            </div>
          )}
        </div>
        
        <div className="card-content">
          <div className="card-info">
            <div className="info-item">
              <div className="info-label">Camera:</div>
              <div className="info-value">{annotation.cameraId}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Confidence:</div>
              <div className="info-value">{formatConfidenceScore(annotation.confidenceScore)}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Defects:</div>
              <div className="info-value">{annotation.defectCount}</div>
            </div>
          </div>
          
          <div className="annotation-card-footer">
            {renderStatusTag(annotation.status)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="annotation-grid-container">
      <div className="grid-actions">
        <div className="select-all-control">
          <CheckboxCell 
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <span className="select-all-label">Select All</span>
        </div>
        
        <div className="grid-info">
          {annotations.length > 0 ? (
            <span>{Object.keys(effectiveSelectedItems).filter(id => effectiveSelectedItems[id]).length} of {annotations.length} selected</span>
          ) : (
            <span>No data available</span>
          )}
        </div>
      </div>
      
      <div className="grid-content">
        {annotations.length > 0 ? (
          <div className="annotation-grid">
            {annotations.map(renderCard)}
          </div>
        ) : (
          <div className="no-data-message">
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationGrid; 