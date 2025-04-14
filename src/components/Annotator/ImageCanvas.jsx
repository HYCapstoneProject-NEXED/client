import React, { useState, useRef, useEffect } from 'react';
import './ImageCanvas.css';

const ImageCanvas = ({ defects, selectedDefect, onDefectSelect, onCoordinateUpdate }) => {
  const canvasRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  
  // 주석(바운딩 박스) 위치 상태 관리
  const [boxPositions, setBoxPositions] = useState({});
  const [isBoxDragging, setIsBoxDragging] = useState(false);
  const [boxDragInfo, setBoxDragInfo] = useState({ id: null, startX: 0, startY: 0 });

  // 리사이즈 상태 관리
  const [isResizing, setIsResizing] = useState(false);
  const [resizeInfo, setResizeInfo] = useState({ 
    id: null, 
    handle: null, 
    startX: 0, 
    startY: 0, 
    originalX: 0, 
    originalY: 0, 
    originalWidth: 0, 
    originalHeight: 0 
  });

  // 캔버스 크기 측정
  useEffect(() => {
    if (canvasRef.current) {
      const updateDimensions = () => {
        setCanvasDimensions({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        });
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, [canvasRef]);

  // 컴포넌트 마운트 시 초기 박스 위치 설정 (defects가 변경될 때만 수행)
  useEffect(() => {
    // defects가 변경되었을 때만 초기 위치를 설정
    const initialPositions = {};
    defects.forEach(defect => {
      const defectId = String(defect.id);
      // 이미 boxPositions에 있는 defect은 위치를 유지
      if (!boxPositions[defectId]) {
        initialPositions[defectId] = {
          x: defect.coordinates.x,
          y: defect.coordinates.y
        };
      } else {
        initialPositions[defectId] = boxPositions[defectId];
      }
    });
    setBoxPositions(prev => ({...prev, ...initialPositions}));
  }, [defects.length]); // defects 배열의 길이가 변경될 때만 실행

  // 박스 위치를 이미지 영역 내로 제한하는 함수
  const constrainBoxPosition = (x, y, width, height) => {
    // 이미지 영역 경계 내로 제한
    const constrainedX = Math.max(0, Math.min(x, canvasDimensions.width - width));
    const constrainedY = Math.max(0, Math.min(y, canvasDimensions.height - height));
    
    return { x: constrainedX, y: constrainedY };
  };

  // 드래그 시작
  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.className === 'annotator-placeholder-text') {
      setIsDragging(true);
      setDragStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // 드래그 중
  const handleMouseMove = (e) => {
    // 캔버스 드래그
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartPosition.x,
        y: e.clientY - dragStartPosition.y
      });
    }
    
    // 박스 드래그
    if (isBoxDragging && boxDragInfo.id) {
      const deltaX = (e.clientX - boxDragInfo.startX) / scale;
      const deltaY = (e.clientY - boxDragInfo.startY) / scale;
      
      const newX = boxDragInfo.originalX + deltaX;
      const newY = boxDragInfo.originalY + deltaY;
      
      // 현재 드래그 중인 defect 찾기
      const defect = defects.find(d => String(d.id) === boxDragInfo.id);
      if (defect) {
        // 박스 위치를 이미지 영역 내로 제한
        const { x: constrainedX, y: constrainedY } = constrainBoxPosition(
          newX, 
          newY, 
          defect.coordinates.width, 
          defect.coordinates.height
        );
        
        setBoxPositions(prev => ({
          ...prev,
          [boxDragInfo.id]: {
            x: constrainedX,
            y: constrainedY
          }
        }));
      }
    }
    
    // 박스 리사이즈
    if (isResizing && resizeInfo.id) {
      const deltaX = (e.clientX - resizeInfo.startX) / scale;
      const deltaY = (e.clientY - resizeInfo.startY) / scale;
      
      let newX = resizeInfo.originalX;
      let newY = resizeInfo.originalY;
      let newWidth = resizeInfo.originalWidth;
      let newHeight = resizeInfo.originalHeight;
      
      // 핸들에 따라 크기와 위치 조정
      switch (resizeInfo.handle) {
        case 'top-left':
          newX = resizeInfo.originalX + deltaX;
          newY = resizeInfo.originalY + deltaY;
          newWidth = resizeInfo.originalWidth - deltaX;
          newHeight = resizeInfo.originalHeight - deltaY;
          break;
        case 'top-right':
          newY = resizeInfo.originalY + deltaY;
          newWidth = resizeInfo.originalWidth + deltaX;
          newHeight = resizeInfo.originalHeight - deltaY;
          break;
        case 'bottom-left':
          newX = resizeInfo.originalX + deltaX;
          newWidth = resizeInfo.originalWidth - deltaX;
          newHeight = resizeInfo.originalHeight + deltaY;
          break;
        case 'bottom-right':
          newWidth = resizeInfo.originalWidth + deltaX;
          newHeight = resizeInfo.originalHeight + deltaY;
          break;
        default:
          break;
      }
      
      // 최소 크기 제한
      const minSize = 20;
      if (newWidth < minSize) {
        newWidth = minSize;
        if (['top-left', 'bottom-left'].includes(resizeInfo.handle)) {
          newX = resizeInfo.originalX + resizeInfo.originalWidth - minSize;
        }
      }
      
      if (newHeight < minSize) {
        newHeight = minSize;
        if (['top-left', 'top-right'].includes(resizeInfo.handle)) {
          newY = resizeInfo.originalY + resizeInfo.originalHeight - minSize;
        }
      }
      
      // 박스가 이미지 영역을 벗어나지 않도록 제한
      const constrainedPosition = constrainBoxPosition(newX, newY, newWidth, newHeight);
      
      // 위치와 크기 업데이트
      setBoxPositions(prev => ({
        ...prev,
        [resizeInfo.id]: {
          x: constrainedPosition.x,
          y: constrainedPosition.y
        }
      }));
      
      // defect 객체도 업데이트
      const resizingDefect = defects.find(d => String(d.id) === resizeInfo.id);
      if (resizingDefect && onCoordinateUpdate) {
        const widthChange = newWidth - resizeInfo.originalWidth;
        const heightChange = newHeight - resizeInfo.originalHeight;
        
        // 왼쪽/위쪽 핸들로 리사이즈 시 위치도 변경
        if (['top-left', 'bottom-left'].includes(resizeInfo.handle) && constrainedPosition.x !== newX) {
          newWidth = resizeInfo.originalWidth;
        }
        
        if (['top-left', 'top-right'].includes(resizeInfo.handle) && constrainedPosition.y !== newY) {
          newHeight = resizeInfo.originalHeight;
        }
        
        onCoordinateUpdate(resizeInfo.id, {
          x: constrainedPosition.x,
          y: constrainedPosition.y,
          width: newWidth,
          height: newHeight
        });
      }
    }
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // 박스 드래그가 끝났을 때 좌표 업데이트
    if (isBoxDragging && boxDragInfo.id) {
      const newPosition = boxPositions[boxDragInfo.id];
      if (newPosition && onCoordinateUpdate) {
        onCoordinateUpdate(boxDragInfo.id, {
          x: newPosition.x,
          y: newPosition.y
        });
      }
    }
    
    setIsBoxDragging(false);
    setIsResizing(false);
  };

  // 휠 스크롤로 줌 인/아웃
  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation(); // 이벤트 버블링 방지
    
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 3);
    setScale(newScale);
  };

  // 바운딩 박스 드래그 시작
  const handleBoxMouseDown = (e, defectId) => {
    e.stopPropagation();
    onDefectSelect(defectId);
    
    const defectIdStr = String(defectId);
    
    setIsBoxDragging(true);
    setBoxDragInfo({
      id: defectIdStr,
      startX: e.clientX,
      startY: e.clientY,
      originalX: boxPositions[defectIdStr]?.x || 0,
      originalY: boxPositions[defectIdStr]?.y || 0
    });
  };

  // 리사이즈 핸들 드래그 시작
  const handleResizeStart = (e, defectId, handle) => {
    e.stopPropagation();
    e.preventDefault();
    
    const defectIdStr = String(defectId);
    const defect = defects.find(d => String(d.id) === defectIdStr);
    
    if (!defect) return;
    
    setIsResizing(true);
    setResizeInfo({
      id: defectIdStr,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      originalX: boxPositions[defectIdStr]?.x || defect.coordinates.x,
      originalY: boxPositions[defectIdStr]?.y || defect.coordinates.y,
      originalWidth: defect.coordinates.width,
      originalHeight: defect.coordinates.height
    });
  };

  // 컴포넌트가 마운트될 때 이벤트 리스너 등록, 언마운트될 때 제거
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartPosition, isBoxDragging, boxDragInfo, isResizing, resizeInfo, scale, defects]);

  // 박스 클래스명 반환 함수 추가 
  const getBoxClassName = (defectType) => {
    switch(defectType) {
      case 'Defect_A':
        return 'annotator-defect-a-box';
      case 'Defect_B':
        return 'annotator-defect-b-box';
      case 'Defect_C':
        return 'annotator-defect-c-box';
      case 'Defect_D':
        return 'annotator-defect-d-box';
      default:
        return 'annotator-defect-a-box';
    }
  };

  return (
    <div 
      className="annotator-image-container"
      onWheel={handleWheel}
    >
      {/* 이미지 플레이스홀더 */}
      <div 
        className="annotator-image-placeholder"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* 실제 프로젝트에서는 여기에 이미지를 로드하게 됨 */}
        <div className="annotator-placeholder-text">이미지 영역</div>
        
        {/* 결함 바운딩 박스 */}
        {defects.map((defect) => {
          const defectId = String(defect.id);
          const boxPosition = boxPositions[defectId] || defect.coordinates;
          
          return (
            <div 
              key={defectId}
              className={`annotator-bounding-box ${selectedDefect === defect.id ? 'selected' : ''} ${getBoxClassName(defect.type)}`}
              style={{
                left: `${boxPosition.x}px`,
                top: `${boxPosition.y}px`,
                width: `${defect.coordinates.width}px`,
                height: `${defect.coordinates.height}px`,
                cursor: selectedDefect === defect.id ? 'move' : 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDefectSelect(defect.id);
              }}
              onMouseDown={(e) => handleBoxMouseDown(e, defect.id)}
            >
              <div className="annotator-box-label">
                ({defect.id}) {defect.confidence.toFixed(2)}
              </div>
              {/* 리사이즈 핸들 - 선택된 바운딩 박스에만 표시 */}
              {selectedDefect === defect.id && (
                <>
                  <div 
                    className="annotator-resize-handle annotator-top-left" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, 'top-left')}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-top-right" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, 'top-right')}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-bottom-left" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, 'bottom-left')}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-bottom-right" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, 'bottom-right')}
                  ></div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageCanvas; 