/**
 * 사용자 관련 API 서비스
 * 유저 관리, 권한 관리 등 API 호출
 */

// API 기본 URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// 임시 더미 데이터
const dummyUsers = [
  {
    user_id: 1,
    name: 'Jason Price',
    google_email: 'janick_parisian@yahoo.com',
    user_type: 'Customer',
    profile_image: 'https://randomuser.me/api/portraits/men/32.jpg',
    is_active: true
  },
  {
    user_id: 2,
    name: 'Jukkoe Sisao',
    google_email: 'sibyl_kozey@gmail.com',
    user_type: 'Admin',
    profile_image: 'https://randomuser.me/api/portraits/men/41.jpg',
    is_active: true
  },
  {
    user_id: 3,
    name: 'Harriet King',
    google_email: 'nadia_block@hotmail.com',
    user_type: 'Admin',
    profile_image: 'https://randomuser.me/api/portraits/men/42.jpg',
    is_active: true
  },
  {
    user_id: 4,
    name: 'Lenora Benson',
    google_email: 'feil.wallace@kunde.us',
    user_type: 'MLEng',
    profile_image: 'https://randomuser.me/api/portraits/men/38.jpg',
    is_active: true
  },
  {
    user_id: 5,
    name: 'Olivia Reese',
    google_email: 'kemmer.hattie@cremin.us',
    user_type: 'MLEng',
    profile_image: 'https://randomuser.me/api/portraits/women/12.jpg',
    is_active: true
  },
  {
    user_id: 6,
    name: 'Bertha Valdez',
    google_email: 'loraine.koelpin@tromp.io',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/men/44.jpg',
    is_active: true
  },
  {
    user_id: 7,
    name: 'Harriett Payne',
    google_email: 'nannie_west@estrella.tv',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/men/36.jpg',
    is_active: true
  },
  {
    user_id: 8,
    name: 'George Bryant',
    google_email: 'delmer.kling@gmail.com',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/women/26.jpg',
    is_active: true
  },
  {
    user_id: 9,
    name: 'Lily French',
    google_email: 'alice.french@example.com',
    user_type: 'Customer',
    profile_image: 'https://randomuser.me/api/portraits/women/22.jpg',
    is_active: false
  },
  {
    user_id: 10,
    name: 'Howard Adkins',
    google_email: 'howard.adkins@example.com',
    user_type: 'Customer',
    profile_image: 'https://randomuser.me/api/portraits/men/52.jpg',
    is_active: true
  },
  {
    user_id: 11,
    name: 'Earl Bowman',
    google_email: 'earl.bowman@example.com',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/men/36.jpg',
    is_active: true
  },
  {
    user_id: 12,
    name: 'Patrick Padilla',
    google_email: 'patrick.padilla@example.com',
    user_type: 'MLEng',
    profile_image: 'https://randomuser.me/api/portraits/men/19.jpg',
    is_active: false
  },
  // 추가 어노테이터 더미 데이터
  {
    user_id: 13,
    name: '김지원',
    google_email: 'jiwon.kim@example.com',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/women/33.jpg',
    is_active: true
  },
  {
    user_id: 14,
    name: '이태민',
    google_email: 'taemin.lee@example.com',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/men/45.jpg',
    is_active: true
  },
  {
    user_id: 15,
    name: '박소연',
    google_email: 'soyeon.park@example.com',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/women/29.jpg',
    is_active: true
  },
  {
    user_id: 16,
    name: '정민준',
    google_email: 'minjun.jung@example.com',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/men/28.jpg',
    is_active: true
  },
  {
    user_id: 17,
    name: '최유진',
    google_email: 'yujin.choi@example.com',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/women/15.jpg',
    is_active: true
  },
  {
    user_id: 18,
    name: '한지훈',
    google_email: 'jihoon.han@example.com',
    user_type: 'Annotator',
    profile_image: 'https://randomuser.me/api/portraits/men/23.jpg',
    is_active: true
  }
];

// 임시 승인 대기 사용자 더미 데이터
const dummyPendingApprovals = [
  {
    user_id: 101,
    name: '우수민',
    google_email: 'soomin.woo@example.com',
    user_type: 'annotator',
    profile_image: 'https://randomuser.me/api/portraits/women/31.jpg',
    date_of_birth: '11-08-1995',
    gender: 'Female'
  },
  {
    user_id: 102,
    name: '김다은',
    google_email: 'daeun.kim@example.com',
    user_type: 'annotator',
    profile_image: 'https://randomuser.me/api/portraits/women/25.jpg',
    date_of_birth: '21-03-1999',
    gender: 'Female'
  },
  {
    user_id: 103,
    name: '이수혁',
    google_email: 'soohyuk.lee@example.com',
    user_type: 'admin',
    profile_image: 'https://randomuser.me/api/portraits/men/9.jpg',
    date_of_birth: '01-04-1979',
    gender: 'Male'
  },
  {
    user_id: 104,
    name: '박지영',
    google_email: 'jiyoung.park@example.com',
    user_type: 'annotator',
    profile_image: 'https://randomuser.me/api/portraits/women/42.jpg',
    date_of_birth: '20-01-1988',
    gender: 'Female'
  },
  {
    user_id: 105,
    name: '홍성민',
    google_email: 'sungmin.hong@example.com',
    user_type: 'annotator',
    profile_image: 'https://randomuser.me/api/portraits/men/22.jpg',
    date_of_birth: '01-11-1989',
    gender: 'Male'
  },
  {
    user_id: 106,
    name: '신예린',
    google_email: 'yerin.shin@example.com',
    user_type: 'annotator',
    profile_image: 'https://randomuser.me/api/portraits/women/26.jpg',
    date_of_birth: '01-11-1989',
    gender: 'Female'
  }
];

/**
 * 사용자 서비스 클래스
 */
class UserService {
  /**
   * 모든 사용자 목록 가져오기
   * @returns {Promise<Array>} 사용자 목록
   */
  async getAllUsers() {
    // 실제 API 연동 시 구현 예정
    // const response = await fetch('/api/users');
    // return response.json();

    // 임시 데이터 반환
    return Promise.resolve(dummyUsers);
  }

  /**
   * 더미 사용자 데이터 가져오기
   * @returns {Array} 더미 사용자 목록
   */
  getDummyUsers() {
    return dummyUsers;
  }

  /**
   * 대기 중인 승인 요청 목록 가져오기
   * @returns {Promise<Array>} 승인 대기 중인 사용자 목록
   */
  async getPendingApprovals() {
    // 실제 API 연동 시 구현 예정
    // const response = await fetch('/api/users/pending');
    // return response.json();

    // 임시 데이터 반환
    return Promise.resolve(dummyPendingApprovals);
  }

  /**
   * 더미 승인 대기 사용자 데이터 가져오기
   * @returns {Array} 더미 승인 대기 사용자 목록
   */
  getDummyPendingApprovals() {
    return dummyPendingApprovals;
  }

  /**
   * 사용자 승인하기
   * @param {number} userId - 사용자 ID
   * @param {boolean} isApproved - 승인 여부
   * @returns {Promise<Object>} 처리 결과
   */
  async approveUser(userId, isApproved) {
    // 실제 API 연동 시 구현 예정
    // const response = await fetch(`/api/users/${userId}/approve`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ isApproved })
    // });
    // return response.json();

    // 임시 성공 응답 반환
    return Promise.resolve({ success: true });
  }

  /**
   * 사용자 역할 업데이트
   * @param {number} userId - 사용자 ID
   * @param {string} role - 새 역할
   * @returns {Promise<Object>} 처리 결과
   */
  async updateUserRole(userId, role) {
    // 실제 API 연동 시 구현 예정
    // const response = await fetch(`/api/users/${userId}/role`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ role })
    // });
    // return response.json();

    // 임시 성공 응답 반환
    return Promise.resolve({ success: true });
  }

  /**
   * 사용자 활성화 상태 업데이트
   * @param {number} userId - 사용자 ID
   * @param {boolean} isActive - 활성화 상태
   * @returns {Promise<Object>} 처리 결과
   */
  async updateUserActiveStatus(userId, isActive) {
    // 실제 API 연동 시 구현 예정
    // const response = await fetch(`/api/users/${userId}/status`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ isActive })
    // });
    // return response.json();

    // 임시 성공 응답 반환
    return Promise.resolve({ success: true });
  }

  /**
   * 사용자 삭제
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 처리 결과
   */
  async deleteUser(userId) {
    // 실제 API 연동 시 구현 예정
    // const response = await fetch(`/api/users/${userId}`, {
    //   method: 'DELETE'
    // });
    // return response.json();

    // 임시 성공 응답 반환
    return Promise.resolve({ success: true });
  }
}

export default new UserService();