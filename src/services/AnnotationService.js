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
    status: 'completed'
  },
  {
    image_id: 102,
    file_name: 'sample_image_02.jpg',
    capture_date: '2023-05-15T10:15:30Z',
    last_modified: '2023-05-16T11:22:15Z',
    width: 1920,
    height: 1080,
    status: 'pending'
  }
];

// 더미 데이터 - 실제 API 연동 전까지 사용 (class_id가 이제 숫자 ID로 변경됨)
const DUMMY_ANNOTATIONS = [
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
  }
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
}

export default new AnnotationService(); 