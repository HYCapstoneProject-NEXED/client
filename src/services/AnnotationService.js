// annotation 관련 API 서비스
import axios from 'axios';
import { formatDateTime } from '../utils/annotationUtils';

// 기본 API URL (실제 배포 환경에서는 환경 변수 사용 권장)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 더미 데이터: DefectClasses 테이블 (DB 스키마와 일치)
const DUMMY_DEFECT_CLASSES = [
  {
    class_id: 1,
    class_name: 'Scratch',
    class_color: '#00B69B',
    created_at: '2023-04-10T08:00:00Z',
    updated_at: '2023-04-10T08:00:00Z',
    is_active: true
  },
  {
    class_id: 2,
    class_name: 'Dent',
    class_color: '#5A8CFF',
    created_at: '2023-04-10T08:10:00Z',
    updated_at: '2023-04-10T08:10:00Z',
    is_active: true
  },
  {
    class_id: 3,
    class_name: 'Discoloration',
    class_color: '#EF3826',
    created_at: '2023-04-10T08:20:00Z',
    updated_at: '2023-04-10T08:20:00Z',
    is_active: true
  },
  {
    class_id: 4,
    class_name: 'Contamination',
    class_color: '#FCAA0B',
    created_at: '2023-04-10T08:30:00Z',
    updated_at: '2023-04-10T08:30:00Z',
    is_active: true
  }
];

// 더미 이미지 데이터
const DUMMY_IMAGES = [
  {
    image_id: 101,
    file_name: 'sample_image_01.jpg',
    capture_date: '2023-05-15T08:25:00Z',
    last_modified: '2023-05-16T14:35:20Z',
    width: 1920,
    height: 1080,
    status: 'completed',
    camera_id: 'CAM_A001'
  },
  {
    image_id: 102,
    file_name: 'sample_image_02.jpg',
    capture_date: '2023-05-15T10:15:30Z',
    last_modified: '2023-05-16T11:22:15Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_A002'
  },
  {
    image_id: 103,
    file_name: 'sample_image_03.jpg',
    capture_date: '2023-05-16T09:45:30Z',
    last_modified: '2023-05-17T15:22:15Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_B001'
  },
  {
    image_id: 104,
    file_name: 'sample_image_04.jpg',
    capture_date: '2023-05-16T11:30:30Z',
    last_modified: '2023-05-17T16:42:15Z',
    width: 1920,
    height: 1080,
    status: 'completed',
    camera_id: 'CAM_B002'
  },
  {
    image_id: 105,
    file_name: 'sample_image_05.jpg',
    capture_date: '2023-05-17T08:15:30Z',
    last_modified: '2023-05-18T10:12:15Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_C001'
  },
  {
    image_id: 106,
    file_name: 'sample_image_06.jpg',
    capture_date: '2023-05-17T12:25:30Z',
    last_modified: '2023-05-18T14:32:15Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_C002'
  },
  // 추가 카메라 ID와 이미지 데이터
  {
    image_id: 107,
    file_name: 'sample_image_07.jpg',
    capture_date: '2023-05-18T09:15:30Z',
    last_modified: '2023-05-19T10:22:15Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_D001'
  },
  {
    image_id: 108,
    file_name: 'sample_image_08.jpg',
    capture_date: '2023-05-18T10:30:20Z',
    last_modified: '2023-05-19T11:45:10Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_D001'
  },
  {
    image_id: 109,
    file_name: 'sample_image_09.jpg',
    capture_date: '2023-05-18T11:05:45Z',
    last_modified: '2023-05-19T13:20:30Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_D002'
  },
  {
    image_id: 110,
    file_name: 'sample_image_10.jpg',
    capture_date: '2023-05-19T08:40:15Z',
    last_modified: '2023-05-20T09:15:40Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_D002'
  },
  {
    image_id: 111,
    file_name: 'sample_image_11.jpg',
    capture_date: '2023-05-19T09:30:20Z',
    last_modified: '2023-05-20T10:40:35Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_E001'
  },
  {
    image_id: 112,
    file_name: 'sample_image_12.jpg',
    capture_date: '2023-05-19T10:50:40Z',
    last_modified: '2023-05-20T12:15:25Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_E001'
  },
  {
    image_id: 113,
    file_name: 'sample_image_13.jpg',
    capture_date: '2023-05-19T13:25:10Z',
    last_modified: '2023-05-20T15:05:50Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_E002'
  },
  {
    image_id: 114,
    file_name: 'sample_image_14.jpg',
    capture_date: '2023-05-20T08:15:30Z',
    last_modified: '2023-05-21T09:45:15Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_E002'
  },
  {
    image_id: 115,
    file_name: 'sample_image_15.jpg',
    capture_date: '2023-05-20T09:40:20Z',
    last_modified: '2023-05-21T10:55:40Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_F001'
  },
  {
    image_id: 116,
    file_name: 'sample_image_16.jpg',
    capture_date: '2023-05-20T11:20:15Z',
    last_modified: '2023-05-21T13:10:25Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_F001'
  },
  {
    image_id: 117,
    file_name: 'sample_image_17.jpg',
    capture_date: '2023-05-20T14:35:30Z',
    last_modified: '2023-05-21T16:25:45Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_F001'
  },
  {
    image_id: 118,
    file_name: 'sample_image_18.jpg',
    capture_date: '2023-05-21T08:50:15Z',
    last_modified: '2023-05-22T10:05:30Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_F002'
  },
  {
    image_id: 119,
    file_name: 'sample_image_19.jpg',
    capture_date: '2023-05-21T10:25:40Z',
    last_modified: '2023-05-22T12:15:05Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_F002'
  },
  {
    image_id: 120,
    file_name: 'sample_image_20.jpg',
    capture_date: '2023-05-21T13:10:20Z',
    last_modified: '2023-05-22T14:45:35Z',
    width: 1920,
    height: 1080,
    status: 'pending',
    camera_id: 'CAM_F002'
  }
];

// 더미 데이터 - 실제 API 연동 전까지 사용 (class_id가 이제 숫자 ID로 변경됨)
const DUMMY_ANNOTATIONS = [
  // 이미지 101의 결함들 (여러 개의 결함)
  { 
    annotation_id: 1,
    image_id: 101,
    date: '2023-05-15T09:30:00Z',
    conf_score: 0.89,
    bounding_box: JSON.stringify({ x: 523.86, y: 328.36, width: 193.79, height: 212.49 }),
    user_id: 1001,
    status: 'completed',
    class_id: 1  // Scratch
  },
  { 
    annotation_id: 2,
    image_id: 101,
    date: '2023-05-15T09:31:20Z', 
    conf_score: 0.92,
    bounding_box: JSON.stringify({ x: 867.10, y: 472.65, width: 160.86, height: 207.25 }),
    user_id: 1001,
    status: 'completed',
    class_id: 1  // Scratch
  },
  { 
    annotation_id: 3,
    image_id: 101,
    date: '2023-05-15T09:32:05Z',
    conf_score: 0.78,
    bounding_box: JSON.stringify({ x: 606.18, y: 626.12, width: 165.92, height: 106.25 }),
    user_id: 1001,
    status: 'completed',
    class_id: 2  // Dent
  },
  { 
    annotation_id: 4,
    image_id: 101,
    date: '2023-05-15T09:33:30Z',
    conf_score: 0.85,
    bounding_box: JSON.stringify({ x: 806.30, y: 275.90, width: 73.46, height: 127.23 }),
    user_id: 1001,
    status: 'completed',
    class_id: 2  // Dent
  },
  {
    annotation_id: 5,
    image_id: 101,
    date: '2023-05-15T09:35:10Z',
    conf_score: 0.93,
    bounding_box: JSON.stringify({ x: 350.20, y: 420.15, width: 120.30, height: 180.50 }),
    user_id: 1002,
    status: 'completed',
    class_id: 3  // Discoloration
  },
  {
    annotation_id: 6,
    image_id: 101,
    date: '2023-05-15T09:36:45Z',
    conf_score: 0.75,
    bounding_box: JSON.stringify({ x: 720.40, y: 180.30, width: 90.25, height: 150.75 }),
    user_id: 1002,
    status: 'pending',
    class_id: 4  // Contamination
  },
  
  // 이미지 103의 결함들 (1개만 있음)
  {
    annotation_id: 1,
    image_id: 103,
    date: '2023-05-16T10:15:30Z',
    conf_score: 0.67,
    bounding_box: JSON.stringify({ x: 450.20, y: 380.40, width: 135.60, height: 95.80 }),
    user_id: 1001,
    status: 'pending',
    class_id: 1  // Scratch
  },
  
  // 이미지 104의 결함들 (3개의 결함)
  {
    annotation_id: 1,
    image_id: 104,
    date: '2023-05-16T12:10:20Z',
    conf_score: 0.88,
    bounding_box: JSON.stringify({ x: 320.50, y: 410.30, width: 110.40, height: 130.70 }),
    user_id: 1002,
    status: 'completed',
    class_id: 2  // Dent
  },
  {
    annotation_id: 2,
    image_id: 104,
    date: '2023-05-16T12:12:40Z',
    conf_score: 0.76,
    bounding_box: JSON.stringify({ x: 580.60, y: 280.30, width: 85.40, height: 120.20 }),
    user_id: 1002,
    status: 'completed',
    class_id: 3  // Discoloration
  },
  {
    annotation_id: 3,
    image_id: 104,
    date: '2023-05-16T12:15:10Z',
    conf_score: 0.95,
    bounding_box: JSON.stringify({ x: 750.30, y: 520.60, width: 180.20, height: 140.90 }),
    user_id: 1002,
    status: 'completed',
    class_id: 1  // Scratch
  },
  
  // 이미지 106의 결함들 (2개의 결함)
  {
    annotation_id: 1,
    image_id: 106,
    date: '2023-05-17T13:05:45Z',
    conf_score: 0.81,
    bounding_box: JSON.stringify({ x: 420.70, y: 350.90, width: 130.60, height: 90.40 }),
    user_id: 1001,
    status: 'pending',
    class_id: 4  // Contamination
  },
  {
    annotation_id: 2,
    image_id: 106,
    date: '2023-05-17T13:08:30Z',
    conf_score: 0.72,
    bounding_box: JSON.stringify({ x: 620.10, y: 480.50, width: 95.30, height: 110.80 }),
    user_id: 1001,
    status: 'pending',
    class_id: 2  // Dent
  }
  
  // 이미지 102와 105에는 결함이 없음 (Confidence Score가 '-'로 표시될 것임)
];

class AnnotationService {
  // DefectClasses 목록 가져오기
  async getDefectClasses() {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.get(`${API_URL}/defect-classes`);
      // return response.data;
      
      // 더미 데이터 사용
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(DUMMY_DEFECT_CLASSES);
        }, 200);
      });
    } catch (error) {
      console.error('Failed to fetch defect classes:', error);
      throw error;
    }
  }

  // 이미지 ID에 해당하는 어노테이션 목록 가져오기
  async getAnnotationsByImageId(imageId) {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.get(`${API_URL}/annotations?imageId=${imageId}`);
      // return response.data;
      
      // 더미 데이터 사용 (API 연동 전까지)
      // 비동기 처리를 시뮬레이션하기 위해 Promise 사용
      return new Promise((resolve) => {
        setTimeout(() => {
          const annotations = DUMMY_ANNOTATIONS.filter(anno => anno.image_id === imageId);
          resolve(annotations);
        }, 300); // 300ms 지연
      });
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
      throw error;
    }
  }

  // 대시보드용 모든 어노테이션 요약 정보 가져오기
  async getAllAnnotationSummaries() {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.get(`${API_URL}/annotations/summaries`);
      // return response.data;
      
      // 더미 데이터를 사용하여 대시보드 표시 데이터 생성
      return new Promise((resolve) => {
        setTimeout(() => {
          const summaries = DUMMY_IMAGES.map(image => {
            // 이미지에 연결된 어노테이션 수 계산
            const imageAnnotations = DUMMY_ANNOTATIONS.filter(anno => anno.image_id === image.image_id);
            
            // 해당 이미지의 최소 신뢰도 점수 찾기
            let minConfScore = null;
            if (imageAnnotations.length > 0) {
              // null이 아닌 신뢰도 점수만 필터링
              const confScores = imageAnnotations
                .map(anno => anno.conf_score)
                .filter(score => score !== null);
              
              if (confScores.length > 0) {
                minConfScore = Math.min(...confScores);
              }
            }
            
            // 이미지에 포함된 defect 유형들 수집
            const defectTypes = imageAnnotations.map(anno => {
              const defectClass = DUMMY_DEFECT_CLASSES.find(dc => dc.class_id === anno.class_id);
              return defectClass ? defectClass.class_name.toLowerCase() : null;
            }).filter(Boolean);
            
            return {
              id: `IMG_${image.image_id.toString().padStart(3, '0')}`, // IMG_001 형식으로 포맷팅
              cameraId: image.camera_id,
              confidenceScore: minConfScore,
              defectCount: imageAnnotations.length > 0 ? imageAnnotations.length : 0,
              status: image.status,
              defectTypes: [...new Set(defectTypes)] // 중복 제거
            };
          });
          
          resolve(summaries);
        }, 300);
      });
    } catch (error) {
      console.error('Failed to fetch annotation summaries:', error);
      throw error;
    }
  }

  // 어노테이션 상세 정보 가져오기
  async getAnnotationDetail(annotationId) {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.get(`${API_URL}/annotations/${annotationId}`);
      // return response.data;
      
      // 더미 데이터 사용
      return new Promise((resolve) => {
        setTimeout(() => {
          const annotation = DUMMY_ANNOTATIONS.find(anno => anno.annotation_id === annotationId);
          resolve(annotation || null);
        }, 200);
      });
    } catch (error) {
      console.error(`Failed to fetch annotation detail for ID ${annotationId}:`, error);
      throw error;
    }
  }

  // 어노테이션 생성하기
  async createAnnotation(annotationData) {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.post(`${API_URL}/annotations`, annotationData);
      // return response.data;
      
      // 더미 구현
      return new Promise((resolve) => {
        setTimeout(() => {
          // 새 어노테이션 ID 생성 (실제로는 서버에서 처리)
          const newId = Math.max(...DUMMY_ANNOTATIONS.map(a => a.annotation_id)) + 1;
          const newAnnotation = {
            annotation_id: newId,
            ...annotationData,
            date: new Date().toISOString() // 현재 시간
          };
          
          // 로컬 더미 데이터에 추가 (실제로는 서버 DB에 저장)
          DUMMY_ANNOTATIONS.push(newAnnotation);
          
          resolve(newAnnotation);
        }, 300);
      });
    } catch (error) {
      console.error('Failed to create annotation:', error);
      throw error;
    }
  }

  // 어노테이션 업데이트
  async updateAnnotation(annotationId, updatedData) {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.put(`${API_URL}/annotations/${annotationId}`, updatedData);
      // return response.data;
      
      // 더미 구현
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = DUMMY_ANNOTATIONS.findIndex(a => a.annotation_id === annotationId);
          if (index !== -1) {
            DUMMY_ANNOTATIONS[index] = {
              ...DUMMY_ANNOTATIONS[index],
              ...updatedData
            };
            resolve(DUMMY_ANNOTATIONS[index]);
          } else {
            resolve(null);
          }
        }, 300);
      });
    } catch (error) {
      console.error(`Failed to update annotation ${annotationId}:`, error);
      throw error;
    }
  }

  // 어노테이션 삭제
  async deleteAnnotation(annotationId) {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // await axios.delete(`${API_URL}/annotations/${annotationId}`);
      // return true;
      
      // 더미 구현
      return new Promise((resolve) => {
        setTimeout(() => {
          const initialLength = DUMMY_ANNOTATIONS.length;
          const filtered = DUMMY_ANNOTATIONS.filter(a => a.annotation_id !== annotationId);
          DUMMY_ANNOTATIONS.length = 0;
          DUMMY_ANNOTATIONS.push(...filtered);
          
          resolve(initialLength !== DUMMY_ANNOTATIONS.length);
        }, 300);
      });
    } catch (error) {
      console.error(`Failed to delete annotation ${annotationId}:`, error);
      throw error;
    }
  }

  // 프론트엔드 모델에 맞게 어노테이션 데이터 변환 (defectClasses 정보 활용)
  transformToFrontendModel(annotationData, defectClasses) {
    // defectClasses에서 해당 class_id의 defect 정보 찾기
    const defectClass = defectClasses.find(dc => dc.class_id === annotationData.class_id) || {};
    
    return {
      id: String(annotationData.annotation_id),
      type: defectClass.class_name || 'Scratch', // 기본값으로 Scratch 사용
      typeId: annotationData.class_id || 1,
      confidence: annotationData.conf_score, // null 값 유지
      coordinates: JSON.parse(annotationData.bounding_box),
      color: defectClass.class_color,
      date: annotationData.date,
      status: annotationData.status || 'pending',
      userId: annotationData.user_id
    };
  }

  // 백엔드 모델에 맞게 어노테이션 데이터 변환
  transformToBackendModel(frontendData) {
    return {
      annotation_id: parseInt(frontendData.id) || null,
      image_id: frontendData.imageId,
      conf_score: frontendData.confidence,
      bounding_box: JSON.stringify(frontendData.coordinates),
      class_id: frontendData.typeId, // class_id를 정수로 사용
      status: frontendData.status || 'pending',
      user_id: frontendData.userId || null
    };
  }

  // 이미지 상세 정보 가져오기
  async getImageDetailById(imageId) {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.get(`${API_URL}/images/${imageId}`);
      // return response.data;
      
      // 더미 데이터 사용
      return new Promise((resolve) => {
        setTimeout(() => {
          const image = DUMMY_IMAGES.find(img => img.image_id === imageId);
          if (image) {
            resolve({
              ...image,
              capture_date_formatted: formatDateTime(image.capture_date),
              last_modified_formatted: formatDateTime(image.last_modified)
            });
          } else {
            resolve(null);
          }
        }, 200);
      });
    } catch (error) {
      console.error(`Failed to fetch image detail for ID ${imageId}:`, error);
      throw error;
    }
  }

  // 다음에 사용할 빈 어노테이션 데이터 생성 (새로운 바운딩 박스용)
  createEmptyAnnotation(imageId, initialCoordinates, classId = 1) {
    return {
      annotation_id: null, // 새로 생성될 어노테이션이므로 ID 없음
      image_id: imageId,
      date: new Date().toISOString(),
      conf_score: null, // 사용자가 생성한 바운딩 박스의 confidence 값은 null
      bounding_box: JSON.stringify(initialCoordinates),
      user_id: 1001, // 현재 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
      status: 'pending',
      class_id: classId // 결함 타입 ID (1: Scratch가 기본값)
    };
  }

  // 이미지 상태 업데이트 (pending/completed)
  async updateImageStatus(imageId, newStatus) {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.put(`${API_URL}/images/${imageId}/status`, { status: newStatus });
      // return response.data;
      
      // 더미 구현
      return new Promise((resolve) => {
        setTimeout(() => {
          const imageIndex = DUMMY_IMAGES.findIndex(img => img.image_id === imageId);
          if (imageIndex !== -1) {
            // 이미지 상태 업데이트
            DUMMY_IMAGES[imageIndex].status = newStatus;
            // 이미지에 연결된 모든 어노테이션 상태도 업데이트
            DUMMY_ANNOTATIONS.forEach(annotation => {
              if (annotation.image_id === imageId) {
                annotation.status = newStatus;
              }
            });
            resolve({
              success: true,
              message: `Status updated to ${newStatus} for image ID: ${imageId}`
            });
          } else {
            resolve({
              success: false,
              message: `Image with ID: ${imageId} not found`
            });
          }
        }, 300);
      });
    } catch (error) {
      console.error(`Failed to update status for image ${imageId}:`, error);
      throw error;
    }
  }

  /**
   * 모든 이미지 가져오기
   * @returns {Promise<Array>} 이미지 목록
   */
  async getAllImages() {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.get(`${API_URL}/images`);
      // return response.data;
      
      console.log('AnnotationService.getAllImages called, dummy data length:', DUMMY_IMAGES.length);
      
      // 더미 데이터 사용 - 비동기 시뮬레이션을 위해 Promise 추가
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Returning dummy images data');
          resolve([...DUMMY_IMAGES]); // 배열 복사본 반환
        }, 500);
      });
    } catch (error) {
      console.error('Error fetching images:', error);
      // 명확한 오류 메시지 제공
      throw new Error(`이미지 데이터를 가져오는데 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  }

  /**
   * 어노테이터별로 카메라 할당 (어노테이터 ID를 키로, 카메라 ID 배열을 값으로 하는 방식)
   * @param {Object} assignments - 할당 정보 객체 (카메라 및 이미지 할당 포함)
   * @returns {Promise<Object>} 할당 결과
   */
  async assignTasksByUserId(assignments) {
    try {
      // 실제 API 요청 코드 (현재는 주석 처리)
      // const response = await axios.post(`${API_URL}/tasks/assign-by-user`, assignments);
      // return response.data;
      
      console.log('AnnotationService.assignTasksByUserId called with:', assignments);
      
      // 로컬 스토리지에 저장
      localStorage.setItem('taskAssignments', JSON.stringify(assignments));
      
      // 비동기 처리 시뮬레이션
      return new Promise((resolve) => {
        setTimeout(() => {
          // 로컬 상태 업데이트 (실제 구현에서는 서버 DB에 저장됨)
          const assignedImages = {};
          const assignmentsByCameraId = {}; // 기존 형식의 assignments 객체도 생성
          
          // 어노테이터별 할당된 이미지 수 초기화
          Object.keys(assignments.cameraAssignments || {}).forEach(annotatorId => {
            assignedImages[annotatorId] = 0;
          });
          
          // 이미지 할당 기준으로 정확한 카운트 계산
          if (assignments.imageAssignments) {
            Object.entries(assignments.imageAssignments).forEach(([imageId, annotatorId]) => {
              if (annotatorId !== null) {
                assignedImages[annotatorId] = (assignedImages[annotatorId] || 0) + 1;
                
                // 해당 이미지의 카메라 ID 찾기
                const image = DUMMY_IMAGES.find(img => img.image_id === parseInt(imageId));
                if (image) {
                  assignmentsByCameraId[image.camera_id] = parseInt(annotatorId);
                }
              }
            });
          }
          
          console.log('Assignment successful, images per annotator:', assignedImages);
          
          resolve({
            success: true,
            assignments: assignments,
            assignmentsByCameraId: assignmentsByCameraId,
            assignedImages: assignedImages,
            message: '작업이 성공적으로 할당되었습니다.'
          });
        }, 800);
      });
    } catch (error) {
      console.error('Error assigning tasks by user:', error);
      throw new Error(`작업 할당 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  }
  
  /**
   * 저장된 작업 할당 불러오기
   * @returns {Promise<Object>} 저장된 할당 정보
   */
  async getSavedAssignments() {
    try {
      // 로컬 스토리지에서 할당 정보 불러오기
      const savedAssignments = localStorage.getItem('taskAssignments');
      
      return new Promise((resolve) => {
        setTimeout(() => {
          if (savedAssignments) {
            resolve({
              success: true,
              assignments: JSON.parse(savedAssignments)
            });
          } else {
            resolve({
              success: false,
              assignments: null,
              message: '저장된 할당 정보가 없습니다.'
            });
          }
        }, 300);
      });
    } catch (error) {
      console.error('Error loading saved assignments:', error);
      throw new Error(`저장된 할당 정보를 불러오는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  }
}

export default new AnnotationService(); 