// annotation 관련 API 서비스
import axios from 'axios';
import { formatDateTime } from '../utils/annotationUtils';

// 기본 API URL을 실제 서버 URL로 변경
const API_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';

// 더미 데이터: DefectClasses 테이블 (DB 스키마와 일치)
const DUMMY_DEFECT_CLASSES = [
  {
    class_id: 1,
    class_name: "Scratch",
    class_color: "#dbe4ff",
    created_at: "2025-04-12T20:23:45",
    updated_at: "2025-04-12T20:23:45"
  },
  {
    class_id: 2,
    class_name: "Dent",
    class_color: "#ffd6d6",
    created_at: "2025-04-12T20:23:45",
    updated_at: "2025-04-12T20:23:45"
  },
  {
    class_id: 3,
    class_name: "Crack",
    class_color: "#fff3cd",
    created_at: "2025-04-12T20:23:45",
    updated_at: "2025-04-12T20:23:45"
  },
  {
    class_id: 4,
    class_name: "Particle",
    class_color: "#b2f2bb",
    created_at: "2025-04-12T20:23:45",
    updated_at: "2025-04-12T20:23:45"
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
      // API 요청 URL 로깅
      const requestUrl = `${API_URL}/defect-classes`;
      console.log('getDefectClasses API 요청 URL:', requestUrl);
      
      // 설정 옵션
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      };
      
      let response;
      try {
        // 실제 API 요청 코드
        response = await axios.get(requestUrl, config);
        console.log('getDefectClasses API 응답:', response.status);
        console.log('getDefectClasses 데이터:', response.data);
        return response.data;
      } catch (directError) {
        console.log('getDefectClasses API 호출 실패, 더미 데이터 사용:', directError.message);
        
        // 더미 데이터 사용 (API 연동 전까지)
        return DUMMY_DEFECT_CLASSES;
      }
    } catch (error) {
      console.error('Failed to fetch defect classes:', error);
      // 오류 발생 시에도 더미 데이터 반환
      return DUMMY_DEFECT_CLASSES;
    }
  }

  /**
   * 여러 이미지의 어노테이션 상세 정보 가져오기
   * @param {Array<number>} imageIds - 상세 정보를 가져올 이미지 ID 배열
   * @returns {Promise<Array>} 이미지 상세 정보 배열
   */
  async getMultipleAnnotationDetails(imageIds) {
    try {
      // API 요청 URL - POST /annotations/details
      const requestUrl = `${API_URL}/annotations/details`;
      console.log('여러 이미지 상세 정보 요청 URL:', requestUrl);
      console.log('요청할 이미지 ID 목록:', imageIds);

      // 설정 옵션
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      };
      
      // API 문서에 따라 이미지 ID 배열을 직접 요청 본문으로 전송
      try {
        const response = await axios.post(requestUrl, imageIds, config);
        console.log('API 응답 코드:', response.status);
        
        // API 응답 형식: { "details": [ {...}, {...} ] }
        if (response.data && response.data.details) {
          console.log('조회된 이미지 수:', response.data.details.length);
          return response.data.details;
        } else {
          console.warn('API 응답에 details 필드가 없음:', response.data);
          return [];
        }
      } catch (error) {
        console.error('API 호출 실패:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('여러 이미지 상세 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 이미지의 어노테이션 상세 정보 가져오기
   * @param {number} imageId - 이미지 ID
   * @returns {Promise<Object>} 이미지 상세 정보
   */
  async getAnnotationsByImageId(imageId) {
    try {
      // API 요청 URL - GET /annotations/detail/{image_id}
      const requestUrl = `${API_URL}/annotations/detail/${imageId}`;
      console.log('이미지 상세 정보 요청 URL:', requestUrl);

      // 설정 옵션
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      };
      
      try {
        // API 요청
        const response = await axios.get(requestUrl, config);
        console.log('API 응답 코드:', response.status);
        
        // 응답 데이터 캐싱 및 반환
        const imageDetail = response.data;
        
        // 이미지 정보 캐싱 (다른 함수에서 사용)
        this.cachedImageDetail = {
          image_id: imageDetail.image_id,
          file_path: imageDetail.file_path,
          date: imageDetail.date,
          camera_id: imageDetail.camera_id,
          dataset_id: imageDetail.dataset_id,
          width: imageDetail.width || 640,
          height: imageDetail.height || 640,
          status: imageDetail.status || 'pending',
          capture_date_formatted: formatDateTime(imageDetail.date),
          last_modified_formatted: formatDateTime(imageDetail.date)
        };
        
        // defects를 개별 어노테이션으로 변환하여 반환
        return imageDetail.defects || [];
      } catch (error) {
        console.error('API 호출 실패:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('이미지 상세 정보 조회 실패:', error);
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
    // API에서 class_name과 class_color가 이미 포함되어 있는 경우 사용
    let defectType = annotationData.class_name;
    let defectColor = annotationData.class_color;
    
    // API에서 제공하지 않는 경우 defectClasses에서 조회
    if (!defectType || !defectColor) {
    const defectClass = defectClasses.find(dc => dc.class_id === annotationData.class_id) || {};
      defectType = defectClass.class_name || 'Scratch'; // 기본값으로 Scratch 사용
      defectColor = defectClass.class_color;
    }
    
    return {
      id: String(annotationData.annotation_id),
      type: defectType,
      typeId: annotationData.class_id || 1,
      confidence: annotationData.conf_score, // null 값 유지
      coordinates: typeof annotationData.bounding_box === 'string' 
        ? JSON.parse(annotationData.bounding_box) 
        : annotationData.bounding_box,
      color: defectColor,
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
      // 캐시된 이미지 정보가 있으면 사용
      if (this.cachedImageDetail && this.cachedImageDetail.image_id === imageId) {
        console.log('Using cached image detail for imageId:', imageId);
        const imageDetail = this.cachedImageDetail;
        return {
          ...imageDetail,
          width: imageDetail.width || 4032, // 실제 이미지 크기 사용
          height: imageDetail.height || 3024, // 실제 이미지 크기 사용
          capture_date_formatted: formatDateTime(imageDetail.capture_date),
          last_modified_formatted: formatDateTime(imageDetail.last_modified)
        };
      }
      
      // 캐시된 정보가 없는 경우, getAnnotationsByImageId를 사용해 정보 가져오기
      // 상세 페이지에서는 getAnnotationsByImageId가 먼저 호출되어 이미지 정보가 캐시됨
      try {
        // getAnnotationsByImageId를 사용하여 이미지 정보와 어노테이션 목록을 동시에 가져옴
        await this.getAnnotationsByImageId(imageId);
      
        // 이제 캐시된 이미지 정보가 있어야 함
        if (this.cachedImageDetail) {
          const imageDetail = this.cachedImageDetail;
          return {
            ...imageDetail,
            width: imageDetail.width || 4032, // 실제 이미지 크기 사용
            height: imageDetail.height || 3024, // 실제 이미지 크기 사용
            capture_date_formatted: formatDateTime(imageDetail.capture_date),
            last_modified_formatted: formatDateTime(imageDetail.last_modified)
          };
        }
      } catch (apiError) {
        console.log('getAnnotationsByImageId API 호출 실패:', apiError.message);
        // API 호출 실패 시 더미 데이터 사용
      }
      
      // API 호출이 모두 실패한 경우 더미 데이터 사용
          const image = DUMMY_IMAGES.find(img => img.image_id === imageId);
          if (image) {
        return {
              ...image,
          width: image.width || 4032, // 실제 이미지 크기 사용
          height: image.height || 3024, // 실제 이미지 크기 사용
              capture_date_formatted: formatDateTime(image.capture_date),
              last_modified_formatted: formatDateTime(image.last_modified)
        };
          }
      return null;
    } catch (error) {
      console.error(`Failed to fetch image detail for ID ${imageId}:`, error);
      // 더미 데이터 반환
      const image = DUMMY_IMAGES.find(img => img.image_id === imageId);
      if (image) {
        return {
          ...image,
          width: image.width || 4032, // 실제 이미지 크기 사용
          height: image.height || 3024, // 실제 이미지 크기 사용
          capture_date_formatted: formatDateTime(image.capture_date),
          last_modified_formatted: formatDateTime(image.last_modified)
        };
      }
      return null;
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
      user_id: 2, // 어노테이터 ID (사용자 ID 2)
      status: 'pending',
      class_id: classId // 결함 타입 ID (1: Scratch가 기본값)
    };
  }

  /**
   * 이미지 상태 업데이트 (pending/completed)
   * @param {number} imageId - 상태를 업데이트할 이미지 ID
   * @param {string} newStatus - 새로운 상태 값 (pending, completed 등)
   * @returns {Promise<Object>} 업데이트 결과 객체
   */
  async updateImageStatus(imageId, newStatus) {
    try {
      // API 요청 URL 로깅
      const requestUrl = `${API_URL}/annotations/image/status`;
      console.log('updateImageStatus API 요청 URL:', requestUrl);
      
      // 요청 데이터
      const requestData = {
        image_id: imageId,
        status: newStatus
      };
      
      console.log('updateImageStatus 요청 데이터:', requestData);
      
      // 설정 옵션
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      };
      
      try {
        // 실제 API 요청 코드 (PATCH 메서드 사용)
        const response = await axios.patch(requestUrl, requestData, config);
        console.log('updateImageStatus API 응답:', response.status);
        console.log('updateImageStatus 응답 데이터:', response.data);
        
        // 캐시 무효화
        if (this.cachedImageDetail && this.cachedImageDetail.image_id === imageId) {
          this.cachedImageDetail.status = newStatus;
              }
        
        return response.data;
      } catch (directError) {
        console.log('updateImageStatus API 호출 실패, 더미 응답 반환:', directError.message);
        
        // 더미 응답
        return {
              success: true,
          message: `Status updated to ${newStatus} for image ID: ${imageId}`,
          image_id: imageId,
          new_status: newStatus
        };
          }
    } catch (error) {
      console.error(`Failed to update status for image ${imageId}:`, error);
      throw error;
    }
  }

  /**
   * 이미지 삭제
   * @param {Array<number>} imageIds - 삭제할 이미지 ID 배열
   * @returns {Promise<Object>} 삭제 결과 객체
   */
  async deleteImages(imageIds) {
    try {
      // API 요청 URL 로깅
      const requestUrl = `${API_URL}/annotations/images`;
      console.log('deleteImages API 요청 URL:', requestUrl);
      
      // 요청 데이터
      const requestData = {
        image_ids: imageIds
      };
      
      console.log('deleteImages 요청 데이터:', requestData);
      
      // 설정 옵션
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      };
      
      try {
        // 실제 API 요청 코드 (DELETE 메서드 사용)
        const response = await axios.delete(requestUrl, { data: requestData, ...config });
        console.log('deleteImages API 응답:', response.status);
        console.log('deleteImages 응답 데이터:', response.data);
        
        // 캐시 무효화
        if (this.cachedImageDetail && imageIds.includes(this.cachedImageDetail.image_id)) {
          this.cachedImageDetail = null;
        }
        
        return response.data;
      } catch (directError) {
        console.log('deleteImages API 호출 실패, 더미 응답 반환:', directError.message);
        
        // 더미 응답
        return {
          success: true,
          message: `Deleted ${imageIds.length} images`,
          deleted_ids: imageIds
        };
      }
    } catch (error) {
      console.error(`Failed to delete images:`, error);
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
   * Get task assignment stats for admin dashboard
   * @returns {Promise<Object>} Task assignment stats
   */
  async getAdminTaskAssignmentStats() {
    try {
      console.log('Fetching admin task assignment stats');
      const response = await axios.get(`${API_URL}/admin/main`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin task assignment stats:', error);
      throw new Error(`Failed to load task assignment stats: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get camera stats for a specific user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User camera stats
   */
  async getUserCameraStats(userId) {
    try {
      console.log('Fetching user camera stats for user:', userId);
      const response = await axios.get(`${API_URL}/admin/main/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user camera stats:', error);
      throw new Error(`Failed to load user camera stats: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Assign cameras to a user
   * @param {Object} assignments - Assignment data with user_id and camera_ids
   * @returns {Promise<Object>} Assignment result
   */
  async assignTasksByUserId(assignments) {
    try {
      console.log('Assigning cameras to user:', assignments);
      const response = await axios.post(`${API_URL}/admin/main/assign`, assignments);
      return response.data;
    } catch (error) {
      console.error('Error assigning tasks by user:', error);
      throw new Error(`Failed to assign tasks: ${error.message || 'Unknown error'}`);
    }
  }
  
  /**
   * For backwards compatibility - get saved assignments from the new API
   * @returns {Promise<Object>} Saved assignment information
   */
  async getSavedAssignments() {
    try {
      console.log('Getting saved assignments through the new API');
      // Use the new API to get all assignment data
      const taskStats = await this.getAdminTaskAssignmentStats();
      
      // Convert to the old format for backward compatibility
      const cameraAssignments = {};
      
      // Initialize empty assignments for each annotator
      taskStats.annotators.forEach(annotator => {
        cameraAssignments[annotator.user_id] = [];
      });
      
      // For each annotator, fetch their assigned cameras
      for (const annotator of taskStats.annotators) {
        if (annotator.assigned_cameras_count > 0) {
          try {
            const userCameraStats = await this.getUserCameraStats(annotator.user_id);
            cameraAssignments[annotator.user_id] = userCameraStats.cameras.map(camera => camera.camera_id);
          } catch (e) {
            console.error(`Error fetching cameras for user ${annotator.user_id}:`, e);
          }
        }
      }
      
      return {
        success: true,
        assignments: {
          cameraAssignments: cameraAssignments
        }
      };
    } catch (error) {
      console.error('Error loading saved assignments:', error);
      return {
        success: false,
        assignments: null,
        message: 'Failed to load saved assignments'
      };
    }
  }

  /**
   * 어노테이터 대시보드 메인 화면 정보 조회
   * 로그인된 사용자에게 할당된 카메라에 해당하는 모든 이미지 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 대시보드 정보
   */
  async getAnnotatorDashboard(userId) {
    try {
      // API 요청 URL 로깅
      const requestUrl = `${API_URL}/annotations/main/${userId}`;
      console.log('API 요청 URL:', requestUrl);
      
      // 실제 API 요청 전 로깅
      console.log('사용자 ID로 대시보드 데이터 요청 중:', userId);
      
      // CORS 및 추가 헤더 옵션 설정
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // 인증이 필요한 경우 아래 주석 해제
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        // API 호출 시간이 오래 걸릴 수 있으므로 타임아웃 증가
        timeout: 10000
      };
      
      // 백엔드 서버에 직접 API 요청을 시도하지만 CORS 문제가 있을 수 있음
      // 실제 API 요청 코드 사용
      console.log('API 요청 시작...');
      let response;
      
      try {
        // 직접 호출 시도
        response = await axios.get(requestUrl, config);
        console.log('API 응답 받음:', response.status);
        console.log('API 응답 데이터:', response.data);
        
        // API 소스 표시 추가
        console.log('🟢 실제 API 데이터를 사용합니다.');
        return {
          ...response.data,
          _data_source: 'api' // 디버깅용 소스 표시 (UI에서는 보이지 않음)
        };
      } catch (directError) {
        console.log('직접 호출 실패, 더미 데이터 사용:', directError.message);
        
        // 더미 데이터로 폴백 (임시 방편)
        // 실제 환경에서는 이 부분을 제거하고 적절한 오류 처리를 해야 함
        console.log('🔴 더미 데이터를 사용합니다.');
        return {
          profile_image: null,
          total_images: 4,
          pending_images: 3,
          completed_images: 1,
          _data_source: 'dummy', // 디버깅용 소스 표시 (UI에서는 보이지 않음)
          image_list: [
            {
              camera_id: 1,
              image_id: 1,
              file_path: "images/img_001.jpg",
              confidence: 0.5,
              count: 2,
              status: "completed",
              bounding_boxes: [
                {
                  h: 60,
                  w: 50,
                  cx: 100,
                  cy: 150
                },
                {
                  h: 105,
                  w: 95,
                  cx: 200,
                  cy: 240
                }
              ]
            },
            {
              camera_id: 1,
              image_id: 2,
              file_path: "images/img_002.jpg",
              confidence: 0.9,
              count: 1,
              status: "pending",
              bounding_boxes: [
                {
                  h: 65,
                  w: 55,
                  cx: 120,
                  cy: 160
                }
              ]
            },
            {
              camera_id: 2,
              image_id: 3,
              file_path: "images/img_003.jpg",
              confidence: 0.85,
              count: 1,
              status: "pending",
              bounding_boxes: [
                {
                  h: 70,
                  w: 60,
                  cx: 130,
                  cy: 170
                }
              ]
            },
            {
              camera_id: 2,
              image_id: 4,
              file_path: "images/img_004.jpg",
              confidence: 0.8,
              count: 1,
              status: "pending",
              bounding_boxes: [
                {
                  h: 75,
                  w: 65,
                  cx: 140,
                  cy: 180
                }
              ]
            }
          ]
        };
      }
    } catch (error) {
      console.error('Error fetching annotator dashboard:', error);
      throw new Error(`어노테이터 대시보드 정보를 불러오는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  }
  
  /**
   * 어노테이터의 Task 요약 정보 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} task 요약 정보 (total_images, pending_images, completed_images)
   */
  async getTaskSummary(userId) {
    try {
      // 항상 사용자 ID 2를 사용하도록 보장
      const fixedUserId = 2;
      
      // API 요청 URL 설정
      const requestUrl = `${API_URL}/annotations/tasks/${fixedUserId}`;
      console.log('Task Summary API 요청 URL:', requestUrl);
      console.log('요청한 사용자 ID:', userId, '=> 고정된 사용자 ID:', fixedUserId);

      // CORS 및 추가 헤더 옵션 설정
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // 인증이 필요한 경우 아래 주석 해제
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 10000
      };
      
      console.log('Task Summary API 요청 시작...');
      let response;
      
      try {
        // API 직접 호출 시도
        response = await axios.get(requestUrl, config);
        console.log('Task Summary API 응답 받음:', response.status);
        console.log('Task Summary API 응답 데이터:', response.data);
        
        return response.data;
      } catch (directError) {
        console.log('Task Summary 직접 호출 실패, 더미 데이터 사용:', directError.message);
        
        // 더미 데이터로 폴백 (API 연결이 안될 경우 임시 사용)
        console.log('🔴 Task Summary 더미 데이터를 사용합니다.');
        return {
          total_images: 4,
          pending_images: 3,
          completed_images: 1
        };
        }
    } catch (error) {
      console.error('Error fetching task summary:', error);
      throw new Error(`Task 요약 정보를 불러오는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        }
  }
  
  /**
   * 필터링된 어노테이션 목록 가져오기
   * @param {number} userId - 사용자 ID
   * @param {Object} filterOptions - 필터 옵션
   * @returns {Promise<Array>} 필터링된 어노테이션 목록
   */
  async getFilteredAnnotations(userId, filterOptions = {}) {
    try {
      // 항상 사용자 ID 2를 사용하도록 고정
      const fixedUserId = 2;
          
      // API 요청 URL 설정
      const requestUrl = `${API_URL}/annotations/main/filter/${fixedUserId}`;
      console.log('필터링 API 요청 URL:', requestUrl);
      console.log('요청한 사용자 ID:', userId, '=> 고정된 사용자 ID:', fixedUserId);
      console.log('필터 옵션:', JSON.stringify(filterOptions, null, 2));
          
      // 설정 옵션
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      };
      
      console.log('필터링 API 요청 시작...');
      let response;
      
      try {
        // POST 요청으로 필터 옵션 전송
        response = await axios.post(requestUrl, filterOptions, config);
        console.log('필터링 API 응답 받음:', response.status);
        console.log('필터링 API 응답 데이터:', response.data);
        
        return response.data;
      } catch (directError) {
        console.log('필터링 API 호출 실패, 더미 데이터 사용:', directError.message);
        console.log('요청했던 필터 옵션:', JSON.stringify(filterOptions, null, 2));
        
        // 더미 데이터로 폴백 (API 연결 실패 시)
        console.log('🔴 필터링 더미 데이터를 사용합니다.');
        
        // 필터링 조건에 따라 더미 데이터 필터링
        let dummyData = [
            {
              camera_id: 1,
              image_id: 1,
              file_path: "images/img_001.jpg",
              confidence: 0.5,
              count: 2,
              status: "completed",
              width: 640,
              height: 640,
              bounding_boxes: [
                {
                  h: 60,
                  w: 50,
                  cx: 100,
                  cy: 150
                },
                {
                  h: 105,
                  w: 95,
                  cx: 200,
                  cy: 240
                }
              ]
            },
            {
              camera_id: 1,
              image_id: 2,
              file_path: "images/img_002.jpg",
              confidence: 0.9,
              count: 1,
              status: "pending",
              width: 640,
              height: 640,
              bounding_boxes: [
                {
                  h: 65,
                  w: 55,
                  cx: 120,
                  cy: 160
                }
              ]
            },
            {
              camera_id: 2,
              image_id: 3,
              file_path: "images/img_003.jpg",
              confidence: 0.85,
              count: 1,
              status: "pending",
              width: 640,
              height: 640,
              bounding_boxes: [
                {
                  h: 70,
                  w: 60,
                  cx: 130,
                  cy: 170
                }
              ]
            },
            {
              camera_id: 2,
              image_id: 4,
              file_path: "images/img_004.jpg",
              confidence: 0.8,
              count: 1,
              status: "pending",
              width: 640,
              height: 640,
              bounding_boxes: [
                {
                  h: 75,
                  w: 65,
                  cx: 140,
                  cy: 180
                }
              ]
            }
        ];
        
        // 기본적인 필터링 적용 (실제 API와 유사하게 동작하도록)
        let filteredList = [...dummyData];
        
        if (filterOptions.status) {
          filteredList = filteredList.filter(img => img.status === filterOptions.status);
        }
        
        if (filterOptions.min_confidence !== undefined) {
          filteredList = filteredList.filter(img => img.confidence >= filterOptions.min_confidence);
        }
        
        if (filterOptions.max_confidence !== undefined) {
          filteredList = filteredList.filter(img => img.confidence <= filterOptions.max_confidence);
        }
        
        // class_names 기반 필터링 (더미 데이터에서는 추가 정보 필요)
        if (filterOptions.class_names && filterOptions.class_names.length > 0) {
          // 더미 데이터에서는 간단하게 Class 이름 기반으로 필터링
          console.log('필터링할 class_names:', filterOptions.class_names);
          
          // 더미 데이터에서는 모든 이미지가 class_names 조건에 맞다고 가정
          // (실제로는 백엔드에서 필터링이 이루어짐)
        }
        
        console.log('필터링 결과:', filteredList.length, '개의 이미지');
        return filteredList;
      }
    } catch (error) {
      console.error('Error fetching filtered annotations:', error);
      throw new Error(`필터링된 어노테이션 목록을 불러오는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  }

  /**
   * 어노테이션 목록 가져오기 (테이블 표시용)
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Array>} 어노테이션 목록
   */
  async getAnnotationList(userId) {
    try {
      // 항상 사용자 ID 2를 사용하도록 고정
      const fixedUserId = 2;
      
      // API 요청 URL 설정
      const requestUrl = `${API_URL}/annotations/main/${fixedUserId}`;
      console.log('Annotation List API 요청 URL:', requestUrl);
      console.log('요청한 사용자 ID:', userId, '=> 고정된 사용자 ID:', fixedUserId);
      
      // 설정 옵션
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      };
      
      console.log('Annotation List API 요청 시작...');
      let response;
      
      try {
        // API 직접 호출 시도
        response = await axios.get(requestUrl, config);
        console.log('Annotation List API 응답 받음:', response.status);
        console.log('Annotation List API 응답 데이터:', response.data);
        
        return response.data;
      } catch (directError) {
        console.log('Annotation List 직접 호출 실패, 더미 데이터 사용:', directError.message);
        
        // 더미 데이터로 폴백 (API 연결 실패 시)
        console.log('🔴 Annotation List 더미 데이터를 사용합니다.');
        return [
          {
            camera_id: 1,
            image_id: 1,
            file_path: "images/img_001.jpg",
            confidence: 0.5,
            count: 2,
            status: "completed",
            width: 640,
            height: 640,
            bounding_boxes: [
              {
                h: 60,
                w: 50,
                cx: 100,
                cy: 150
              },
              {
                h: 105,
                w: 95,
                cx: 200,
                cy: 240
              }
            ]
          },
          {
            camera_id: 1,
            image_id: 2,
            file_path: "images/img_002.jpg",
            confidence: 0.9,
            count: 1,
            status: "pending",
            width: 640,
            height: 640,
            bounding_boxes: [
              {
                h: 65,
                w: 55,
                cx: 120,
                cy: 160
              }
            ]
          },
          {
            camera_id: 2,
            image_id: 3,
            file_path: "images/img_003.jpg",
            confidence: 0.85,
            count: 1,
            status: "pending",
            width: 640,
            height: 640,
            bounding_boxes: [
              {
                h: 70,
                w: 60,
                cx: 130,
                cy: 170
              }
            ]
          },
          {
            camera_id: 2,
            image_id: 4,
            file_path: "images/img_004.jpg",
            confidence: 0.8,
            count: 1,
            status: "pending",
            width: 640,
            height: 640,
            bounding_boxes: [
              {
                h: 75,
                w: 65,
                cx: 140,
                cy: 180
              }
            ]
          }
        ];
      }
    } catch (error) {
      console.error('Error fetching annotation list:', error);
      throw new Error(`어노테이션 목록을 불러오는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  }

  /**
   * 이미지 어노테이션 업데이트 (추가, 수정, 삭제)
   * @param {number} userId - 사용자 ID
   * @param {number} imageId - 이미지 ID
   * @param {Array} newAnnotations - 새로 추가할 어노테이션들
   * @param {Array} existingAnnotations - 기존 어노테이션 (업데이트/유지)
   * @returns {Promise<Array>} 업데이트된 어노테이션 목록
   */
  async updateImageAnnotations(userId, imageId, newAnnotations = [], existingAnnotations = []) {
    try {
      // API 요청 URL - PUT /annotations/detail/{user_id}/{image_id}
      const requestUrl = `${API_URL}/annotations/detail/${userId}/${imageId}`;
      console.log('어노테이션 업데이트 요청 URL:', requestUrl);
      
      // 요청 데이터 검증
      if (!Array.isArray(newAnnotations) || !Array.isArray(existingAnnotations)) {
        throw new Error('newAnnotations와 existingAnnotations는 배열이어야 합니다.');
      }
      
      // API 요청 데이터 준비
      const requestData = {
        annotations: newAnnotations,
        existing_annotations: existingAnnotations
      };
      
      // 요청 데이터 로깅 (디버깅용)
      console.log('API 요청 데이터:', JSON.stringify(requestData, null, 2));
      
      // 설정 옵션
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000 // 타임아웃 15초
      };
      
      // API 요청
      console.log('API 요청 시작...');
        const response = await axios.put(requestUrl, requestData, config);
      console.log('API 응답 코드:', response.status);
      console.log('API 응답 데이터:', JSON.stringify(response.data, null, 2));
        
        // 캐시 무효화
        this.cachedImageDetail = null;
        
        return response.data;
    } catch (error) {
      console.error('어노테이션 업데이트 API 호출 오류:', error.message);
        
      // 오류 세부 정보
      if (error.response) {
        console.error('API 응답 오류:', error.response.status);
        console.error('오류 응답 데이터:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('요청은 전송되었으나 응답이 없음');
      }
      
      // 디버깅을 위해 어떤 데이터를 보냈는지 로깅
      console.error('전송된 요청 데이터:', {
        userId,
        imageId,
        newAnnotationsCount: newAnnotations.length,
        existingAnnotationsCount: existingAnnotations.length
      });
      
      // 테스트용: 에러가 발생하더라도 요청 형식을 확인하기 위해 요청 데이터 출력
      console.log('요청 데이터 전체:', JSON.stringify({
        annotations: newAnnotations,
        existing_annotations: existingAnnotations
      }, null, 2));
      
      // 오류 전파
      throw error;
    }
  }

  /**
   * 어노테이션 기록 조회
   * @param {Object} filters - 필터 조건 {start_date, end_date, user_name, search}
   * @returns {Promise<Array>} 어노테이션 기록 목록
   */
  async getAnnotationHistory(filters = {}) {
    try {
      console.log('Getting annotation history with filters:', filters);
      const response = await axios.post(`${API_URL}/annotations/history`, filters);
      return response.data;
    } catch (error) {
      console.error('Error fetching annotation history:', error);
      throw new Error(`Failed to fetch annotation history: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * 작업자별 작업 개요 조회
   * @param {Object} filters - 필터 조건 {user_id, start_date, end_date, search}
   * @returns {Promise<Array>} 작업자별 작업 개요 목록
   */
  async getWorkerSummary(filters = {}) {
    try {
      console.log('Getting worker summary with filters:', filters);
      const response = await axios.post(`${API_URL}/annotators/summary`, filters);
      return response.data;
    } catch (error) {
      console.error('Error fetching worker summary:', error);
      throw new Error(`Failed to fetch worker summary: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * 필터용 어노테이터 목록 조회
   * @returns {Promise<Array>} 어노테이터 목록
   */
  async getAnnotatorFilterList() {
    try {
      console.log('Getting annotator filter list');
      const response = await axios.get(`${API_URL}/annotators/filter-list`);
      return response.data;
    } catch (error) {
      console.error('Error fetching annotator filter list:', error);
      throw new Error(`Failed to fetch annotator filter list: ${error.message || 'Unknown error'}`);
    }
  }
}

export default new AnnotationService(); 