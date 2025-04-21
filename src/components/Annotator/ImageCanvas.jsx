/**
 * 이미지 캔버스 컴포넌트
 * 이미지 표시, 바운딩 박스 생성 및 편집, 확대/축소 등의 어노테이션 핵심 기능을 구현
 */
import React, { useState, useRef, useEffect } from 'react';
import './ImageCanvas.css';

/**
 * 이미지 캔버스 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.defects - 결함 목록
 * @param {string} props.selectedDefect - 선택된 결함 ID
 * @param {function} props.onDefectSelect - 결함 선택 핸들러
 * @param {function} props.onCoordinateChange - 좌표 변경 핸들러 (바운딩 박스 이동/리사이즈 시 호출)
 * @param {function} props.onCanvasClick - 캔버스 클릭 핸들러 (빈 영역 클릭 시 호출)
 * @param {function} props.onAddBox - 바운딩 박스 추가 핸들러
 * @param {string} props.activeTool - 현재 활성화된 도구 ('hand' 또는 'rectangle')
 * @param {Object} props.toolTypes - 도구 유형 상수
 * @param {function} props.onToolChange - 도구 변경 핸들러
 * @param {string} props.currentDefectType - 현재 선택된 결함 유형 (새 박스 생성 시 적용)
 */
const ImageCanvas = ({ 
  defects, 
  selectedDefect, 
  onDefectSelect, 
  onCoordinateChange, 
  onCanvasClick, 
  onAddBox,
  activeTool,
  toolTypes,
  onToolChange,
  currentDefectType 
}) => {
  // 이미지 캔버스 요소 참조
  const canvasRef = useRef(null);
  
  // 캔버스 이동(pan) 관련 상태
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  
  // 확대/축소(zoom) 관련 상태
  const [scale, setScale] = useState(1);
  
  // 캔버스 크기 상태
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  
  // 바운딩 박스 위치 상태 관리
  const [boxPositions, setBoxPositions] = useState({});
  
  // 바운딩 박스 드래그 관련 상태
  const [isBoxDragging, setIsBoxDragging] = useState(false);
  const [boxDragInfo, setBoxDragInfo] = useState({ 
    id: null,            // 드래그 중인 박스 ID
    startX: 0,           // 드래그 시작 마우스 X 위치 
    startY: 0,           // 드래그 시작 마우스 Y 위치
    originalX: 0,        // 드래그 시작 시 박스 원래 X 위치
    originalY: 0,        // 드래그 시작 시 박스 원래 Y 위치
    currentX: 0,         // 현재 박스 X 위치
    currentY: 0          // 현재 박스 Y 위치
  });

  // 바운딩 박스 크기 조정(resize) 관련 상태
  const [isResizing, setIsResizing] = useState(false);
  const [resizeInfo, setResizeInfo] = useState({ 
    id: null,            // 리사이즈 중인 박스 ID
    handle: null,        // 현재 드래그 중인 핸들(모서리/변)
    startX: 0,           // 리사이즈 시작 마우스 X 위치
    startY: 0,           // 리사이즈 시작 마우스 Y 위치
    originalX: 0,        // 리사이즈 시작 시 박스 원래 X 위치
    originalY: 0,        // 리사이즈 시작 시 박스 원래 Y 위치
    originalWidth: 0,    // 리사이즈 시작 시 박스 원래 너비
    originalHeight: 0,   // 리사이즈 시작 시 박스 원래 높이
    currentX: 0,         // 현재 박스 X 위치
    currentY: 0,         // 현재 박스 Y 위치
    currentWidth: 0,     // 현재 박스 너비
    currentHeight: 0,    // 현재 박스 높이
    isValid: true        // 현재 리사이즈가 유효한지 여부
  });

  // 새 바운딩 박스 그리기 관련 상태
  const [isDrawingBox, setIsDrawingBox] = useState(false);
  const [drawStartPos, setDrawStartPos] = useState({ x: 0, y: 0 });
  const [currentDrawPos, setCurrentDrawPos] = useState({ x: 0, y: 0 });

  // 리사이즈 핸들 상수 정의
  const RESIZE_HANDLES = {
    TOP_LEFT: 'top-left',       // 좌상단 모서리
    TOP: 'top',                 // 상단 변
    TOP_RIGHT: 'top-right',     // 우상단 모서리
    RIGHT: 'right',             // 우측 변
    BOTTOM_RIGHT: 'bottom-right', // 우하단 모서리
    BOTTOM: 'bottom',           // 하단 변
    BOTTOM_LEFT: 'bottom-left', // 좌하단 모서리
    LEFT: 'left',               // 좌측 변
  };

  // 캔버스 크기 측정
  useEffect(() => {
    if (canvasRef.current) {
      /**
       * 캔버스 크기를 업데이트하는 함수
       * 윈도우 리사이즈 이벤트에 반응하여 캔버스 크기를 조정
       */
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
    // defects가 변경되었을 때 실행됨
    console.log('defects changed:', defects);
    
    // defects가 변경되었을 때 항상 boxPositions를 최신 상태로 업데이트
    const updatedPositions = {};
    defects.forEach(defect => {
      const defectId = String(defect.id);
      updatedPositions[defectId] = {
        x: defect.coordinates.x,
        y: defect.coordinates.y
      };
    });
    
    // 완전히 새로운 객체로 boxPositions 업데이트
    setBoxPositions(updatedPositions);
  }, [defects]); // defects 배열이 변경될 때 실행

  // defects 배열 변경 감지 및 적용 - 클래스 변경 시 바운딩 박스 색상 변경 적용
  useEffect(() => {
    // defects 배열의 내용이 변경되면 실행됨
    // 여기서는 별도 로직이 필요 없음, 렌더링 시 getBoxClassName 함수로 defect.type에 따라 클래스명이 변경됨
  }, [defects]);

  /**
   * 박스 위치를 이미지 영역 내로 제한하는 함수
   * 바운딩 박스가 이미지 영역을 벗어나지 않도록 좌표 값을 조정
   * 
   * @param {number} x - 박스의 X 좌표
   * @param {number} y - 박스의 Y 좌표
   * @param {number} width - 박스의 너비
   * @param {number} height - 박스의 높이
   * @returns {Object} 제한된 x, y 좌표
   */
  const constrainBoxPosition = (x, y, width, height) => {
    // 이미지 영역 경계 내로 제한
    const constrainedX = Math.max(0, Math.min(x, canvasDimensions.width - width));
    const constrainedY = Math.max(0, Math.min(y, canvasDimensions.height - height));
    
    return { x: constrainedX, y: constrainedY };
  };

  /**
   * 마우스 다운 이벤트 핸들러
   * 도구 유형에 따라 다른 동작 수행:
   * - 손 도구: 캔버스 드래그 시작
   * - 사각형 도구: 바운딩 박스 그리기 시작
   * 
   * @param {MouseEvent} e - 마우스 이벤트 객체
   */
  const handleMouseDown = (e) => {
    // 클릭한 요소가 이미지 영역 또는 플레이스홀더 텍스트인 경우에만 처리
    if (e.target === canvasRef.current || e.target.className === 'annotator-placeholder-text' || e.target.classList.contains('annotator-image-placeholder')) {
      if (activeTool === toolTypes.HAND) {
        // 손 도구 - 캔버스 이동
        setIsDragging(true);
        setDragStartPosition({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
      } else if (activeTool === toolTypes.RECTANGLE) {
        // 사각형 도구 - 바운딩 박스 그리기 시작
        const rect = canvasRef.current.getBoundingClientRect();
        
        // 정확한 이미지 위치에 맞게 좌표 계산
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // 이미지 내 실제 좌표로 변환
        const x = (mouseX - position.x) / scale;
        const y = (mouseY - position.y) / scale;
        
        // 이미지 영역 내부인지 확인
        const isInsideImage = x >= 0 && y >= 0 && x <= canvasDimensions.width && y <= canvasDimensions.height;
        
        console.log('Mouse position:', { mouseX, mouseY, position, scale, isInsideImage });
        
        // 이미지 영역 내부일 때만 박스 그리기 시작
        if (isInsideImage) {
          console.log('Calculated start position:', { x, y });
          
          setIsDrawingBox(true);
          setDrawStartPos({ x, y });
          setCurrentDrawPos({ x, y });
        } else {
          console.log('Click outside image area, ignoring');
        }
      }
      
      // 빈 영역 클릭 시 선택 해제 (이미지 영역을 직접 클릭한 경우에만)
      if (onCanvasClick && (e.target === canvasRef.current || e.target.className === 'annotator-placeholder-text')) {
        onCanvasClick(e);
      }
    }
  };

  /**
   * 마우스 이동 이벤트 핸들러
   * 현재 상태에 따라 다른 동작 수행:
   * - 캔버스 드래그 중: 캔버스 위치 업데이트
   * - 박스 드래그 중: 선택된 박스 위치 업데이트
   * - 박스 리사이즈 중: 선택된 박스 크기 업데이트
   * - 박스 그리기 중: 새 박스 크기 업데이트
   * 
   * @param {MouseEvent} e - 마우스 이벤트 객체
   */
  const handleMouseMove = (e) => {
    // 캔버스 드래그
    if (isDragging && activeTool === toolTypes.HAND) {
      setPosition({
        x: e.clientX - dragStartPosition.x,
        y: e.clientY - dragStartPosition.y
      });
    }
    
    // 박스 드래그
    if (isBoxDragging && boxDragInfo.id && activeTool === toolTypes.HAND) {
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
        
        // 화면 표시용 위치 업데이트 (실제 defect 객체는 마우스 업 이벤트에서 업데이트)
        setBoxDragInfo(prev => ({
          ...prev,
          currentX: constrainedX,
          currentY: constrainedY
        }));
      }
    }
    
    // 박스 리사이즈
    if (isResizing && resizeInfo.id && activeTool === toolTypes.HAND) {
      const deltaX = (e.clientX - resizeInfo.startX) / scale;
      const deltaY = (e.clientY - resizeInfo.startY) / scale;
      
      let newX = resizeInfo.originalX;
      let newY = resizeInfo.originalY;
      let newWidth = resizeInfo.originalWidth;
      let newHeight = resizeInfo.originalHeight;
      
      // 핸들에 따라 크기와 위치 조정
      switch (resizeInfo.handle) {
        case RESIZE_HANDLES.TOP_LEFT:
          newX = resizeInfo.originalX + deltaX;
          newY = resizeInfo.originalY + deltaY;
          newWidth = resizeInfo.originalWidth - deltaX;
          newHeight = resizeInfo.originalHeight - deltaY;
          break;
        case RESIZE_HANDLES.TOP:
          newY = resizeInfo.originalY + deltaY;
          newHeight = resizeInfo.originalHeight - deltaY;
          break;
        case RESIZE_HANDLES.TOP_RIGHT:
          newY = resizeInfo.originalY + deltaY;
          newWidth = resizeInfo.originalWidth + deltaX;
          newHeight = resizeInfo.originalHeight - deltaY;
          break;
        case RESIZE_HANDLES.RIGHT:
          newWidth = resizeInfo.originalWidth + deltaX;
          break;
        case RESIZE_HANDLES.BOTTOM_RIGHT:
          newWidth = resizeInfo.originalWidth + deltaX;
          newHeight = resizeInfo.originalHeight + deltaY;
          break;
        case RESIZE_HANDLES.BOTTOM:
          newHeight = resizeInfo.originalHeight + deltaY;
          break;
        case RESIZE_HANDLES.BOTTOM_LEFT:
          newX = resizeInfo.originalX + deltaX;
          newWidth = resizeInfo.originalWidth - deltaX;
          newHeight = resizeInfo.originalHeight + deltaY;
          break;
        case RESIZE_HANDLES.LEFT:
          newX = resizeInfo.originalX + deltaX;
          newWidth = resizeInfo.originalWidth - deltaX;
          break;
        default:
          break;
      }
      
      // 최소 크기 제한
      const minSize = 20;
      if (newWidth < minSize) {
        newWidth = minSize;
        if ([RESIZE_HANDLES.TOP_LEFT, RESIZE_HANDLES.BOTTOM_LEFT, RESIZE_HANDLES.LEFT].includes(resizeInfo.handle)) {
          newX = resizeInfo.originalX + resizeInfo.originalWidth - minSize;
        }
      }
      
      if (newHeight < minSize) {
        newHeight = minSize;
        if ([RESIZE_HANDLES.TOP_LEFT, RESIZE_HANDLES.TOP_RIGHT, RESIZE_HANDLES.TOP].includes(resizeInfo.handle)) {
          newY = resizeInfo.originalY + resizeInfo.originalHeight - minSize;
        }
      }
      
      // 이미지 영역 경계를 계산
      const maxX = canvasDimensions.width;
      const maxY = canvasDimensions.height;
      
      // 박스가 이미지 영역을 벗어나지 않도록 크기와 위치 제한
      if (newX < 0) {
        const diff = 0 - newX;
        newX = 0;
        if ([RESIZE_HANDLES.TOP_LEFT, RESIZE_HANDLES.BOTTOM_LEFT, RESIZE_HANDLES.LEFT].includes(resizeInfo.handle)) {
          newWidth = Math.max(minSize, newWidth - diff);
        }
      }
      
      if (newY < 0) {
        const diff = 0 - newY;
        newY = 0;
        if ([RESIZE_HANDLES.TOP_LEFT, RESIZE_HANDLES.TOP_RIGHT, RESIZE_HANDLES.TOP].includes(resizeInfo.handle)) {
          newHeight = Math.max(minSize, newHeight - diff);
        }
      }
      
      // 오른쪽 경계 확인
      if (newX + newWidth > maxX) {
        if ([RESIZE_HANDLES.TOP_RIGHT, RESIZE_HANDLES.BOTTOM_RIGHT, RESIZE_HANDLES.RIGHT].includes(resizeInfo.handle)) {
          newWidth = maxX - newX;
        } else {
          // 왼쪽 핸들의 경우, x 위치 조정
          const overflow = (newX + newWidth) - maxX;
          newX = Math.max(0, newX - overflow);
        }
      }
      
      // 아래쪽 경계 확인
      if (newY + newHeight > maxY) {
        if ([RESIZE_HANDLES.BOTTOM_LEFT, RESIZE_HANDLES.BOTTOM_RIGHT, RESIZE_HANDLES.BOTTOM].includes(resizeInfo.handle)) {
          newHeight = maxY - newY;
        } else {
          // 위쪽 핸들의 경우, y 위치 조정
          const overflow = (newY + newHeight) - maxY;
          newY = Math.max(0, newY - overflow);
        }
      }
      
      // 위치 업데이트
      setBoxPositions(prev => ({
        ...prev,
        [resizeInfo.id]: {
          x: newX,
          y: newY
        }
      }));
      
      // 현재 리사이즈 정보를 저장 (마우스 업 이벤트에서 사용)
      resizeInfo.currentX = newX;
      resizeInfo.currentY = newY;
      resizeInfo.currentWidth = newWidth;
      resizeInfo.currentHeight = newHeight;
    }

    // 박스 그리기
    if (isDrawingBox && activeTool === toolTypes.RECTANGLE) {
      const rect = canvasRef.current.getBoundingClientRect();
      
      // 정확한 이미지 위치에 맞게 좌표 계산
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // 이미지 내 실제 좌표로 변환
      const x = (mouseX - position.x) / scale;
      const y = (mouseY - position.y) / scale;
      
      // 이미지 영역 내에서만 커서 위치 업데이트
      // 커서가 이미지 영역을 벗어나도 그리기는 계속되지만, 이미지 경계에서 잘림
      const constrainedX = Math.max(0, Math.min(x, canvasDimensions.width));
      const constrainedY = Math.max(0, Math.min(y, canvasDimensions.height));
      
      setCurrentDrawPos({ x: constrainedX, y: constrainedY });
    }
  };

  /**
   * 마우스 업 이벤트 핸들러
   * 드래그, 리사이즈, 그리기 등의 작업 완료 처리
   * 
   * @param {MouseEvent} e - 마우스 이벤트 객체
   */
  const handleMouseUp = (e) => {
    // 캔버스 드래그 종료
    if (isDragging) {
      setIsDragging(false);
    }
    
    // 박스 드래그 종료
    if (isBoxDragging && boxDragInfo.id) {
      setIsBoxDragging(false);
      
      // 부모 컴포넌트에 좌표 업데이트 알림
      if (onCoordinateChange) {
        onCoordinateChange(boxDragInfo.id, {
          x: boxDragInfo.currentX,
          y: boxDragInfo.currentY
        });
      }
    }
    
    // 리사이징 종료
    if (isResizing && resizeInfo.id) {
      setIsResizing(false);
      
      // 부모 컴포넌트에 크기 업데이트 알림
      if (onCoordinateChange && resizeInfo.isValid) {
        onCoordinateChange(resizeInfo.id, {
          x: resizeInfo.currentX,
          y: resizeInfo.currentY,
          width: resizeInfo.currentWidth,
          height: resizeInfo.currentHeight
        });
      }
    }
    
    // 바운딩 박스 그리기 종료
    if (isDrawingBox) {
      const rect = canvasRef.current.getBoundingClientRect();
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // 이미지 내 실제 좌표로 변환
      const currentX = (mouseX - position.x) / scale;
      const currentY = (mouseY - position.y) / scale;
      
      // 시작점과 종료점으로부터 사각형 좌표와 크기 계산
      const x = Math.min(drawStartPos.x, currentX);
      const y = Math.min(drawStartPos.y, currentY);
      const width = Math.abs(currentX - drawStartPos.x);
      const height = Math.abs(currentY - drawStartPos.y);
      
      // 이미지 내부에서 시작된 경우에만 박스 추가 가능
      const isInsideImage = 
        drawStartPos.x >= 0 && drawStartPos.y >= 0 && 
        drawStartPos.x <= canvasDimensions.width && 
        drawStartPos.y <= canvasDimensions.height;
      
      // 최소 크기 확인 (더 작은 크기 허용) 및 이미지 영역 내부에서 시작된 경우에만 박스 추가
      if (width > 5 && height > 5 && isInsideImage) {
        // 새 바운딩 박스 추가
        if (onAddBox) {
          console.log('Adding new box with coordinates', { x, y, width, height });
          
          // 정확한 좌표로 박스 추가
          const adjustedCoordinates = {
            x: x,
            y: y,
            width: width,
            height: height
          };
          
          onAddBox(adjustedCoordinates);
          
          // 바운딩 박스를 추가한 후 손바닥 도구로 자동 전환
          if (onToolChange) {
            console.log('Switching to HAND tool after adding box');
            onToolChange(toolTypes.HAND);
          }
        } else {
          console.log('onAddBox function is not available');
        }
      } else {
        if (!isInsideImage) {
          console.log('Box started outside image area, not adding');
        } else {
          console.log('Box too small, not adding', { width, height });
        }
      }
    }
    
    // 그리기 상태 초기화는 onAddBox 호출 후에 진행
    setIsDrawingBox(false);
  };

  /**
   * 마우스 휠 이벤트 핸들러
   * 이미지 확대/축소(줌) 처리
   * 
   * @param {WheelEvent} e - 휠 이벤트 객체
   */
  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation(); // 이벤트 버블링 방지
    
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 3);
    setScale(newScale);
  };

  /**
   * 바운딩 박스 마우스 다운 이벤트 핸들러
   * 박스 선택 및 드래그 시작 처리
   * 
   * @param {MouseEvent} e - 마우스 이벤트 객체
   * @param {string} defectId - 선택한 결함 ID
   */
  const handleBoxMouseDown = (e, defectId) => {
    e.stopPropagation();
    
    // 사각형 도구가 활성화되어 있을 때는 박스 선택 무시
    if (activeTool === toolTypes.RECTANGLE) {
      console.log('Box selection ignored - Rectangle tool is active');
      return;
    }
    
    // 손 도구 활성화 상태에서만 박스 선택 허용
    onDefectSelect(defectId);
    
    if (activeTool === toolTypes.HAND) {
      const defectIdStr = String(defectId);
      
      setIsBoxDragging(true);
      setBoxDragInfo({
        id: defectIdStr,
        startX: e.clientX,
        startY: e.clientY,
        originalX: boxPositions[defectIdStr]?.x || 0,
        originalY: boxPositions[defectIdStr]?.y || 0,
        currentX: boxPositions[defectIdStr]?.x || 0,
        currentY: boxPositions[defectIdStr]?.y || 0
      });
    }
  };

  /**
   * 리사이즈 핸들 마우스 다운 이벤트 핸들러
   * 바운딩 박스 크기 조정 시작 처리
   * 
   * @param {MouseEvent} e - 마우스 이벤트 객체
   * @param {string} defectId - 선택한 결함 ID
   * @param {string} handle - 선택한 핸들 종류 (top, left, bottom-right 등)
   */
  const handleResizeStart = (e, defectId, handle) => {
    e.stopPropagation();
    e.preventDefault();
    
    // 사각형 도구가 활성화되어 있을 때는 리사이즈 무시
    if (activeTool === toolTypes.RECTANGLE) {
      console.log('Resize ignored - Rectangle tool is active');
      return;
    }
    
    if (activeTool === toolTypes.HAND) {
      const defectIdStr = String(defectId);
      const defect = defects.find(d => String(d.id) === defectIdStr);
      
      if (!defect) return;
      
      // 손 도구 활성화 상태에서만 박스 선택 허용
      onDefectSelect(defectId);
      
      setIsResizing(true);
      setResizeInfo({
        id: defectIdStr,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        originalX: boxPositions[defectIdStr]?.x || defect.coordinates.x,
        originalY: boxPositions[defectIdStr]?.y || defect.coordinates.y,
        originalWidth: defect.coordinates.width,
        originalHeight: defect.coordinates.height,
        currentX: boxPositions[defectIdStr]?.x || defect.coordinates.x,
        currentY: boxPositions[defectIdStr]?.y || defect.coordinates.y,
        currentWidth: defect.coordinates.width,
        currentHeight: defect.coordinates.height,
        isValid: true
      });
    }
  };

  // 컴포넌트가 마운트될 때 이벤트 리스너 등록, 언마운트될 때 제거
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging, 
    dragStartPosition, 
    isBoxDragging, 
    boxDragInfo, 
    isResizing, 
    resizeInfo, 
    scale, 
    defects, 
    isDrawingBox, 
    drawStartPos,
    currentDrawPos,
    activeTool,
    position
  ]);

  /**
   * 결함 유형에 따른 CSS 클래스 이름 반환
   * 각 결함 유형별 다른 색상 스타일 적용
   * 
   * @param {string} defectType - 결함 유형
   * @returns {string} CSS 클래스 이름
   */
  const getBoxClassName = (defectType) => {
    switch(defectType) {
      case 'Scratch':
        return 'annotator-defect-a-box';
      case 'Dent':
        return 'annotator-defect-b-box';
      case 'Discoloration':
        return 'annotator-defect-c-box';
      case 'Contamination':
        return 'annotator-defect-d-box';
      // 이전 유형 이름도 지원 (역호환성)
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

  /**
   * 현재 활성 도구에 따른 커서 스타일 계산
   * 손 도구, 사각형 도구 등에 따라 다른 커서 스타일 적용
   * 
   * @returns {string} CSS 커서 스타일
   */
  const getCanvasCursor = () => {
    if (isDragging) return 'grabbing';
    if (activeTool === toolTypes.HAND) return 'grab';
    if (activeTool === toolTypes.RECTANGLE) return 'crosshair';
    return 'default';
  };

  // 렌더링 전에 defects 배열을 정렬하여 선택된 defect가 맨 뒤에 오도록 하기
  const sortedDefects = [...defects].sort((a, b) => {
    // 선택된 defect는 맨 마지막에 렌더링되어 가장 위에 표시됨
    if (String(a.id) === selectedDefect) return 1;
    if (String(b.id) === selectedDefect) return -1;
    return 0;
  });

  // 그리는 중인 바운딩 박스 좌표 계산
  const drawingBox = isDrawingBox ? {
    x: Math.min(drawStartPos.x, currentDrawPos.x),
    y: Math.min(drawStartPos.y, currentDrawPos.y),
    width: Math.abs(currentDrawPos.x - drawStartPos.x),
    height: Math.abs(currentDrawPos.y - drawStartPos.y)
  } : null;

  return (
    <div 
      className="annotator-image-container"
      onWheel={handleWheel}
      onClick={(e) => {
        // 이벤트 타겟이 이미지 컨테이너 자체인 경우에만 처리 (버블링된 이벤트는 무시)
        if (e.currentTarget === e.target && onCanvasClick) {
          onCanvasClick(e);
        }
      }}
    >
      {/* 이미지 플레이스홀더 - 실제 프로젝트에서는 이미지 요소로 대체 */}
      <div 
        className="annotator-image-placeholder"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          cursor: getCanvasCursor()
        }}
      >
        {/* 실제 프로젝트에서는 여기에 이미지를 로드하게 됨 */}
        <div className="annotator-placeholder-text">이미지 영역</div>
        
        {/* 결함 바운딩 박스 렌더링 */}
        {sortedDefects.map((defect) => {
          const defectId = String(defect.id);
          // 현재 드래그/리사이즈 중인 박스는 boxPositions에서, 아니면 원래 좌표 사용
          const boxPosition = boxPositions[defectId] || defect.coordinates;
          const isSelected = selectedDefect === defect.id;
          
          return (
            <div 
              key={defectId}
              className={`annotator-bounding-box ${isSelected ? 'selected' : ''} ${getBoxClassName(defect.type)}`}
              style={{
                left: `${boxPosition.x}px`,
                top: `${boxPosition.y}px`,
                width: `${defect.coordinates.width}px`,
                height: `${defect.coordinates.height}px`,
                zIndex: isSelected ? 100 : 10 // 선택된 박스는 더 높은 z-index를 가짐
              }}
              onMouseDown={(e) => {
                // 박스 내부 클릭 시에만 이동 처리
                if (e.target === e.currentTarget) {
                  handleBoxMouseDown(e, defect.id);
                }
              }}
            >
              {/* 테두리 영역 명시적 추가 (커서 변경용) */}
              <div 
                className="top-left-corner" 
                onMouseDown={(e) => {
                  handleResizeStart(e, defect.id, RESIZE_HANDLES.TOP_LEFT);
                  onDefectSelect(defect.id);
                }}
              ></div>
              <div 
                className="top-right-corner" 
                onMouseDown={(e) => {
                  handleResizeStart(e, defect.id, RESIZE_HANDLES.TOP_RIGHT);
                  onDefectSelect(defect.id);
                }}
              ></div>
              <div 
                className="bottom-left-corner" 
                onMouseDown={(e) => {
                  handleResizeStart(e, defect.id, RESIZE_HANDLES.BOTTOM_LEFT);
                  onDefectSelect(defect.id);
                }}
              ></div>
              <div 
                className="bottom-right-corner" 
                onMouseDown={(e) => {
                  handleResizeStart(e, defect.id, RESIZE_HANDLES.BOTTOM_RIGHT);
                  onDefectSelect(defect.id);
                }}
              ></div>
              <div 
                className="left-border" 
                onMouseDown={(e) => {
                  handleResizeStart(e, defect.id, RESIZE_HANDLES.LEFT);
                  onDefectSelect(defect.id);
                }}
              ></div>
              <div 
                className="top-border" 
                onMouseDown={(e) => {
                  handleResizeStart(e, defect.id, RESIZE_HANDLES.TOP);
                  onDefectSelect(defect.id);
                }}
              ></div>
              <div 
                className="right-border" 
                onMouseDown={(e) => {
                  handleResizeStart(e, defect.id, RESIZE_HANDLES.RIGHT);
                  onDefectSelect(defect.id);
                }}
              ></div>
              <div 
                className="bottom-border" 
                onMouseDown={(e) => {
                  handleResizeStart(e, defect.id, RESIZE_HANDLES.BOTTOM);
                  onDefectSelect(defect.id);
                }}
              ></div>
              
              <div className="annotator-box-label"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleBoxMouseDown(e, defect.id);
                }}
              >
                ({defect.id}) {defect.confidence === 0.9 ? '-' : defect.confidence.toFixed(2)}
              </div>
              {/* 리사이즈 핸들 - 선택된 바운딩 박스에만 표시 */}
              {isSelected && (
                <>
                  <div 
                    className="annotator-resize-handle annotator-top-left" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, RESIZE_HANDLES.TOP_LEFT)}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-top" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, RESIZE_HANDLES.TOP)}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-top-right" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, RESIZE_HANDLES.TOP_RIGHT)}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-right" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, RESIZE_HANDLES.RIGHT)}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-bottom-right" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, RESIZE_HANDLES.BOTTOM_RIGHT)}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-bottom" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, RESIZE_HANDLES.BOTTOM)}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-bottom-left" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, RESIZE_HANDLES.BOTTOM_LEFT)}
                  ></div>
                  <div 
                    className="annotator-resize-handle annotator-left" 
                    onMouseDown={(e) => handleResizeStart(e, defect.id, RESIZE_HANDLES.LEFT)}
                  ></div>
                </>
              )}
            </div>
          );
        })}

        {/* 현재 그리는 중인 바운딩 박스 */}
        {isDrawingBox && activeTool === toolTypes.RECTANGLE && (
          <div 
            className={`annotator-bounding-box ${getBoxClassName(currentDefectType || 'Scratch')}`}
            style={{
              left: `${Math.min(drawStartPos.x, currentDrawPos.x)}px`,
              top: `${Math.min(drawStartPos.y, currentDrawPos.y)}px`,
              width: `${Math.abs(currentDrawPos.x - drawStartPos.x)}px`,
              height: `${Math.abs(currentDrawPos.y - drawStartPos.y)}px`,
              opacity: 0.7,
              pointerEvents: 'none' // 마우스 이벤트 무시
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default ImageCanvas; 