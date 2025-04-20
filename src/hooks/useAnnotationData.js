/**
 * 어노테이션 데이터 관리 훅
 */
import { useState, useEffect, useCallback } from 'react';
import AnnotationService from '../services/AnnotationService';
import { ACTION_TYPES } from '../constants/annotationConstants';
import { formatDateTime } from '../utils/annotationUtils';

/**
 * 어노테이션 데이터 로딩 및 관리를 위한 커스텀 훅
 * @param {number} imageId - 이미지 ID
 * @param {function} addToHistory - 히스토리에 작업 추가 함수
 * @returns {Object} 어노테이션 관련 상태 및 함수들
 */
const useAnnotationData = (imageId, addToHistory) => {
  // 결함 데이터 상태 관리
  const [defects, setDefects] = useState([]);
  // 이미지/데이터 정보
  const [dataInfo, setDataInfo] = useState({
    dataId: '',
    confidenceScore: 0,
    state: 'pending',
    captureDate: '',
    lastModified: '',
    dimensions: {
      width: 0,
      height: 0
    }
  });
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 어노테이션 데이터 불러오기
   */
  const loadAnnotationData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 이미지 관련 어노테이션 데이터 가져오기
      const annotations = await AnnotationService.getAnnotationsByImageId(imageId);
      
      // 백엔드 데이터를 프론트엔드 포맷으로 변환
      const transformedData = annotations.map(anno => 
        AnnotationService.transformToFrontendModel(anno)
      );
      
      setDefects(transformedData);
      
      // 이미지 상세 정보 가져오기
      const imageDetail = await AnnotationService.getImageDetailById(imageId);
      if (imageDetail) {
        setDataInfo(prev => ({
          ...prev,
          ...imageDetail,
          state: imageDetail.status // status를 state로 변환
        }));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load annotation data:', error);
      setIsLoading(false);
    }
  }, [imageId]);

  /**
   * 어노테이션 저장
   */
  const saveAnnotations = useCallback(async () => {
    try {
      // 각 결함(defect)을 백엔드 모델로 변환하고 저장
      const updatePromises = defects.map(defect => {
        const backendModel = AnnotationService.transformToBackendModel(defect);
        // imageId 추가
        backendModel.image_id = imageId;
        
        // 이미 ID가 있으면 업데이트, 없으면 생성
        if (defect.id && !isNaN(parseInt(defect.id))) {
          return AnnotationService.updateAnnotation(parseInt(defect.id), backendModel);
        } else {
          return AnnotationService.createAnnotation(backendModel);
        }
      });
      
      // 모든 업데이트 완료 대기
      await Promise.all(updatePromises);
      
      // 마지막 수정 날짜 업데이트
      const now = new Date();
      const formattedDate = formatDateTime(now.toISOString());
      
      setDataInfo(prev => ({
        ...prev,
        lastModified: formattedDate
      }));
      
      // 성공 알림
      alert('어노테이션이 성공적으로 저장되었습니다!');
      return true;
    } catch (error) {
      console.error('Failed to save annotations:', error);
      alert('어노테이션 저장 중 오류가 발생했습니다.');
      return false;
    }
  }, [defects, imageId]);

  /**
   * 새 바운딩 박스 추가
   * @param {Object} coordinates - 좌표 정보
   * @param {string} defectType - 결함 유형
   */
  const addBox = useCallback((coordinates, defectType) => {
    // 새 ID 생성 (현재 최대 ID + 1)
    const maxId = Math.max(...defects.map(d => parseInt(d.id) || 0), 0);
    const newId = String(maxId + 1);
    
    // 새 defect 객체 생성
    const newDefect = {
      id: newId,
      type: defectType,
      confidence: 0.9, // 사용자가 생성한 바운딩 박스의 confidence 값
      coordinates: coordinates,
      imageId: imageId,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    // defects 배열에 추가
    setDefects(prev => [...prev, newDefect]);
    
    // 히스토리에 작업 추가
    addToHistory({
      type: ACTION_TYPES.ADD_BOX,
      data: {
        defect: newDefect
      }
    });

    // 서버에 새 어노테이션 추가 요청
    const saveAnnotation = async () => {
      try {
        const backendModel = AnnotationService.transformToBackendModel(newDefect);
        await AnnotationService.createAnnotation(backendModel);
        console.log('New annotation saved to server');
      } catch (error) {
        console.error('Failed to save annotation to server:', error);
      }
    };
    
    saveAnnotation();
    
    return newId; // 새로 생성된 ID 반환
  }, [defects, imageId, addToHistory]);

  /**
   * 결함 좌표 업데이트
   * @param {string} defectId - 결함 ID
   * @param {Object} newCoordinates - 새 좌표 정보
   */
  const updateCoordinates = useCallback((defectId, newCoordinates) => {
    // 문자열 ID를 동일한 형식으로 처리
    const defectIdStr = String(defectId);
    
    // 이전 좌표 저장
    const defect = defects.find(d => String(d.id) === defectIdStr);
    if (!defect) return;
    
    const prevCoordinates = {...defect.coordinates};
    
    // newCoordinates에 포함되지 않은 값은 이전 값으로 채우기
    const fullNewCoordinates = {
      ...prevCoordinates,
      ...newCoordinates
    };
    
    // 이전 좌표와 새 좌표가 완전히 같으면 히스토리 추가하지 않음
    if (
      prevCoordinates.x === fullNewCoordinates.x &&
      prevCoordinates.y === fullNewCoordinates.y &&
      prevCoordinates.width === fullNewCoordinates.width &&
      prevCoordinates.height === fullNewCoordinates.height
    ) {
      return;
    }
    
    // defects 업데이트
    setDefects(currentDefects => 
      currentDefects.map(defect => 
        String(defect.id) === defectIdStr 
          ? {
              ...defect,
              coordinates: fullNewCoordinates
            }
          : defect
      )
    );
    
    // 크기 변경인지 이동인지 판단 (새 좌표에 width나 height가 포함되어 있으면 크기 변경)
    const actionType = newCoordinates.width !== undefined || newCoordinates.height !== undefined
      ? ACTION_TYPES.RESIZE_BOX
      : ACTION_TYPES.MOVE_BOX;
    
    // 히스토리에 작업 추가
    addToHistory({
      type: actionType,
      data: {
        defectId: defectIdStr,
        prevCoordinates,
        newCoordinates: fullNewCoordinates
      }
    });
  }, [defects, addToHistory]);

  /**
   * 결함 클래스 변경
   * @param {string} defectId - 결함 ID
   * @param {string} defectType - 새 결함 유형
   */
  const updateDefectClass = useCallback(async (defectId, defectType) => {
    // 이전 타입 저장
    const defect = defects.find(d => String(d.id) === defectId);
    if (!defect) return;
    
    const prevType = defect.type;
    
    // 이미 같은 타입이면 변경하지 않음
    if (prevType === defectType) return;
    
    // defects 업데이트
    setDefects(currentDefects => 
      currentDefects.map(defect => 
        String(defect.id) === defectId 
          ? { ...defect, type: defectType }
          : defect
      )
    );
    
    // 히스토리에 작업 추가
    addToHistory({
      type: ACTION_TYPES.CHANGE_CLASS,
      data: {
        defectId,
        prevType,
        newType: defectType
      }
    });
    
    // 서버에 클래스 변경 저장
    try {
      const updatedDefect = { ...defect, type: defectType };
      const backendModel = AnnotationService.transformToBackendModel(updatedDefect);
      await AnnotationService.updateAnnotation(parseInt(defectId), backendModel);
      console.log(`Annotation ${defectId} class updated on server`);
    } catch (error) {
      console.error(`Failed to update annotation ${defectId} class:`, error);
    }
  }, [defects, addToHistory]);

  /**
   * 결함 삭제
   * @param {string} defectId - 결함 ID
   */
  const deleteDefect = useCallback(async (defectId) => {
    if (!defectId) return;
    
    // 삭제할 defect 객체 찾기
    const defect = defects.find(d => d.id === defectId);
    if (!defect) return;
    
    try {
      // defects 업데이트
      setDefects(prev => prev.filter(d => d.id !== defectId));
      
      // 히스토리에 작업 추가
      addToHistory({
        type: ACTION_TYPES.DELETE_BOX,
        data: {
          defect
        }
      });
      
      // 서버에서 어노테이션 삭제
      await AnnotationService.deleteAnnotation(parseInt(defectId));
      console.log(`Annotation ${defectId} deleted from server`);
      return true;
    } catch (error) {
      console.error(`Failed to delete annotation ${defectId}:`, error);
      return false;
    }
  }, [defects, addToHistory]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadAnnotationData();
  }, [loadAnnotationData]);

  return {
    defects,
    setDefects,
    dataInfo,
    setDataInfo,
    isLoading,
    loadAnnotationData,
    saveAnnotations,
    addBox,
    updateCoordinates,
    updateDefectClass,
    deleteDefect
  };
};

export default useAnnotationData; 