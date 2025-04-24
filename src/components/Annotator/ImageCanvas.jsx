/**
 * 이미지 캔버스 컴포넌트
 * 이미지 표시, 바운딩 박스 생성 및 편집, 확대/축소 등의 어노테이션 핵심 기능을 구현
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ImageCanvas.css';
import { DEFECT_TYPES } from '../../constants/annotationConstants';

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
 * @param {boolean} props.readOnly - 읽기 전용 모드 활성화 여부 (true인 경우 편집 기능 비활성화)
 * @param {Array} props.defectClasses - DB에서 가져온 결함 클래스 목록
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
  currentDefectType = 'Scratch', // 기본값 설정
  readOnly = false,
  defectClasses = []
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

  // 캔버스 크기 측정 및 바운딩 박스 비율 유지를 위한 업데이트
  useEffect(() => {
    if (canvasRef.current) {
      /**
       * 캔버스 크기를 업데이트하는 함수
       * 윈도우 리사이즈 이벤트에 반응하여 캔버스 크기를 조정
       */
      const updateDimensions = () => {
        // 약간의 지연을 두어 DOM이 완전히 업데이트된 후 측정
        setTimeout(() => {
          if (canvasRef.current) {
            const newWidth = canvasRef.current.clientWidth;
            const newHeight = canvasRef.current.clientHeight;
            
            // 캔버스 크기가 초기화되지 않은 경우에만 설정 (처음 한 번만 설정)
            if (canvasDimensions.width === 0 || canvasDimensions.height === 0) {
              setCanvasDimensions({
                width: newWidth,
                height: newHeight
              });
              console.log('Canvas dimensions initialized:', {
                width: newWidth,
                height: newHeight
              });
            }
            // 이미 크기가 설정되어 있다면 유지 (창 크기 변경에 반응하지 않음)
          }
        }, 300);
      };
      
      // 초기 크기 설정
      updateDimensions();
      
      // 사이드바 상태가 변경될 때 차원 업데이트를 위한 MutationObserver 설정
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            updateDimensions();
          }
        });
      });
      
      // 부모 요소의 클래스 변경 감지
      const bodyContainer = document.querySelector('.annotator-body-container');
      if (bodyContainer) {
        observer.observe(bodyContainer, { attributes: true });
      }
      
      return () => {
        observer.disconnect();
      };
    }
  }, [canvasRef, canvasDimensions.width, canvasDimensions.height]);

  // 컴포넌트 마운트 시 초기 박스 위치 설정 (defects가 변경될 때만 수행)
  useEffect(() => {
    // defects가 변경되었을 때 실행됨
    console.log('defects changed:', defects);
    
    // 캔버스 크기가 설정되지 않은 경우 처리하지 않음
    if (canvasDimensions.width === 0 || canvasDimensions.height === 0) {
      console.log('Canvas dimensions not set yet, skipping defect position adjustment');
      return;
    }
    
    // 이미지 영역 경계 계산
    const imgWidth = canvasDimensions.width;
    const imgHeight = canvasDimensions.height;
    
    // defects가 변경되었을 때 항상 boxPositions를 최신 상태로 업데이트
    const updatedPositions = {};
    defects.forEach(defect => {
      const defectId = String(defect.id);
      
      // 원래 좌표와 크기
      let x = defect.coordinates.x;
      let y = defect.coordinates.y;
      let width = defect.coordinates.width;
      let height = defect.coordinates.height;
      
      // 이미지 영역을 벗어난 박스를 내부로 이동
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + width > imgWidth) x = imgWidth - width;
      if (y + height > imgHeight) y = imgHeight - height;
      
      // 박스가 이미지보다 크면 이미지 크기에 맞게 조정
      if (width > imgWidth) {
        x = 0;
        width = imgWidth;
      }
      
      if (height > imgHeight) {
        y = 0;
        height = imgHeight;
      }
      
      // 수정된 좌표 저장
      updatedPositions[defectId] = {
        x: x,
        y: y
      };
      
      // 원본 defect 객체의 좌표도 업데이트 (다른 곳에서 참조할 때 사용)
      defect.coordinates = {
        ...defect.coordinates,
        x: x,
        y: y,
        width: width,
        height: height
      };
    });
    
    // 완전히 새로운 객체로 boxPositions 업데이트
    setBoxPositions(updatedPositions);
  }, [defects, canvasDimensions.width, canvasDimensions.height]); // defects 배열이나 캔버스 크기가 변경될 때 실행

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
   * @returns {Object} 제한된 x, y, width, height 좌표
   */
  const constrainBoxPosition = (x, y, width, height) => {
    // 이미지 영역 경계 내로 제한
    const imgWidth = canvasDimensions.width;
    const imgHeight = canvasDimensions.height;
    
    // 좌표가 음수가 되지 않도록 보장
    const constrainedX = Math.max(0, x);
    const constrainedY = Math.max(0, y);
    
    // 박스가 이미지 영역 내에 모두 포함되도록 너비와 높이 조정
    let constrainedWidth = width;
    let constrainedHeight = height;
    
    // 너비가 이미지 너비를 초과하는 경우
    if (constrainedX + constrainedWidth > imgWidth) {
      constrainedWidth = imgWidth - constrainedX;
    }
    
    // 높이가 이미지 높이를 초과하는 경우
    if (constrainedY + constrainedHeight > imgHeight) {
      constrainedHeight = imgHeight - constrainedY;
    }
    
    return { 
      x: constrainedX, 
      y: constrainedY,
      width: constrainedWidth,
      height: constrainedHeight
    };
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
    // 읽기 전용 모드에서는 패닝만 허용
    if (readOnly) {
      // 항상 패닝 모드로 처리
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      setIsDragging(true);
      setDragStartPosition({
        x: mouseX - position.x,
        y: mouseY - position.y
      });
      
      return;
    }
    
    // 클릭한 요소가 이미지 영역 또는 플레이스홀더 텍스트인 경우에만 처리
    if (e.target === canvasRef.current || e.target.className === 'annotator-placeholder-text' || e.target.classList.contains('annotator-image-placeholder') || e.target.className === 'image-container') {
      if (activeTool === toolTypes.HAND) {
        // 손 도구 - 캔버스 이동
        setIsDragging(true);
        setDragStartPosition({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
      } else if (activeTool === toolTypes.RECTANGLE) {
        // 더블 클릭이나 빈 영역 클릭 시 사각형 도구를 손 도구로 전환
        if (e.detail === 2) {
          // 더블 클릭했을 때
          if (onToolChange) {
            console.log('Double click detected, switching to HAND tool');
            onToolChange(toolTypes.HAND);
            return;
          }
        } else {
          // 사각형 도구 - 바운딩 박스 그리기 시작
          const rect = canvasRef.current.getBoundingClientRect();
          
          // 정확한 이미지 위치에 맞게 좌표 계산
          const mouseX = (e.clientX - rect.left) / scale;
          const mouseY = (e.clientY - rect.top) / scale;
          
          console.log('Rectangle tool: Drawing box from position:', { mouseX, mouseY });
          
          // 드래그 시작점 설정
          setIsDrawingBox(true);
          setDrawStartPos({ x: mouseX, y: mouseY });
          setCurrentDrawPos({ x: mouseX, y: mouseY });
        }
      }
      
      // 빈 영역 클릭 시 선택 해제 (이미지 영역을 직접 클릭한 경우에만)
      if (onCanvasClick && (e.target === canvasRef.current || e.target.className === 'annotator-placeholder-text' || e.target.className === 'image-container')) {
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
    if (readOnly) {
      // 읽기 전용 모드에서는 패닝만 처리
      if (isDragging) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        setPosition({
          x: mouseX - dragStartPosition.x,
          y: mouseY - dragStartPosition.y
        });
      }
      
      return;
    }
    
    // 박스 그리기
    if (isDrawingBox && activeTool === toolTypes.RECTANGLE) {
      const rect = canvasRef.current.getBoundingClientRect();
      
      // 정확한 이미지 위치에 맞게 좌표 계산
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;
      
      // 이미지 영역 크기
      const imgWidth = canvasDimensions.width / scale;
      const imgHeight = canvasDimensions.height / scale;
      
      // 이미지 경계에 도달했을 때 정확히 경계에 맞추도록 제한
      const constrainedX = Math.max(0, Math.min(mouseX, imgWidth));
      const constrainedY = Math.max(0, Math.min(mouseY, imgHeight));
      
      console.log('Drawing box - current position:', { constrainedX, constrainedY });
      
      // 이미지 경계 내로 제한된 위치 적용
      setCurrentDrawPos({ x: constrainedX, y: constrainedY });
    }
    
    // 그 외의 이벤트 핸들러는 그대로 유지
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
      
      // 이미지 경계
      const imgWidth = canvasDimensions.width;
      const imgHeight = canvasDimensions.height;
      
      // 핸들에 따라 크기와 위치 조정
      switch (resizeInfo.handle) {
        case RESIZE_HANDLES.TOP_LEFT:
          newX = resizeInfo.originalX + deltaX;
          newY = resizeInfo.originalY + deltaY;
          newWidth = resizeInfo.originalWidth - deltaX;
          newHeight = resizeInfo.originalHeight - deltaY;
          
          // 경계 체크 - 왼쪽 경계에 도달한 경우
          if (newX < 0) {
            newWidth = resizeInfo.originalWidth + resizeInfo.originalX;
            newX = 0;
          }
          
          // 경계 체크 - 위쪽 경계에 도달한 경우
          if (newY < 0) {
            newHeight = resizeInfo.originalHeight + resizeInfo.originalY;
            newY = 0;
          }
          break;
        case RESIZE_HANDLES.TOP:
          newY = resizeInfo.originalY + deltaY;
          newHeight = resizeInfo.originalHeight - deltaY;
          
          // 경계 체크 - 위쪽 경계에 도달한 경우
          if (newY < 0) {
            newHeight = resizeInfo.originalHeight + resizeInfo.originalY;
            newY = 0;
          }
          break;
        case RESIZE_HANDLES.TOP_RIGHT:
          newY = resizeInfo.originalY + deltaY;
          newWidth = resizeInfo.originalWidth + deltaX;
          newHeight = resizeInfo.originalHeight - deltaY;
          
          // 경계 체크 - 오른쪽 경계에 도달한 경우
          if (newX + newWidth > imgWidth) {
            newWidth = imgWidth - newX;
          }
          
          // 경계 체크 - 위쪽 경계에 도달한 경우
          if (newY < 0) {
            newHeight = resizeInfo.originalHeight + resizeInfo.originalY;
            newY = 0;
          }
          break;
        case RESIZE_HANDLES.RIGHT:
          newWidth = resizeInfo.originalWidth + deltaX;
          
          // 경계 체크 - 오른쪽 경계에 도달한 경우
          if (newX + newWidth > imgWidth) {
            newWidth = imgWidth - newX;
          }
          break;
        case RESIZE_HANDLES.BOTTOM_RIGHT:
          newWidth = resizeInfo.originalWidth + deltaX;
          newHeight = resizeInfo.originalHeight + deltaY;
          
          // 경계 체크 - 오른쪽 경계에 도달한 경우
          if (newX + newWidth > imgWidth) {
            newWidth = imgWidth - newX;
          }
          
          // 경계 체크 - 아래쪽 경계에 도달한 경우
          if (newY + newHeight > imgHeight) {
            newHeight = imgHeight - newY;
          }
          break;
        case RESIZE_HANDLES.BOTTOM:
          newHeight = resizeInfo.originalHeight + deltaY;
          
          // 경계 체크 - 아래쪽 경계에 도달한 경우
          if (newY + newHeight > imgHeight) {
            newHeight = imgHeight - newY;
          }
          break;
        case RESIZE_HANDLES.BOTTOM_LEFT:
          newX = resizeInfo.originalX + deltaX;
          newWidth = resizeInfo.originalWidth - deltaX;
          newHeight = resizeInfo.originalHeight + deltaY;
          
          // 경계 체크 - 왼쪽 경계에 도달한 경우
          if (newX < 0) {
            newWidth = resizeInfo.originalWidth + resizeInfo.originalX;
            newX = 0;
          }
          
          // 경계 체크 - 아래쪽 경계에 도달한 경우
          if (newY + newHeight > imgHeight) {
            newHeight = imgHeight - newY;
          }
          break;
        case RESIZE_HANDLES.LEFT:
          newX = resizeInfo.originalX + deltaX;
          newWidth = resizeInfo.originalWidth - deltaX;
          
          // 경계 체크 - 왼쪽 경계에 도달한 경우
          if (newX < 0) {
            newWidth = resizeInfo.originalWidth + resizeInfo.originalX;
            newX = 0;
          }
          break;
        default:
          break;
      }
      
      // 최소 크기 제한
      const minSize = 20;
      if (newWidth < minSize) {
        if ([RESIZE_HANDLES.TOP_LEFT, RESIZE_HANDLES.BOTTOM_LEFT, RESIZE_HANDLES.LEFT].includes(resizeInfo.handle)) {
          // 왼쪽에서 리사이징 중일 때
          newX = resizeInfo.originalX + resizeInfo.originalWidth - minSize;
        }
        newWidth = minSize;
      }
      
      if (newHeight < minSize) {
        if ([RESIZE_HANDLES.TOP_LEFT, RESIZE_HANDLES.TOP_RIGHT, RESIZE_HANDLES.TOP].includes(resizeInfo.handle)) {
          // 위쪽에서 리사이징 중일 때
          newY = resizeInfo.originalY + resizeInfo.originalHeight - minSize;
        }
        newHeight = minSize;
      }
      
      // constrainBoxPosition 함수를 사용하여 박스가 이미지 영역 내에 유지되도록 함
      const { x: constrainedX, y: constrainedY, width: constrainedWidth, height: constrainedHeight } = 
        constrainBoxPosition(newX, newY, newWidth, newHeight);
      
      // 위치 업데이트
      setBoxPositions(prev => ({
        ...prev,
        [resizeInfo.id]: {
          x: constrainedX,
          y: constrainedY
        }
      }));
      
      // 현재 리사이즈 정보를 저장 (마우스 업 이벤트에서 사용)
      resizeInfo.currentX = constrainedX;
      resizeInfo.currentY = constrainedY;
      resizeInfo.currentWidth = constrainedWidth;
      resizeInfo.currentHeight = constrainedHeight;
    }
  };

  /**
   * 마우스 업 이벤트 핸들러
   * 드래그, 리사이즈, 그리기 등의 작업 완료 처리
   * 
   * @param {MouseEvent} e - 마우스 이벤트 객체
   */
  const handleMouseUp = (e) => {
    if (readOnly) {
      // 읽기 전용 모드에서는 드래그 상태만 해제
      setIsDragging(false);
      return;
    }
    
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
      console.log('Finishing box drawing with type:', currentDefectType);
      
      // 시작점과 종료점으로부터 사각형 좌표와 크기 계산
      let x = Math.min(drawStartPos.x, currentDrawPos.x);
      let y = Math.min(drawStartPos.y, currentDrawPos.y);
      let width = Math.abs(currentDrawPos.x - drawStartPos.x);
      let height = Math.abs(currentDrawPos.y - drawStartPos.y);
      
      console.log('Final box coordinates:', { x, y, width, height });
      
      // 최소 크기 확인 (최소 5x5 픽셀)
      if (width > 5 && height > 5) {
        // 새 바운딩 박스 추가
        if (onAddBox) {
          // 최종 좌표로 박스 추가
          const adjustedCoordinates = {
            x: x,
            y: y,
            width: width,
            height: height
          };
          
          console.log('Adding new box with coordinates:', adjustedCoordinates, 'and type:', currentDefectType);
          
          // 현재 선택된 결함 유형을 함께 전달
          onAddBox(adjustedCoordinates, currentDefectType);
          
          // 바운딩 박스를 추가한 후 손바닥 도구로 자동 전환
          if (onToolChange) {
            console.log('Switching to HAND tool after adding box');
            setTimeout(() => onToolChange(toolTypes.HAND), 0);
          }
        } else {
          console.log('onAddBox function is not available');
        }
      } else {
        console.log('Box too small, not adding', { width, height });
        // 작은 박스를 그릴 경우에도 손바닥 도구로 전환
        if (onToolChange && activeTool === toolTypes.RECTANGLE) {
          console.log('Box too small, switching to HAND tool');
          setTimeout(() => onToolChange(toolTypes.HAND), 0);
        }
      }
    }
    
    // 그리기 상태 초기화는 onAddBox 호출 후에 진행
    setIsDrawingBox(false);
  };

  /**
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
    // 읽기 전용 모드에서는 선택만 가능
    if (readOnly) {
      e.stopPropagation();
      onDefectSelect(defectId);
      return;
    }
    
    // 사각형 도구가 활성화되어 있을 때는 손 도구로 전환하고 박스 선택
    if (activeTool === toolTypes.RECTANGLE) {
      console.log('Box clicked while Rectangle tool is active, switching to HAND tool');
      if (onToolChange) {
        onToolChange(toolTypes.HAND);
      }
      onDefectSelect(defectId);
      return;
    }
    
    // 손 도구 활성화 상태에서 박스 선택
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
    // 읽기 전용 모드에서는 리사이즈 불가
    if (readOnly) {
      e.stopPropagation();
      return;
    }
    
    // 사각형 도구가 활성화되어 있을 때는 손 도구로 전환하고 리사이즈 시작
    if (activeTool === toolTypes.RECTANGLE) {
      console.log('Resize handle clicked while Rectangle tool is active, switching to HAND tool');
      if (onToolChange) {
        onToolChange(toolTypes.HAND);
      }
      // 도구 전환 후 선택 및 리사이즈 시작을 위해 핸들러 다시 호출
      onDefectSelect(defectId);
      setTimeout(() => handleResizeStart(e, defectId, handle), 0);
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

  // 활성 도구가 변경될 때 실행되는 effect
  useEffect(() => {
    // 사각형 도구로 변경되면 선택된 결함 해제
    if (activeTool === toolTypes.RECTANGLE && selectedDefect) {
      // 부모 컴포넌트의 선택 해제 함수 호출
      // 새 박스를 그리기 위해서는 선택된 결함이 없어야 함
      if (onDefectSelect) {
        console.log('Rectangle tool activated, clearing selected defect');
        onDefectSelect(null);
      }
    }
  }, [activeTool, selectedDefect, onDefectSelect, toolTypes.RECTANGLE]);

  // 클래스 유형 변경 감지 및 디버그 로깅
  useEffect(() => {
    console.log('ImageCanvas - Current defect type changed:', currentDefectType);
  }, [currentDefectType]);

  /**
   * 결함 유형에 따른 CSS 클래스 이름 반환
   * 각 결함 유형별 다른 색상 스타일 적용
   * 
   * @param {string} defectType - 결함 유형
   * @returns {string} CSS 클래스 이름
   */
  const getBoxClassName = (defectType) => {
    // DB에서 가져온 클래스 목록에서 현재 결함 유형 찾기
    const defectClass = defectClasses.find(dc => dc.class_name === defectType);
    if (defectClass) {
      // class_id 기반으로 CSS 클래스 반환
      return `annotator-defect-${defectClass.class_id}`;
    }
    
    // 기본값으로 fallback (DB에서 찾지 못한 경우)
    switch(defectType) {
      case 'Scratch':
        return 'annotator-defect-1';
      case 'Dent':
        return 'annotator-defect-2';
      case 'Discoloration':
        return 'annotator-defect-3';
      case 'Contamination':
        return 'annotator-defect-4';
      default:
        return 'annotator-defect-1'; // 기본값은 Scratch
    }
  };

  /**
   * 결함 유형에 따른 색상 코드 반환
   * @param {string} defectType - 결함 유형
   * @param {Object} defect - 결함 객체 (color 속성이 있을 수 있음)
   * @returns {string} 색상 코드 (HEX)
   */
  const getDefectColor = (defectType, defectObj) => {
    if (defectObj && defectObj.color) {
      return defectObj.color;
    }

    // Check if we have defect classes from DB
    if (defectClasses && defectClasses.length > 0) {
      const defectClass = defectClasses.find(cls => cls.class_name === defectType);
      if (defectClass && defectClass.class_color) {
        return defectClass.class_color;
      }
    }

    // Fallback to old defect names
    switch (defectType?.toLowerCase()) {
      case 'scratch':
        return '#00B69B'; // Green
      case 'dent':
        return '#5A8CFF'; // Blue
      case 'discoloration':
        return '#EF3826'; // Orange
      case 'contamination':
        return '#FCAA0B'; // Red
      default:
        return '#808080'; // Gray for unknown
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

  // 현재 그리기 중인 바운딩 박스 계산 (가상 DOM 요소)
  const drawingBox = isDrawingBox ? (() => {
    // 원래 마우스 위치를 그대로 사용 (정확한 마우스 드래그 반영)
    const x = Math.min(drawStartPos.x, currentDrawPos.x);
    const y = Math.min(drawStartPos.y, currentDrawPos.y);
    const width = Math.abs(currentDrawPos.x - drawStartPos.x);
    const height = Math.abs(currentDrawPos.y - drawStartPos.y);
    
    // 제약 조건 없이 원본 좌표 반환
    return { x, y, width, height };
  })() : null;

  // 바운딩 박스 그리기에 사용할 색상 및 클래스 계산
  const getDrawingStyle = () => {
    return {
      boxColor: getDefectColor(currentDefectType),
      boxClass: getBoxClassName(currentDefectType)
    };
  };

  /**
   * 바운딩 박스 클릭 이벤트 핸들러
   * @param {string|number} defectId - 선택된 결함 ID
   */
  const handleBoxClick = (defectId) => {
    if (onDefectSelect) {
      onDefectSelect(defectId);
    }
  };

  return (
    <div 
      className={`image-canvas ${activeTool === toolTypes.RECTANGLE ? 'drawing-mode' : ''} ${readOnly ? 'read-only' : ''}`}
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
        className="image-container"
        ref={canvasRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          cursor: getCanvasCursor(),
          width: canvasDimensions.width > 0 ? `${canvasDimensions.width}px` : '90%', 
          height: canvasDimensions.height > 0 ? `${canvasDimensions.height}px` : '90%'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 실제 프로젝트에서는 여기에 이미지를 로드하게 됨 */}
        <div className="annotator-placeholder-text">이미지 영역</div>
        
        {/* 결함 바운딩 박스 렌더링 */}
        {sortedDefects.map((defect) => {
          const defectId = String(defect.id);
          // 현재 드래그/리사이즈 중인 박스는 boxPositions에서, 아니면 원래 좌표 사용
          const boxPosition = boxPositions[defectId] || defect.coordinates;
          const isSelected = selectedDefect === defect.id;
          const boxColor = getDefectColor(defect.type, defect);
          
          return (
            <div 
              key={defectId}
              className={`bounding-box ${isSelected ? 'selected' : ''} ${getBoxClassName(defect.type)} ${readOnly ? 'read-only' : ''}`}
              style={{
                left: `${boxPosition.x}px`,
                top: `${boxPosition.y}px`,
                width: `${defect.coordinates.width}px`,
                height: `${defect.coordinates.height}px`,
                zIndex: isSelected ? 100 : 10, // 선택된 박스는 더 높은 z-index를 가짐
                borderColor: boxColor
              }}
              onMouseDown={(e) => {
                // 박스 내부 클릭 시에만 이동 처리
                if (e.target === e.currentTarget) {
                  handleBoxMouseDown(e, defect.id);
                }
              }}
            >
              {/* 결함 ID와 신뢰도 표시 */}
              <div 
                className="annotator-box-label"
                style={{ backgroundColor: boxColor }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleBoxMouseDown(e, defect.id);
                }}
              >
                ({defect.id}) {defect.confidence === null || defect.confidence === undefined || defect.confidence === 0.9 ? '-' : defect.confidence.toFixed(2)}
              </div>
              
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
              
              {/* 리사이즈 핸들 - 선택된 바운딩 박스에만 표시 */}
              {isSelected && !readOnly && (
                <>
                  <div 
                    className={`resize-handle top-left ${getBoxClassName(defect.type)}`}
                    style={{ borderColor: boxColor }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, defect.id, RESIZE_HANDLES.TOP_LEFT);
                    }}
                  ></div>
                  <div 
                    className={`resize-handle top ${getBoxClassName(defect.type)}`}
                    style={{ borderColor: boxColor }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, defect.id, RESIZE_HANDLES.TOP);
                    }}
                  ></div>
                  <div 
                    className={`resize-handle top-right ${getBoxClassName(defect.type)}`}
                    style={{ borderColor: boxColor }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, defect.id, RESIZE_HANDLES.TOP_RIGHT);
                    }}
                  ></div>
                  <div 
                    className={`resize-handle right ${getBoxClassName(defect.type)}`}
                    style={{ borderColor: boxColor }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, defect.id, RESIZE_HANDLES.RIGHT);
                    }}
                  ></div>
                  <div 
                    className={`resize-handle bottom-right ${getBoxClassName(defect.type)}`}
                    style={{ borderColor: boxColor }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, defect.id, RESIZE_HANDLES.BOTTOM_RIGHT);
                    }}
                  ></div>
                  <div 
                    className={`resize-handle bottom ${getBoxClassName(defect.type)}`}
                    style={{ borderColor: boxColor }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, defect.id, RESIZE_HANDLES.BOTTOM);
                    }}
                  ></div>
                  <div 
                    className={`resize-handle bottom-left ${getBoxClassName(defect.type)}`}
                    style={{ borderColor: boxColor }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, defect.id, RESIZE_HANDLES.BOTTOM_LEFT);
                    }}
                  ></div>
                  <div 
                    className={`resize-handle left ${getBoxClassName(defect.type)}`}
                    style={{ borderColor: boxColor }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, defect.id, RESIZE_HANDLES.LEFT);
                    }}
                  ></div>
                </>
              )}
            </div>
          );
        })}
        
        {/* 그리기 중인 바운딩 박스 */}
        {isDrawingBox && drawingBox && (
          <div 
            className={`bounding-box drawing`}
            style={{
              left: `${drawingBox.x}px`,
              top: `${drawingBox.y}px`,
              width: `${drawingBox.width}px`,
              height: `${drawingBox.height}px`,
              borderColor: getDefectColor(currentDefectType),
              borderWidth: '2px',
              borderStyle: 'dashed',
              zIndex: 1000
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default ImageCanvas; 