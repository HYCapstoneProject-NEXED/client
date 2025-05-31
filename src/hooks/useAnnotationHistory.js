/**
 * 어노테이션 히스토리 관리 훅 (실행 취소/다시 실행)
 * 명령 패턴(Command Pattern)을 사용하여 구현
 */
import { useState, useCallback, useEffect } from 'react';
import { ACTION_TYPES } from '../constants/annotationConstants';

/**
 * 어노테이션 작업 히스토리 관리 훅
 * @param {Function} setDefects - 결함 목록 상태 설정 함수
 * @param {Function} setSelectedDefect - 선택된 결함 상태 설정 함수
 * @returns {Object} 히스토리 관련 상태 및 함수들
 */
const useAnnotationHistory = (setDefects, setSelectedDefect) => {
  // 작업 명령 스택
  const [undoStack, setUndoStack] = useState([]); // 실행된 명령 스택 (undo 가능)
  const [redoStack, setRedoStack] = useState([]); // 취소된 명령 스택 (redo 가능)
  
  // 작업 처리 중 플래그
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 실행 취소(Undo) 가능 여부
   */
  const canUndo = undoStack.length > 0;
  
  /**
   * 다시 실행(Redo) 가능 여부
   */
  const canRedo = redoStack.length > 0;

  /**
   * 로깅을 위한 상태 모니터링
   */
  useEffect(() => {
    console.log('History state:', {
      undoStackSize: undoStack.length,
      redoStackSize: redoStack.length,
      canUndo,
      canRedo
    });
  }, [undoStack, redoStack, canUndo, canRedo]);

  /**
   * 작업 명령을 생성하는 factory 함수
   * 각 작업 유형별로 do(실행)/undo(취소) 메서드를 가진 명령 객체 생성
   * 
   * @param {string} type - 작업 유형
   * @param {Object} data - 작업 데이터
   * @returns {Object} 명령 객체
   */
  const createCommand = useCallback((type, data) => {
    // 재사용 가능한 도우미 함수들
    const findDefect = (defects, id) => defects.find(d => String(d.id) === String(id));
    const removeDefect = (defects, id) => defects.filter(d => String(d.id) !== String(id));
    const updateDefect = (defects, id, updater) => {
      return defects.map(defect => 
        String(defect.id) === String(id) ? updater(defect) : defect
      );
    };
    
    // 작업 유형별 명령 객체 생성
    switch (type) {
      case ACTION_TYPES.ADD_BOX:
        return {
          type,
          data,
          // 바운딩 박스 추가 실행
          do: (defects) => {
            console.log(`DO: ADD_BOX - ID: ${data.defect.id}`);
            // 이미 존재하는지 확인
            const exists = defects.some(d => String(d.id) === String(data.defect.id));
            if (exists) {
              console.log(`Box with ID ${data.defect.id} already exists, not adding`);
              return defects;
            }
            return [...defects, data.defect];
          },
          // 바운딩 박스 추가 취소 (삭제)
          undo: (defects) => {
            console.log(`UNDO: ADD_BOX - ID: ${data.defect.id}`);
            return removeDefect(defects, data.defect.id);
          },
          // 선택 상태 처리
          updateSelection: {
            do: () => data.defect.id,
            undo: (current) => current === data.defect.id ? null : current
          }
        };
        
      case ACTION_TYPES.DELETE_BOX:
        return {
          type,
          data,
          // 바운딩 박스 삭제 실행
          do: (defects) => {
            console.log(`DO: DELETE_BOX - ID: ${data.defect.id}`);
            return removeDefect(defects, data.defect.id);
          },
          // 바운딩 박스 삭제 취소 (복원)
          undo: (defects) => {
            console.log(`UNDO: DELETE_BOX - ID: ${data.defect.id}`);
            const exists = defects.some(d => String(d.id) === String(data.defect.id));
            if (exists) {
              console.log(`Box with ID ${data.defect.id} already exists, not restoring`);
              return defects;
            }
            return [...defects, data.defect];
          },
          // 선택 상태 처리
          updateSelection: {
            do: (current) => current === data.defect.id ? null : current,
            undo: () => null // 삭제 취소 후 선택 상태는 유지
          }
        };
        
      case ACTION_TYPES.MOVE_BOX:
        return {
          type,
          data,
          // 바운딩 박스 이동 실행
          do: (defects) => {
            console.log(`DO: MOVE_BOX - ID: ${data.defectId}`);
            return updateDefect(defects, data.defectId, (defect) => ({
              ...defect,
              coordinates: {
                ...defect.coordinates,
                x: data.newCoordinates.x,
                y: data.newCoordinates.y
              }
            }));
          },
          // 바운딩 박스 이동 취소 (원래 위치로)
          undo: (defects) => {
            console.log(`UNDO: MOVE_BOX - ID: ${data.defectId}`);
            return updateDefect(defects, data.defectId, (defect) => ({
              ...defect,
              coordinates: {
                ...defect.coordinates,
                x: data.prevCoordinates.x,
                y: data.prevCoordinates.y
              }
            }));
          }
        };
        
      case ACTION_TYPES.RESIZE_BOX:
        return {
          type,
          data,
          // 바운딩 박스 크기 변경 실행
          do: (defects) => {
            console.log(`DO: RESIZE_BOX - ID: ${data.defectId}`);
            return updateDefect(defects, data.defectId, (defect) => ({
              ...defect,
              coordinates: {...data.newCoordinates}
            }));
          },
          // 바운딩 박스 크기 변경 취소 (원래 크기로)
          undo: (defects) => {
            console.log(`UNDO: RESIZE_BOX - ID: ${data.defectId}`);
            return updateDefect(defects, data.defectId, (defect) => ({
              ...defect,
              coordinates: {...data.prevCoordinates}
            }));
          }
        };
        
      case ACTION_TYPES.CHANGE_CLASS:
        return {
          type,
          data,
          // 결함 유형 변경 실행
          do: (defects) => {
            console.log(`DO: CHANGE_CLASS - ID: ${data.defectId} from ${data.prevClass} to ${data.newClass}`);
            return updateDefect(defects, data.defectId, (defect) => ({
              ...defect,
              type: data.newClass,
              typeId: data.newTypeId,
              color: data.newColor
            }));
          },
          // 결함 유형 변경 취소 (원래 유형으로)
          undo: (defects) => {
            console.log(`UNDO: CHANGE_CLASS - ID: ${data.defectId} from ${data.newClass} back to ${data.prevClass}`);
            return updateDefect(defects, data.defectId, (defect) => ({
              ...defect,
              type: data.prevClass,
              typeId: data.prevTypeId,
              color: data.prevColor
            }));
          }
        };
        
      default:
        console.warn(`Unknown action type: ${type}`);
        return null;
    }
  }, []);

  /**
   * 작업을 히스토리에 추가
   * @param {Object} action - 작업 객체 (type과 data 포함)
   */
  const addToHistory = useCallback((action) => {
    // 작업 처리 중이면 중복 추가 방지
    if (isProcessing) {
      console.log('History processing in progress, skipping action');
      return;
    }
    
    // action이 이미 타입과 데이터를 포함하는 객체인지 확인
    const type = action.type;
    const data = action.data;
    
    if (!type) {
      console.error('Invalid action provided to addToHistory, missing type:', action);
      return;
    }
    
    console.log('Adding to history:', { type, data });
    
    // 작업 명령 생성
    const command = createCommand(type, data);
    if (!command) {
      console.error('Failed to create command for:', { type, data });
      return;
    }
    
    console.log('Command created:', command);
    
    // 히스토리 상태 업데이트
    setDefects(prevDefects => {
      console.log('Previous defects:', prevDefects);
      
      // 현재 작업 실행
      const newDefects = command.do(prevDefects);
      console.log('New defects after command execution:', newDefects);
      
      // 선택 상태 업데이트 (필요한 경우)
      if (command.updateSelection) {
        console.log('Updating selection');
        setSelectedDefect(prev => command.updateSelection.do(prev));
      }
      
      // undo 스택에 추가하고 redo 스택을 비움
      setUndoStack(prev => [...prev, command]);
      setRedoStack([]);
      
      return newDefects;
    });
  }, [createCommand, isProcessing, setDefects, setSelectedDefect]);

  /**
   * 실행 취소 함수 (Undo)
   */
  const handleUndo = useCallback(() => {
    // undo 불가능하면 아무것도 하지 않음
    if (!canUndo || isProcessing) {
      console.log('Cannot undo: canUndo =', canUndo, 'isProcessing =', isProcessing);
      return;
    }
    
    console.log('Executing undo operation');
    
    // 작업 처리 중 플래그 설정
    setIsProcessing(true);
    
    // undo 스택에서 가장 최근 작업 가져오기
    setUndoStack(prev => {
      if (prev.length === 0) {
        console.log('Undo stack is empty');
        setIsProcessing(false);
        return prev;
      }
      
      const newUndoStack = [...prev];
      const command = newUndoStack.pop();
      
      // 취소할 작업이 있으면 실행
      if (command) {
        console.log(`Undoing: ${command.type}`, command.data);
        
        // defects 상태 업데이트
        setDefects(prevDefects => {
          try {
            // 작업 취소(undo) 실행
            console.log('Before undo, defects:', prevDefects);
            const newDefects = command.undo(prevDefects);
            console.log('After undo, defects:', newDefects);
            
            // 선택 상태 업데이트 (필요한 경우)
            if (command.updateSelection) {
              console.log('Updating selection for undo');
              setSelectedDefect(prev => command.updateSelection.undo(prev));
            }
            
            // redo 스택에 취소된 작업 추가
            setRedoStack(prev => [...prev, command]);
            
            return newDefects;
          } catch (error) {
            console.error('Error during undo operation:', error);
            return prevDefects;
          }
        });
      }
      
      return newUndoStack;
    });
    
    // 작업 처리 완료
    setTimeout(() => {
      setIsProcessing(false);
      console.log('Undo operation completed');
    }, 50);
  }, [canUndo, isProcessing, setDefects, setSelectedDefect]);

  /**
   * 다시 실행 함수 (Redo)
   */
  const handleRedo = useCallback(() => {
    // redo 불가능하면 아무것도 하지 않음
    if (!canRedo || isProcessing) {
      console.log('Cannot redo: canRedo =', canRedo, 'isProcessing =', isProcessing);
      return;
    }
    
    console.log('Executing redo operation');
    
    // 작업 처리 중 플래그 설정
    setIsProcessing(true);
    
    // redo 스택에서 가장 최근 작업 가져오기
    setRedoStack(prev => {
      if (prev.length === 0) {
        console.log('Redo stack is empty');
        setIsProcessing(false);
        return prev;
      }
      
      const newRedoStack = [...prev];
      const command = newRedoStack.pop();
      
      // 다시 실행할 작업이 있으면 실행
      if (command) {
        console.log(`Redoing: ${command.type}`, command.data);
        
        // defects 상태 업데이트
        setDefects(prevDefects => {
          try {
            // 작업 실행(do) 실행
            console.log('Before redo, defects:', prevDefects);
            const newDefects = command.do(prevDefects);
            console.log('After redo, defects:', newDefects);
            
            // 선택 상태 업데이트 (필요한 경우)
            if (command.updateSelection) {
              console.log('Updating selection for redo');
              setSelectedDefect(prev => command.updateSelection.do(prev));
            }
            
            // undo 스택에 다시 실행된 작업 추가
            setUndoStack(prev => [...prev, command]);
            
            return newDefects;
          } catch (error) {
            console.error('Error during redo operation:', error);
            return prevDefects;
          }
        });
      }
      
      return newRedoStack;
    });
    
    // 작업 처리 완료
    setTimeout(() => {
      setIsProcessing(false);
      console.log('Redo operation completed');
    }, 50);
  }, [canRedo, isProcessing, setDefects, setSelectedDefect]);

  /**
   * 히스토리 모두 초기화
   */
  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // 외부에서 사용 가능한 함수 및 상태 반환
  return {
    addToHistory,
    handleUndo,
    handleRedo,
    clearHistory,
    canUndo,
    canRedo,
    undoStackSize: undoStack.length,
    redoStackSize: redoStack.length
  };
};

export default useAnnotationHistory; 