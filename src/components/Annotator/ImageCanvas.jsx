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
 * @param {string} props.imageSrc - 이미지 소스 URL
 * @param {Object} props.imageDimensions - 이미지 크기 정보 (width, height)
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
  defectClasses = [],
  imageSrc = null,
  imageDimensions = { width: 640, height: 640 } // 기본값 설정
}) => {
  // 이미지 캔버스 요소 참조
  const canvasRef = useRef(null);
  
  // 캔버스 이동(pan) 관련 상태
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ 
    x: 0, 
    y: 0, 
    startPositionX: 0, 
    startPositionY: 0 
  });
  
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
      // 캔버스 크기를 업데이트하는 함수
      const updateDimensions = () => {
        // 캔버스 크기를 이미지 크기로 설정
        setCanvasDimensions({
          width: imageDimensions.width,
          height: imageDimensions.height
        });
      };
      
      // 초기 크기 설정 (한 번만 실행)
      updateDimensions();
    }
  }, [imageDimensions.width, imageDimensions.height]); // 최소한의 의존성만 포함

  // 박스 위치 업데이트 - defects가 변경될 때만
  useEffect(() => {
    // 캔버스 크기가 유효하지 않으면 실행하지 않음
    if (canvasDimensions.width === 0 || canvasDimensions.height === 0) {
      return;
    }
    
    // 이미지 영역 경계 계산
    const imgWidth = canvasDimensions.width;
    const imgHeight = canvasDimensions.height;
    
    // 완전히 새로운 객체로 boxPositions 생성
    const newBoxPositions = {};
    
    // 각 defect에 대해 위치 계산
    defects.forEach(defect => {
      const defectId = String(defect.id);
      const coordinates = {...defect.coordinates};
      
      // 좌표 처리 및 이미지 경계 내로 제한
      let x = coordinates.x;
      let y = coordinates.y;
      let width = coordinates.width;
      let height = coordinates.height;
      
      // 이미지 경계 내로 조정
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + width > imgWidth) x = imgWidth - width;
      if (y + height > imgHeight) y = imgHeight - height;
      
      // 이미지보다 큰 경우 조정
      if (width > imgWidth) {
        width = imgWidth;
        x = 0;
      }
      
      if (height > imgHeight) {
        height = imgHeight;
        y = 0;
      }
      
      // 계산된 좌표 저장
      newBoxPositions[defectId] = {
        x, y, width, height
      };
    });
    
    // 한 번에 상태 업데이트
    setBoxPositions(newBoxPositions);
  }, [defects, canvasDimensions.width, canvasDimensions.height]);

  // 모든 이벤트 리스너를 한 번만 등록 (의존성 배열 비움)
  useEffect(() => {
    // 이벤트 핸들러 참조 저장
    const moveHandler = handleMouseMove;
    const upHandler = handleMouseUp;
    const wheelHandler = handleWheel;
    
    console.log('이벤트 리스너 등록');
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
    
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('wheel', wheelHandler, { passive: false });
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('이벤트 리스너 제거');
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
      
      if (canvasElement) {
        canvasElement.removeEventListener('wheel', wheelHandler);
      }
    };
  }, []); // 빈 의존성 배열 - 컴포넌트 마운트/언마운트 시에만 실행

  // 박스 위치를 이미지 영역 내로 제한하는 함수
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
  const handleMouseDown = useCallback((e) => {
    // 이벤트 버블링 중지
    e.stopPropagation();
    
    // 읽기 전용 모드에서는 패닝만 허용
    if (readOnly) {
      setIsDragging(true);
      setDragStartPosition({
        x: e.clientX,
        y: e.clientY,
        startPositionX: position.x,
        startPositionY: position.y
      });
      return;
    }
    
    // 클릭한 요소가 이미지 영역 또는 플레이스홀더 텍스트인 경우에만 처리
    if (e.target === canvasRef.current || e.target.className === 'annotator-placeholder-text' || e.target.classList.contains('annotator-image-placeholder') || e.target.className === 'image-container') {
      console.log('Mouse down on canvas, activeTool:', activeTool);
      
      if (activeTool === toolTypes.HAND) {
        // 손 도구 - 캔버스 드래그 시작
        setIsDragging(true);
        setDragStartPosition({
          x: e.clientX,
          y: e.clientY,
          startPositionX: position.x,
          startPositionY: position.y
        });
        
        // 빈 영역 클릭 시 선택 해제
        if (onCanvasClick) {
          onCanvasClick(e);
        }
      } else if (activeTool === toolTypes.RECTANGLE) {
        // 사각형 도구 - 이미지 드래그 방지
        e.preventDefault();
        
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
          
          console.log('Rectangle tool: Starting to draw box from position:', { mouseX, mouseY });
          
          // 드래그 시작점 설정
          setIsDrawingBox(true);
          setDrawStartPos({ x: mouseX, y: mouseY });
          setCurrentDrawPos({ x: mouseX, y: mouseY });
          
          // 사각형 그리기 모드에서는 이미지 드래그 비활성화
          setIsDragging(false);
        }
      }
    }
  }, [
    readOnly, 
    activeTool, 
    position, 
    canvasRef, 
    scale,
    onCanvasClick, 
    onToolChange, 
    toolTypes.HAND, 
    toolTypes.RECTANGLE
  ]);

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
  const handleMouseMove = useCallback((e) => {
    // 드래그 중인 경우 이미지 이동
    if (isDragging) {
      // 드래그 시작 위치로부터의 이동 거리 계산
      const deltaX = e.clientX - dragStartPosition.x;
      const deltaY = e.clientY - dragStartPosition.y;
      
      // 새 위치 계산 및 적용
      const newPositionX = dragStartPosition.startPositionX + deltaX;
      const newPositionY = dragStartPosition.startPositionY + deltaY;
      
      setPosition({
        x: newPositionX,
        y: newPositionY
      });
      
      return;
    }
    
    // 박스 드래그 중인 경우
    if (isBoxDragging && boxDragInfo.id) {
      // 마우스 이동 거리 계산
      const deltaX = e.clientX - boxDragInfo.startX;
      const deltaY = e.clientY - boxDragInfo.startY;
      
      // 스케일 적용하여 실제 이동 거리 계산
      const scaledDeltaX = deltaX / scale;
      const scaledDeltaY = deltaY / scale;
      
      // 새 박스 위치 계산
      const newX = boxDragInfo.originalX + scaledDeltaX;
      const newY = boxDragInfo.originalY + scaledDeltaY;
      
      // 박스 위치 제한 (이미지 경계 내로)
      const boxId = boxDragInfo.id;
      const boxPosition = boxPositions[boxId];
      const defect = defects.find(d => String(d.id) === boxId);
      
      if (!boxPosition || !defect) return;
      
      // 박스 너비와 높이 정보 가져오기
      const width = boxPosition.width !== undefined ? boxPosition.width : defect.coordinates.width;
      const height = boxPosition.height !== undefined ? boxPosition.height : defect.coordinates.height;
      
      // 이미지 영역 내로 제한된 좌표 계산
      const constrained = constrainBoxPosition(newX, newY, width, height);
      
      // 업데이트된 정보 저장
      setBoxDragInfo({
        ...boxDragInfo,
        currentX: constrained.x,
        currentY: constrained.y
      });
      
      // 박스 위치 업데이트
      setBoxPositions(prev => ({
        ...prev,
        [boxId]: {
          ...prev[boxId],
          x: constrained.x,
          y: constrained.y,
          width: constrained.width,
          height: constrained.height
        }
      }));
      
      return;
    }
    
    // 박스 리사이즈 중인 경우
    if (isResizing && resizeInfo.id) {
      // 마우스 이동 거리 계산
      const deltaX = e.clientX - resizeInfo.startX;
      const deltaY = e.clientY - resizeInfo.startY;
      
      // 스케일 적용하여 실제 이동 거리 계산
      const scaledDeltaX = deltaX / scale;
      const scaledDeltaY = deltaY / scale;
      
      // 핸들 위치에 따라 다른 계산 적용
      let newX = resizeInfo.originalX;
      let newY = resizeInfo.originalY;
      let newWidth = resizeInfo.originalWidth;
      let newHeight = resizeInfo.originalHeight;
      
      // 핸들 유형에 따라 좌표 업데이트
      switch (resizeInfo.handle) {
        case RESIZE_HANDLES.TOP_LEFT:
          newX = resizeInfo.originalX + scaledDeltaX;
          newY = resizeInfo.originalY + scaledDeltaY;
          newWidth = resizeInfo.originalWidth - scaledDeltaX;
          newHeight = resizeInfo.originalHeight - scaledDeltaY;
          break;
        case RESIZE_HANDLES.TOP:
          newY = resizeInfo.originalY + scaledDeltaY;
          newHeight = resizeInfo.originalHeight - scaledDeltaY;
          break;
        case RESIZE_HANDLES.TOP_RIGHT:
          newY = resizeInfo.originalY + scaledDeltaY;
          newWidth = resizeInfo.originalWidth + scaledDeltaX;
          newHeight = resizeInfo.originalHeight - scaledDeltaY;
          break;
        case RESIZE_HANDLES.RIGHT:
          newWidth = resizeInfo.originalWidth + scaledDeltaX;
          break;
        case RESIZE_HANDLES.BOTTOM_RIGHT:
          newWidth = resizeInfo.originalWidth + scaledDeltaX;
          newHeight = resizeInfo.originalHeight + scaledDeltaY;
          break;
        case RESIZE_HANDLES.BOTTOM:
          newHeight = resizeInfo.originalHeight + scaledDeltaY;
          break;
        case RESIZE_HANDLES.BOTTOM_LEFT:
          newX = resizeInfo.originalX + scaledDeltaX;
          newWidth = resizeInfo.originalWidth - scaledDeltaX;
          newHeight = resizeInfo.originalHeight + scaledDeltaY;
          break;
        case RESIZE_HANDLES.LEFT:
          newX = resizeInfo.originalX + scaledDeltaX;
          newWidth = resizeInfo.originalWidth - scaledDeltaX;
          break;
        default:
          break;
      }
      
      // 최소 크기 제한
      const MIN_SIZE = 10;
      let isValid = true;
      
      if (newWidth < MIN_SIZE) {
        newWidth = MIN_SIZE;
        isValid = false;
      }
      
      if (newHeight < MIN_SIZE) {
        newHeight = MIN_SIZE;
        isValid = false;
      }
      
      // 이미지 경계 내로 좌표 제한
      const constrained = constrainBoxPosition(newX, newY, newWidth, newHeight);
      
      // 리사이즈 정보 업데이트
      setResizeInfo({
        ...resizeInfo,
        currentX: constrained.x,
        currentY: constrained.y,
        currentWidth: constrained.width,
        currentHeight: constrained.height,
        isValid
      });
        
      // 박스 위치 업데이트
        setBoxPositions(prev => ({
          ...prev,
        [resizeInfo.id]: {
          ...prev[resizeInfo.id],
          x: constrained.x,
          y: constrained.y,
          width: constrained.width,
          height: constrained.height
          }
        }));
        
      return;
    }
    
    // 박스 그리기 중인 경우
    if (isDrawingBox && activeTool === toolTypes.RECTANGLE) {
      const rect = canvasRef.current.getBoundingClientRect();
      
      // 현재 마우스 위치 계산 (스케일 적용)
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;
      
      setCurrentDrawPos({ x: mouseX, y: mouseY });
    }
  }, [
    isDragging, 
    dragStartPosition, 
    isBoxDragging, 
    boxDragInfo, 
    isResizing, 
    resizeInfo,
    isDrawingBox, 
    activeTool,
    scale,
    canvasRef,
    Object.keys(boxPositions).length, // boxPositions -> Object.keys(boxPositions).length로 변경
    defects.length, // defects -> defects.length로 변경
    constrainBoxPosition,
    toolTypes.RECTANGLE
  ]);

  /**
   * 마우스 업 이벤트 핸들러
   * 드래그, 리사이징, 그리기 등의 작업 완료 처리
   * 
   * @param {MouseEvent} e - 마우스 이벤트 객체
   */
  const handleMouseUp = useCallback((e) => {
    // 캔버스 드래그 종료
    if (isDragging) {
      setIsDragging(false);
    }
    
    if (readOnly) {
      return;
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
    if (isDrawingBox && activeTool === toolTypes.RECTANGLE) {
      console.log('Finishing box drawing. Tool:', activeTool, 'Type:', currentDefectType);
      
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
      
      // 그리기 상태 초기화
      setIsDrawingBox(false);
    }
  }, [
    isDragging, 
    isBoxDragging, 
    boxDragInfo,
    isResizing, 
    resizeInfo,
    isDrawingBox, 
    activeTool,
    readOnly,
    drawStartPos,
    currentDrawPos,
    currentDefectType,
    onCoordinateChange,
    onAddBox,
    onToolChange,
    toolTypes.RECTANGLE,
    toolTypes.HAND
  ]);

  /**
   * 이미지 확대/축소(줌) 처리
   * 
   * @param {WheelEvent} e - 휠 이벤트 객체
   */
  const handleWheel = useCallback((e) => {
    // 브라우저의 기본 스크롤 동작 방지는 이벤트 리스너 옵션에서 passive: false로 설정
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 3);
    setScale(newScale);
  }, [scale]);

  /**
   * 바운딩 박스 마우스 다운 이벤트 핸들러
   * 박스 선택 및 드래그 시작 처리
   * 
   * @param {MouseEvent} e - 마우스 이벤트 객체
   * @param {string} defectId - 선택한 결함 ID
   */
  const handleBoxMouseDown = useCallback((e, defectId) => {
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
  }, [readOnly, activeTool, toolTypes.RECTANGLE, toolTypes.HAND, boxPositions, onDefectSelect, onToolChange]);

  /**
   * 리사이즈 핸들 마우스 다운 이벤트 핸들러
   * 바운딩 박스 크기 조정 시작 처리
   * 
   * @param {MouseEvent} e - 마우스 이벤트 객체
   * @param {string} defectId - 선택한 결함 ID
   * @param {string} handle - 선택한 핸들 종류 (top, left, bottom-right 등)
   */
  const handleResizeStart = useCallback((e, defectId, handle) => {
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
  }, [activeTool, boxPositions, defects, onDefectSelect, onToolChange, readOnly, toolTypes.HAND, toolTypes.RECTANGLE]);

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
    if (isDragging && activeTool === toolTypes.HAND) return 'grabbing';
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

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 드래그 관련 상태 초기화
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    setDragStartPosition({ 
      x: 0, 
      y: 0, 
      startPositionX: 0, 
      startPositionY: 0 
    });
    
    // 확대/축소 초기화
    setScale(1);
    
    // 이벤트 리스너 등록 로직은 그대로 유지
    // ...
  }, []);

  return (
    <div 
      className={`image-canvas ${activeTool === toolTypes.RECTANGLE ? 'drawing-mode' : ''} ${readOnly ? 'read-only' : ''}`}
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
          transition: 'none' // 부드러운 드래그를 위해 transition 효과 제거
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 실제 프로젝트에서는 여기에 이미지를 로드하게 됨 */}
        {imageSrc && <img src={imageSrc} alt="Annotated Image" draggable="false" />}
        
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