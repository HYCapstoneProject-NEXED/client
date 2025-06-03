/**
 * 어노테이션 데이터 관리 훅
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AnnotationService from '../services/AnnotationService';
import { ACTION_TYPES, setLoadedDefectClasses } from '../constants/annotationConstants';
import { formatDateTime } from '../utils/annotationUtils';

// AnnotationService에서 API_URL 가져오기
const API_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';

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
    filePath: '',
    dimensions: {
      width: 0,
      height: 0
    }
  });
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // DefectClasses 정보
  const [defectClasses, setDefectClasses] = useState([]);
  // 변경 사항 추적 플래그
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // 초기 로드된 어노테이션 ID 추적
  const [initialAnnotationIds, setInitialAnnotationIds] = useState(new Set());
  // 마지막 주석 ID 추적
  const [lastAnnotationId, setLastAnnotationId] = useState(0);
  // 강제 리렌더링을 위한 더미 상태
  const [forceRender, setForceRender] = useState(0);

  /**
   * 새로 추가된 주석의 표시용 ID 계산
   * @param {string} defectId - 주석 ID
   * @returns {string} 표시용 ID
   */
  const getDisplayId = useCallback((defectId) => {
    // 기존 주석인 경우 원래 ID 반환
    if (initialAnnotationIds.has(defectId)) {
      return defectId;
    }
    
    // 새로 추가된 주석들만 필터링 (정렬하지 않음 - 배열 순서 유지)
    const newAnnotations = defects.filter(defect => !initialAnnotationIds.has(defect.id));
    
    // 현재 주석의 배열 내 인덱스 찾기
    const index = newAnnotations.findIndex(defect => defect.id === defectId);
    
    if (index === -1) {
      // 찾을 수 없는 경우 원래 ID 반환
      return defectId;
    }
    
    // last_annotation_id + 배열 인덱스 + 1로 표시 ID 계산
    return String(lastAnnotationId + index + 1);
  }, [defects, initialAnnotationIds, lastAnnotationId]);

  /**
   * DefectClasses 데이터 불러오기
   */
  const loadDefectClasses = useCallback(async () => {
    try {
      // DefectClasses 가져오기
      const classes = await AnnotationService.getDefectClasses();
      setDefectClasses(classes);
      
      // 전역 상수에도 저장
      setLoadedDefectClasses(classes);
      
      return classes;
    } catch (error) {
      console.error('Failed to load defect classes:', error);
      return [];
    }
  }, []);

  /**
   * 어노테이션 데이터 불러오기
   */
  const loadAnnotationData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(`=== 이미지 ID ${imageId}에 대한 어노테이션 데이터 로딩 시작 ===`);
      
      // DefectClasses 먼저 로드
      const classes = await loadDefectClasses();
      console.log('결함 클래스 로드 완료:', classes.length, '개');
      
      // 현재 페이지가 편집 페이지인지 확인
      const isEditPage = window.location.pathname.includes('/edit/');
      console.log('현재 페이지 타입:', isEditPage ? '편집 페이지' : '상세 페이지');
      
      let imageDetail = null;
      
      try {
        if (isEditPage) {
          // 편집 페이지: GET /annotations/detail/{image_id} 사용
          console.log('편집 페이지: 단일 이미지 상세 정보 API 사용');
          const annotationDetail = await AnnotationService.getAnnotationsByImageId(imageId);
          console.log('어노테이션 상세 정보 로드 성공, 개수:', annotationDetail.length);
      
      // 이미지 상세 정보 가져오기
          imageDetail = await AnnotationService.getImageDetailById(imageId);
          
      if (imageDetail) {
            // last_annotation_id 설정 
            setLastAnnotationId(imageDetail.last_annotation_id || 0);
            console.log('last_annotation_id 설정:', imageDetail.last_annotation_id || 0);
            
            // 어노테이션 상세 정보를 defects 배열로 변환
            const transformedData = annotationDetail.map(defect => {
              return transformDefectToFrontendModel(defect, classes, imageDetail);
            });
            
            // 초기 로드된 어노테이션 ID 저장
            const initialIds = new Set(transformedData.map(defect => defect.id));
            setInitialAnnotationIds(initialIds);
            console.log('초기 로드된 어노테이션 ID 저장:', Array.from(initialIds));
            
            setDefects(transformedData);
        
        // 이미지 데이터 포맷팅
        setDataInfo({
          dataId: `IMG_${imageDetail.image_id}`,
              confidenceScore: calculateMinConfidence(annotationDetail),
          captureDate: imageDetail.capture_date_formatted,
          lastModified: imageDetail.last_modified_formatted,
          state: imageDetail.status || 'pending',
          filePath: imageDetail.file_path,
          dimensions: {
                width: imageDetail.width || 4032,
                height: imageDetail.height || 3024
          }
        });
          }
        } else {
          // 상세 페이지: POST /annotations/details 사용
          console.log('상세 페이지: 여러 이미지 상세 정보 API 사용');
          const detailsResult = await AnnotationService.getMultipleAnnotationDetails([imageId]);
          console.log('어노테이션 상세 정보 결과:', detailsResult);
          
          // 결과에서 해당 이미지의 상세 정보 추출 (배열의 첫 번째 항목)
          imageDetail = detailsResult.length > 0 ? detailsResult[0] : null;
          
          if (imageDetail) {
            // last_annotation_id 설정 
            setLastAnnotationId(imageDetail.last_annotation_id || 0);
            console.log('last_annotation_id 설정:', imageDetail.last_annotation_id || 0);
            
            // 어노테이션 상세 정보를 defects 배열로 변환
            const transformedData = imageDetail.defects.map(defect => {
              return transformDefectToFrontendModel(defect, classes, imageDetail);
            });
            
            // 초기 로드된 어노테이션 ID 저장
            const initialIds = new Set(transformedData.map(defect => defect.id));
            setInitialAnnotationIds(initialIds);
            console.log('초기 로드된 어노테이션 ID 저장:', Array.from(initialIds));
            
            setDefects(transformedData);
            
            // 이미지 데이터 포맷팅
            setDataInfo({
              dataId: `IMG_${imageDetail.image_id}`,
              confidenceScore: calculateMinConfidence(imageDetail.defects),
              captureDate: formatDateTime(imageDetail.date),
              lastModified: formatDateTime(imageDetail.date),
              state: imageDetail.status || 'pending',
              filePath: imageDetail.file_path,
              dimensions: {
                width: imageDetail.width || 4032,
                height: imageDetail.height || 3024
              }
            });
          }
        }
      } catch (apiError) {
        console.error('API 호출 실패:', apiError);
        throw apiError;
      }
      
      setIsLoading(false);
      // 데이터 로드 후 변경 사항 없음으로 설정
      setHasUnsavedChanges(false);
      console.log('=== 데이터 로딩 완료 ===');
    } catch (error) {
      console.error('어노테이션 데이터 로드 중 오류 발생:', error);
      setIsLoading(false);
    }
  }, [imageId, loadDefectClasses, formatDateTime]);

  // 최소 신뢰도 점수 계산 헬퍼 함수
  const calculateMinConfidence = (defects) => {
    if (!defects || defects.length === 0) return null;
    
    const confidenceScores = defects
      .map(defect => defect.conf_score)
      .filter(score => score !== null && score !== undefined);
    
    return confidenceScores.length > 0 ? Math.min(...confidenceScores) : null;
  };

  // 백엔드 defect 객체를 프론트엔드 모델로 변환
  const transformDefectToFrontendModel = (defect, classes, imageDetail) => {
    // 클래스 정보 찾기
    const defectClass = classes.find(c => c.class_id === defect.class_id) || {};
    
    // 바운딩 박스 좌표 처리
    let coordinates = {};
    const imageWidth = imageDetail.width || 4032;
    const imageHeight = imageDetail.height || 3024;
    
    console.log('=== 바운딩 박스 변환 시작 ===');
    console.log('defect:', defect);
    console.log('boundingBox:', defect.bounding_box);
    console.log('imageWidth:', imageWidth, 'imageHeight:', imageHeight);
    
    // 바운딩 박스 형식에 따라 처리
    const boundingBox = defect.bounding_box;
    
    if (boundingBox) {
      // 새로운 형태: { width, height, x_center, y_center } (정규화된 좌표)
      if (boundingBox.width !== undefined && boundingBox.height !== undefined && 
          boundingBox.x_center !== undefined && boundingBox.y_center !== undefined) {
        console.log('새로운 형태 (width, height, x_center, y_center) 처리 중...');
        
        const width = boundingBox.width * imageWidth;
        const height = boundingBox.height * imageHeight;
        const x = (boundingBox.x_center * imageWidth) - (width / 2);
        const y = (boundingBox.y_center * imageHeight) - (height / 2);
        
        coordinates = { x, y, width, height };
        console.log('변환된 픽셀 좌표:', coordinates);
      }
      // 사용자 정의 형태: { h, w, x_center, y_center } (정규화된 좌표)
      else if (boundingBox.h !== undefined && boundingBox.w !== undefined && 
               boundingBox.x_center !== undefined && boundingBox.y_center !== undefined) {
        console.log('사용자 정의 형태 (h, w, x_center, y_center) 처리 중...');
        
        const width = boundingBox.w * imageWidth;
        const height = boundingBox.h * imageHeight;
        const x = (boundingBox.x_center * imageWidth) - (width / 2);
        const y = (boundingBox.y_center * imageHeight) - (height / 2);
        
        coordinates = { x, y, width, height };
        console.log('변환된 픽셀 좌표:', coordinates);
      }
      // POST API 응답 형태: { h, w, cx, cy } (정규화된 좌표)
      else if (boundingBox.h !== undefined && boundingBox.w !== undefined && 
               boundingBox.cx !== undefined && boundingBox.cy !== undefined) {
        console.log('POST API 형태 (h, w, cx, cy) 처리 중...');
        
        const width = boundingBox.w * imageWidth;
        const height = boundingBox.h * imageHeight;
        const x = (boundingBox.cx * imageWidth) - (width / 2);
        const y = (boundingBox.cy * imageHeight) - (height / 2);
        
        coordinates = { x, y, width, height };
        console.log('변환된 픽셀 좌표:', coordinates);
      }
      // API 형식에 따라 처리 (additionalProp1 키가 있는 경우)
      else if (boundingBox.additionalProp1) {
        console.log('additionalProp1 형태 처리 중...');
        const boxData = boundingBox.additionalProp1;
        
        // 정규화된 좌표를 픽셀 좌표로 변환
        if (boxData.cx !== undefined && boxData.cy !== undefined) {
          const width = boxData.w * imageWidth;
          const height = boxData.h * imageHeight;
          const x = (boxData.cx * imageWidth) - (width / 2);
          const y = (boxData.cy * imageHeight) - (height / 2);
          
          coordinates = { x, y, width, height };
          console.log('변환된 픽셀 좌표:', coordinates);
        }
      }
      // 직접 좌표가 있는 경우 (cx, cy, w, h)
      else if (boundingBox.cx !== undefined && boundingBox.cy !== undefined) {
        console.log('cx, cy, w, h 형태 처리 중...');
        const width = boundingBox.w * imageWidth;
        const height = boundingBox.h * imageHeight;
        const x = (boundingBox.cx * imageWidth) - (width / 2);
        const y = (boundingBox.cy * imageHeight) - (height / 2);
        
        coordinates = { x, y, width, height };
        console.log('변환된 픽셀 좌표:', coordinates);
      }
      // 이미 픽셀 좌표인 경우
      else if (boundingBox.x !== undefined && boundingBox.y !== undefined) {
        console.log('픽셀 좌표 형태 처리 중...');
        coordinates = {
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height
        };
        console.log('픽셀 좌표 사용:', coordinates);
      }
      else {
        console.warn('지원되지 않는 바운딩 박스 형태:', boundingBox);
      }
    } else {
      console.warn('바운딩 박스 데이터가 없습니다.');
    }
    
    console.log('=== 바운딩 박스 변환 완료 ===');
    
    // 프론트엔드 모델로 변환
    const result = {
      id: String(defect.annotation_id),
      type: defect.class_name || defectClass.class_name || 'Unknown',
      typeId: defect.class_id,
      confidence: defect.conf_score,
      coordinates: coordinates,
      color: defect.class_color || defectClass.class_color,
      date: imageDetail.date,
      status: imageDetail.status || 'pending',
      userId: defect.user_id
    };
    
    console.log('변환된 defect:', result);
    return result;
  };

  /**
   * 어노테이션 저장
   */
  const saveAnnotations = useCallback(async () => {
    try {
      console.log('=== 어노테이션 저장 시작 ===');
      // API 엔드포인트 호출에는 사용자 ID 2를 사용 (어노테이터 ID)
      const userId = 2;
      
      // 저장 진행 중 상태 표시
      setIsLoading(true);
      
      // 새 어노테이션과 기존 어노테이션을 분리
      const newAnnotations = [];
      const existingAnnotations = [];
      
      // defects 목록이 비어있는 경우 처리
      if (!defects || defects.length === 0) {
        console.log('저장할 defects가 없습니다.');
        setIsLoading(false);
        alert('저장할 어노테이션이 없습니다.');
        return false;
      }
      
      console.log(`저장할 defects 개수: ${defects.length}`);
      console.log('초기 로드된 어노테이션 ID:', Array.from(initialAnnotationIds));
      
      defects.forEach(defect => {
        // pixelCoords가 없는 경우 스킵
        if (!defect.coordinates) {
          console.warn('좌표 정보가 없는 defect 무시:', defect.id);
          return;
        }
        
        // 픽셀 좌표를 정규화된 좌표로 변환 (사용자 정의 형식: h, w, x_center, y_center)
        const pixelCoords = defect.coordinates;
        const imageWidth = dataInfo.dimensions.width || 4032;
        const imageHeight = dataInfo.dimensions.height || 3024;
        
        // 정규화된 좌표 계산 (0~1 사이 값) - 사용자 정의 형식 사용
        const boundingBoxForApi = {
          // 사용자 정의 순서: h, w, x_center, y_center
          h: pixelCoords.height / imageHeight,
          w: pixelCoords.width / imageWidth,
          x_center: (pixelCoords.x + pixelCoords.width / 2) / imageWidth,
          y_center: (pixelCoords.y + pixelCoords.height / 2) / imageHeight
        };
        
        // 초기 로드된 어노테이션 ID 집합에 포함된 경우 기존 어노테이션으로 처리
        if (initialAnnotationIds.has(defect.id)) {
          console.log(`기존 어노테이션으로 처리: ID=${defect.id}, 타입=${defect.type}`);
          
          // API 요청 스키마에 맞게 필수 필드만 포함
          existingAnnotations.push({
            class_id: defect.typeId,
            bounding_box: boundingBoxForApi,
            annotation_id: parseInt(defect.id)
          });
        } else {
          // 초기 로드 목록에 없는 경우 새 어노테이션으로 처리
          console.log(`새 어노테이션으로 처리: ID=${defect.id}, 타입=${defect.type}`);
          
          // API 요청 스키마에 맞게 필수 필드만 포함
          newAnnotations.push({
            class_id: defect.typeId,
            bounding_box: boundingBoxForApi
          });
        }
      });
      
      console.log('새 어노테이션 개수:', newAnnotations.length);
      console.log('기존 어노테이션 개수:', existingAnnotations.length);
      
      if (newAnnotations.length === 0 && existingAnnotations.length === 0) {
        console.log('저장할 어노테이션이 없습니다.');
        setIsLoading(false);
        alert('저장할 어노테이션이 없습니다.');
        return false;
      }
      
      try {
        // API 호출 시작, 요청 데이터 로깅
        console.log('API 호출 시작, 이미지 ID:', imageId, '사용자 ID:', userId);
        console.log('API 요청 형식:', {
          annotations: newAnnotations,
          existing_annotations: existingAnnotations
        });
        
        // 디버깅: 실제 전송될 데이터 상세 로깅
        console.log('=== 상세 요청 데이터 ===');
        console.log('새 어노테이션:', JSON.stringify(newAnnotations, null, 2));
        console.log('기존 어노테이션:', JSON.stringify(existingAnnotations, null, 2));
        
        // API 호출하여 어노테이션 업데이트
        const updatedAnnotations = await AnnotationService.updateImageAnnotations(
          userId,
          imageId,
          newAnnotations,
          existingAnnotations
        );
        
        console.log('API 호출 성공! 응답 데이터 개수:', updatedAnnotations.length);
        
        // 저장 성공 후 지연 설정 (API 처리 시간 확보)
        await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 마지막 수정 날짜 업데이트
      const now = new Date();
      const formattedDate = formatDateTime(now.toISOString());
      
      setDataInfo(prev => ({
        ...prev,
        lastModified: formattedDate
      }));
      
      // 저장 후 변경 사항 없음으로 설정
      setHasUnsavedChanges(false);
        
        // 로딩 상태 해제
        setIsLoading(false);
      
      // 성공 시 alert 제거 (호출하는 쪽에서 처리)
      return true;
      } catch (apiError) {
        console.error('API 호출 오류:', apiError);
        
        // 더 자세한 오류 정보 표시
        if (apiError.response) {
          console.error('오류 상태 코드:', apiError.response.status);
          console.error('오류 응답 데이터:', apiError.response.data);
        }
        
        // 네트워크 관련 디버깅 정보
        console.log('API 호출 정보:', {
          API_URL: API_URL,
          endpoint: `/annotations/detail/${userId}/${imageId}`,
          method: 'PUT'
        });
        
        // 로딩 상태 해제
        setIsLoading(false);
        
        // 오류 알림 (오류 세부 정보 포함)
        const errorDetail = apiError.response?.data?.detail 
          ? JSON.stringify(apiError.response.data.detail) 
          : apiError.message || '알 수 없는 오류';
        
        alert(`어노테이션 저장 중 오류가 발생했습니다:\n${errorDetail}`);
        return false;
      }
    } catch (error) {
      // 예외 처리
      console.error('어노테이션 저장 중 예외 발생:', error);
      
      // 로딩 상태 해제
      setIsLoading(false);
      
      // 오류 알림
      alert('어노테이션 저장 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
      return false;
    }
  }, [defects, imageId, dataInfo.dimensions, formatDateTime, setIsLoading, initialAnnotationIds]);

  /**
   * 바운딩 박스 추가
   * @param {Object} coordinates - 바운딩 박스 좌표 {x, y, width, height}
   * @param {string} defectType - 결함 유형 (선택적, 기본값: 'Scratch')
   * @returns {Object|null} 생성된 defect 객체 또는 null
   */
  const addBox = useCallback(async (coordinates, defectType) => {
    try {
     // 새로 추가된 주석들의 개수를 계산 (기존 주석 제외)
     const newAnnotations = defects.filter(defect => !initialAnnotationIds.has(defect.id));
     const newAnnotationIndex = newAnnotations.length; // 0부터 시작하는 인덱스
     
     // last_annotation_id + 새 주석 배열의 인덱스 + 1로 ID 생성
     const newId = String(lastAnnotationId + newAnnotationIndex + 1);
     
     console.log('Adding new box with type:', defectType, 'coordinates:', coordinates);
     console.log('New annotation ID:', newId, '(lastAnnotationId:', lastAnnotationId, '+ newAnnotationIndex:', newAnnotationIndex, '+ 1)');
        
        // API에서 최신 결함 클래스 정보 가져오기
        console.log('GET /defect-classes API를 호출하여 최신 결함 클래스 정보 조회');
        const latestDefectClasses = await AnnotationService.getDefectClasses();
        console.log('조회된 결함 클래스:', latestDefectClasses);
    
    // defectType에 해당하는 defectClass 찾기
      const defectClass = latestDefectClasses.find(dc => dc.class_name === defectType);
    if (!defectClass) {
      console.warn('Could not find defect class for type:', defectType, 'Using default class');
    }
    
    const typeId = defectClass ? defectClass.class_id : 1; // 기본값은 Scratch (1)
    const color = defectClass ? defectClass.class_color : null;
    
    console.log('Found defect class:', defectClass, 'typeId:', typeId, 'color:', color);
    
    // 새 defect 객체 생성
    const newDefect = {
      id: newId,
      type: defectType,
      typeId: typeId,
      confidence: null, // 사용자가 생성한 바운딩 박스의 confidence 값 - null로 설정하여 '-'로 표시
      coordinates: coordinates,
      imageId: imageId,
      color: color,
      date: new Date().toISOString(),
      status: 'pending',
      userId: 2 // 새 어노테이션의 경우 userId를 2로 설정 (어노테이터 ID)
    };
    
    console.log('Created new defect:', newDefect);
    
    // defects 배열에 추가
    setDefects(prev => [...prev, newDefect]);
    
    // 변경 사항 있음으로 표시
    setHasUnsavedChanges(true);
    
    // 히스토리에 작업 추가
    addToHistory({
      type: ACTION_TYPES.ADD_BOX,
      data: {
        defect: newDefect
      }
    });
    
    return newDefect; // 새로 생성된 ID 반환
    } catch (error) {
      console.error('바운딩 박스 추가 중 오류 발생:', error);
      alert(`바운딩 박스 추가 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
      return null;
    }
  }, [defects, imageId, addToHistory, initialAnnotationIds, lastAnnotationId]);

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
    if (!defect) {
      console.error('Cannot update coordinates for non-existent defect:', defectIdStr);
      return;
    }
    
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
      console.log('Coordinates unchanged, skipping history update');
      return;
    }
    
    console.log('Updating coordinates for defect:', defectIdStr);
    console.log('Previous coordinates:', prevCoordinates);
    console.log('New coordinates:', fullNewCoordinates);
    
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
    
    // 변경 사항 있음으로 표시
    setHasUnsavedChanges(true);
    
    // 크기 변경인지 이동인지 판단 (새 좌표에 width나 height가 포함되어 있으면 크기 변경)
    const actionType = newCoordinates.width !== undefined || newCoordinates.height !== undefined
      ? ACTION_TYPES.RESIZE_BOX
      : ACTION_TYPES.MOVE_BOX;
    
    console.log('Adding to history as:', actionType);
    
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
   * 결함 클래스 업데이트
   * @param {string} defectId - 결함 ID
   * @param {string} newClass - 새 결함 유형
   */
  const updateDefectClass = useCallback(async (defectId, newClass) => {
    try {
    // 문자열 ID 처리
    const defectIdStr = String(defectId);
    
    // 현재 defect 찾기
    const defect = defects.find(d => String(d.id) === defectIdStr);
    if (!defect) {
      console.error('Cannot update class for non-existent defect:', defectIdStr);
      return;
    }
    
    if (defect.type === newClass) {
      console.log('Class already set to', newClass, 'for defect', defectIdStr, '. No change needed.');
      return;
    }
    
    // 이전 클래스 정보 저장
    const prevClass = defect.type;
    const prevTypeId = defect.typeId;
    const prevColor = defect.color;
    
    console.log('Updating defect class:', {
      defectId: defectIdStr,
      prevClass,
      prevTypeId,
      prevColor,
      newClass
    });
      
      // API에서 최신 결함 클래스 정보 가져오기
      console.log('GET /defect-classes API를 호출하여 최신 결함 클래스 정보 조회');
      const latestDefectClasses = await AnnotationService.getDefectClasses();
      console.log('조회된 결함 클래스:', latestDefectClasses);
    
    // newClass에 해당하는 defectClass 찾기
      const defectClass = latestDefectClasses.find(dc => dc.class_name === newClass);
    if (!defectClass) {
      console.warn('Could not find defect class for type:', newClass, 'Using default values');
    }
    
    // 새 클래스 정보
    const newTypeId = defectClass ? defectClass.class_id : 1; // 기본값은 Scratch (1)
    const newColor = defectClass ? defectClass.class_color : prevColor; // 기존 색상 유지 (없으면)
    
    console.log('New class details:', {
      defectClass, 
      newTypeId, 
      newColor
    });
    
    // defects 업데이트 - 클래스 변경
    setDefects(currentDefects => {
      const updated = currentDefects.map(d => {
        if (String(d.id) === defectIdStr) {
          const updatedDefect = {
            ...d,
            type: newClass,
            typeId: newTypeId,
            color: newColor
          };
          
          console.log('Updated defect:', updatedDefect);
          return updatedDefect;
        }
        return d;
      });
      
      return updated;
    });
    
    // 변경 사항 있음으로 표시
    setHasUnsavedChanges(true);
    
    // 히스토리에 작업 추가 - 모든 필요한 정보를 포함
    const historyAction = {
      type: ACTION_TYPES.CHANGE_CLASS,
      data: {
        defectId: defectIdStr,
        prevClass,
        prevTypeId,
        prevColor,
        newClass,
        newTypeId,
        newColor
      }
    };
    
    console.log('Adding class change to history:', historyAction);
    addToHistory(historyAction);
    } catch (error) {
      console.error('결함 클래스 업데이트 중 오류 발생:', error);
      alert(`결함 클래스 변경 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  }, [defects, addToHistory]);

  /**
   * 결함 삭제
   * @param {string} defectId - 결함 ID
   */
  const deleteDefect = useCallback((defectId) => {
    // 문자열 ID 처리
    const defectIdStr = String(defectId);
    
    // 삭제할 defect 저장
    const defectToDelete = defects.find(d => String(d.id) === defectIdStr);
    if (!defectToDelete) {
      console.error('Cannot delete non-existent defect:', defectIdStr);
      return;
    }
    
    console.log('Deleting defect:', defectToDelete);
    
    // defects 업데이트 - 삭제 (ID 재조정 없이 단순 삭제)
    setDefects(currentDefects => {
      const filteredDefects = currentDefects.filter(defect => 
        String(defect.id) !== defectIdStr
      );
      
      console.log('Defects after deletion:', filteredDefects);
      return filteredDefects;
    });
    
    // 변경 사항 있음으로 표시
    setHasUnsavedChanges(true);
    
    // 히스토리 액션 생성
    const deleteAction = {
      type: ACTION_TYPES.DELETE_BOX,
      data: {
        defect: defectToDelete
      }
    };
    
    console.log('Adding delete action to history:', deleteAction);
    
    // 히스토리에 작업 추가
    addToHistory(deleteAction);
  }, [defects, addToHistory]);

  /**
   * 초기 데이터 로딩
   */
  useEffect(() => {
    loadAnnotationData();
  }, [loadAnnotationData]);

  // 변경 사항이 있는지 확인하는 함수 (페이지 나가기 전에 사용)
  const checkUnsavedChanges = useCallback(() => {
    return hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // defects가 변경될 때마다 강제 리렌더링 트리거
  useEffect(() => {
    setForceRender(prev => prev + 1);
    console.log('defects 변경됨, 강제 리렌더링 트리거');
  }, [defects, initialAnnotationIds, lastAnnotationId]);

  // displayId가 포함된 defects 배열 생성 (useMemo 사용)
  const defectsWithDisplayId = useMemo(() => {
    console.log('=== displayId 재계산 시작 (useMemo) ===');
    console.log('전체 defects:', defects.map(d => ({ id: d.id, type: d.type })));
    console.log('initialAnnotationIds:', Array.from(initialAnnotationIds));
    console.log('lastAnnotationId:', lastAnnotationId);
    console.log('forceRender:', forceRender);
    
    const updatedDefects = defects.map(defect => {
      // 기존 주석인 경우 원래 ID 반환
      if (initialAnnotationIds.has(defect.id)) {
        console.log(`기존 주석 ${defect.id}: displayId = ${defect.id}`);
        return {
          ...defect,
          displayId: defect.id
        };
      }
      
      // 새로 추가된 주석들만 필터링 (정렬하지 않음 - 배열 순서 유지)
      const newAnnotations = defects.filter(d => !initialAnnotationIds.has(d.id));
      console.log('새로 추가된 주석들:', newAnnotations.map(d => ({ id: d.id, type: d.type })));
      
      // 현재 주석의 배열 내 인덱스 찾기
      const index = newAnnotations.findIndex(d => d.id === defect.id);
      console.log(`주석 ${defect.id}의 인덱스: ${index}`);
      
      if (index === -1) {
        // 찾을 수 없는 경우 원래 ID 반환
        console.log(`주석 ${defect.id} 인덱스를 찾을 수 없음: displayId = ${defect.id}`);
        return {
          ...defect,
          displayId: defect.id
        };
      }
      
      // last_annotation_id + 배열 인덱스 + 1로 표시 ID 계산
      const displayId = String(lastAnnotationId + index + 1);
      console.log(`주석 ${defect.id}: lastAnnotationId(${lastAnnotationId}) + index(${index}) + 1 = displayId(${displayId})`);
      
      return {
        ...defect,
        displayId: displayId
      };
    });
    
    console.log('=== 최종 업데이트된 defects ===');
    console.log(updatedDefects.map(d => ({ id: d.id, displayId: d.displayId, type: d.type })));
    
    return updatedDefects;
  }, [defects, initialAnnotationIds, lastAnnotationId, forceRender]);

  return {
    defects: defectsWithDisplayId,
    setDefects,
    dataInfo,
    setDataInfo,
    isLoading,
    defectClasses,
    addBox,
    updateCoordinates,
    updateDefectClass,
    deleteDefect,
    saveAnnotations,
    checkUnsavedChanges,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    getDisplayId,
    forceRender
  };
};

export default useAnnotationData; 