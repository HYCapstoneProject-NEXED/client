/**
 * 어노테이션 히스토리 관리 훅 (실행 취소/다시 실행)
 */
import { useState, useCallback } from 'react';
import { ACTION_TYPES } from '../constants/annotationConstants';

/**
 * 어노테이션 작업 히스토리 관리 훅
 * @returns {Object} 히스토리 관련 상태 및 함수들
 */
const useAnnotationHistory = (setDefects, setSelectedDefect) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  /**
   * 작업 기록 추가
   * @param {Object} action - 추가할 작업 정보
   */
  const addToHistory = useCallback((action) => {
    // 실행 취소/다시 실행 중인 경우에는 히스토리 추가하지 않음
    if (isUndoRedoAction) {
      setIsUndoRedoAction(false);
      return;
    }

    // 현재 인덱스 이후의 히스토리 자르기
    const newHistory = history.slice(0, historyIndex + 1);
    
    // 새 작업 추가
    newHistory.push(action);
    
    // 디버깅
    console.log('Adding to history:', action, 'New index:', newHistory.length - 1);
    
    // 히스토리 업데이트
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, isUndoRedoAction]);

  /**
   * 실행 취소 함수 (Undo)
   */
  const handleUndo = useCallback(() => {
    if (historyIndex < 0) {
      console.log('No more history to undo');
      return;
    }
    
    setIsUndoRedoAction(true);
    
    const action = history[historyIndex];
    console.log('Undoing action:', action, 'current index:', historyIndex);
    
    switch(action.type) {
      case ACTION_TYPES.ADD_BOX:
        // 추가한 박스 제거
        setDefects(prev => prev.filter(d => d.id !== action.data.defect.id));
        
        // 해당 박스가 선택되어 있었다면 선택 해제
        setSelectedDefect(prev => 
          prev === action.data.defect.id ? null : prev
        );
        break;
      
      case ACTION_TYPES.MOVE_BOX:
      case ACTION_TYPES.RESIZE_BOX:
        // 좌표 변경 취소 - 이전 좌표로 되돌림
        setDefects(prev => 
          prev.map(d => 
            d.id === action.data.defectId
              ? {
                  ...d, 
                  coordinates: { ...action.data.prevCoordinates }
                }
              : d
          )
        );
        break;
      
      case ACTION_TYPES.CHANGE_CLASS:
        // 클래스 변경 취소
        setDefects(prev => 
          prev.map(d => 
            d.id === action.data.defectId
              ? { ...d, type: action.data.prevType }
              : d
          )
        );
        break;
      
      case ACTION_TYPES.DELETE_BOX:
        // 삭제 취소 - 삭제한 박스 복원
        setDefects(prev => [...prev, action.data.defect]);
        break;
      
      default:
        break;
    }
    
    // 히스토리 인덱스 감소
    setHistoryIndex(prevIndex => prevIndex - 1);
  }, [history, historyIndex, setDefects, setSelectedDefect]);

  /**
   * 다시 실행 함수 (Redo)
   */
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) {
      console.log('No more actions to redo');
      return;
    }
    
    setIsUndoRedoAction(true);
    
    const action = history[historyIndex + 1];
    console.log('Redoing action:', action, 'current index:', historyIndex);
    
    switch(action.type) {
      case ACTION_TYPES.ADD_BOX:
        // 박스 다시 추가
        setDefects(prev => [...prev, action.data.defect]);
        setSelectedDefect(action.data.defect.id);
        break;
      
      case ACTION_TYPES.MOVE_BOX:
      case ACTION_TYPES.RESIZE_BOX:
        // 좌표 변경 재적용 - 모든 좌표 정보(x, y, width, height)를 완전히 적용
        setDefects(prev => 
          prev.map(d => 
            d.id === action.data.defectId
              ? {
                  ...d, 
                  coordinates: { ...action.data.newCoordinates }
                }
              : d
          )
        );
        break;
      
      case ACTION_TYPES.CHANGE_CLASS:
        // 클래스 변경 재적용
        setDefects(prev => 
          prev.map(d => 
            d.id === action.data.defectId
              ? { ...d, type: action.data.newType }
              : d
          )
        );
        break;
      
      case ACTION_TYPES.DELETE_BOX:
        // 박스 다시 제거
        setDefects(prev => prev.filter(d => d.id !== action.data.defect.id));
        
        // 해당 박스가 선택되어 있었다면 선택 해제
        setSelectedDefect(prev => 
          prev === action.data.defect.id ? null : prev
        );
        break;
      
      default:
        break;
    }
    
    // 히스토리 인덱스 증가
    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [history, historyIndex, setDefects, setSelectedDefect]);

  /**
   * Undo 가능 여부
   */
  const canUndo = historyIndex >= 0;
  
  /**
   * Redo 가능 여부
   */
  const canRedo = historyIndex < history.length - 1;

  return {
    history,
    historyIndex,
    isUndoRedoAction,
    addToHistory,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo
  };
};

export default useAnnotationHistory; 