// src/components/ProfileModal.jsx
import { useContext, useState, useRef, useEffect } from 'react';
import { ProfileModalContext } from '../../context/ProfileModalContext';
import DefaultProfileIcon from './DefaultProfileIcon';
import axios from 'axios';

// API 기본 URL 설정 - 배포 환경에 맞게 수정
const API_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';

const ProfileModal = () => {
  const { isProfileOpen, setIsProfileOpen, profileImage, setProfileImage } = useContext(ProfileModalContext);
  // 상태 추가: 각 필드 값과 수정 가능 여부
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [address, setAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [bank, setBank] = useState('');
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankAccount, setBankAccount] = useState('');
  const [isEditingBankAccount, setIsEditingBankAccount] = useState(false);
  const fileInputRef = useRef(null);

  // API에서 사용자 데이터 가져오기
  useEffect(() => {
    if (isProfileOpen) {
      setLoading(true);
      // 실제 사용 시에는 현재 로그인된 사용자의 ID를 사용해야 합니다
      const userId = 1; // 임시로 1로 설정
      
      axios.get(`${API_URL}/users/${userId}`)
        .then(response => {
          setUserData(response.data);
          // 편집 가능한 필드 초기화
          setAddress(response.data.address || '');
          setBank(response.data.bank_name || '');
          setBankAccount(response.data.bank_account || '');
          
          // 프로필 이미지가 있으면 설정
          if (response.data.profile_image) {
            setProfileImage(response.data.profile_image);
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error('사용자 데이터를 가져오는데 실패했습니다:', err);
          setError('사용자 데이터를 불러오는 중 오류가 발생했습니다.');
          setLoading(false);
        });
    }
  }, [isProfileOpen, setProfileImage]);

  console.log("isProfileOpen:", isProfileOpen);

  if (!isProfileOpen) return null;
  if (loading) return <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>로딩 중...</div>;
  if (error) return <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>{error}</div>;

  // 저장 함수
  const handleSave = () => {
    setIsEditingAddress(false);
    setIsEditingBank(false);
    setIsEditingBankAccount(false);
    
    // userData가 없는 경우 처리
    if (!userData || !userData.user_id) {
      console.error('사용자 데이터가 없습니다.');
      alert('사용자 정보를 불러올 수 없습니다. 페이지를 새로고침하고 다시 시도해주세요.');
      return;
    }

    // 변경된 데이터만 포함시키기
    const updatedData = {};
    
    if (address !== userData.address) {
      updatedData.address = address;
    }
    
    if (bank !== userData.bank_name) {
      updatedData.bank_name = bank;
    }
    
    if (bankAccount !== userData.bank_account) {
      updatedData.bank_account = bankAccount;
    }
    
    console.log('저장 시도 중:', { userId: userData.user_id, updatedData });
    
    // 변경된 데이터가 없으면 API 호출 생략
    if (Object.keys(updatedData).length === 0) {
      console.log('변경된 데이터가 없습니다.');
      alert('변경된 내용이 없습니다.');
      return;
    }
    
    // API를 통해 프로필 정보 업데이트
    axios.put(`${API_URL}/users/${userData.user_id}`, updatedData)
    .then(response => {
      console.log('프로필 업데이트 성공:', response.data);
      // 업데이트된 데이터로 상태 갱신
      setUserData({...userData, ...updatedData});
      alert('프로필이 성공적으로 업데이트되었습니다.');
    })
    .catch(err => {
      console.error('프로필 업데이트 실패:', err.response ? err.response.data : err.message);
      alert('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // userData가 없는 경우 처리
      if (!userData || !userData.user_id) {
        console.error('사용자 데이터가 없습니다.');
        alert('사용자 정보를 불러올 수 없습니다. 페이지를 새로고침하고 다시 시도해주세요.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
        
        // 이미지 업로드 API 호출
        const formData = new FormData();
        formData.append('file', file); // 'profile_image'에서 'file'로 변경
        
        console.log('이미지 업로드 시도 중:', { userId: userData.user_id, fileName: file.name });
        
        // 이미지 업로드는 별도의 엔드포인트를 사용할 수 있음
        axios.post(`${API_URL}/users/${userData.user_id}/upload-profile-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(response => {
          console.log('이미지 업로드 성공:', response.data);
          alert('프로필 이미지가 성공적으로 업데이트되었습니다.');
        })
        .catch(err => {
          console.error('이미지 업로드 실패:', err.response ? err.response.data : err.message);
          alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
          
          // 오류 세부 정보 로깅
          if (err.response) {
            console.log('Error status:', err.response.status);
            console.log('Error data:', err.response.data);
            console.log('Error headers:', err.response.headers);
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          width: '700px',
          position: 'relative'
        }}
      >
        {/* 닫기 버튼 */}
        <button
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            fontSize: '20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer'
          }}
          onClick={() => setIsProfileOpen(false)}
        >
          ✕
        </button>


        {/* 타이틀 */}
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '12px' }}>
          Profile
        </h2>
        

        <div style={{ display: 'flex', gap: '24px' }}>
          {/* 왼쪽: 프로필 사진 */}
          <div style={{ flex: '1', textAlign: 'center' }}>
            <div 
              onClick={handleImageClick}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                margin: '0 auto',
                marginBottom: '8px',
                overflow: 'hidden',
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="프로필" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <DefaultProfileIcon size={60} />
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  fontSize: '12px',
                  padding: '4px 0'
                }}
              >
                변경
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
              onClick={handleImageClick}
              style={{ 
                fontSize: '14px', 
                color: '#007BFF', 
                border: 'none', 
                background: 'none',
                cursor: 'pointer'
              }}
            >
              사진 변경
            </button>
          </div>

          {/* 오른쪽: 입력 필드들 */}
          <div
            style={{
              flex: '3',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            {/* 이름 */}
            <div>
              <label style={{ fontSize: '14px', color: '#555' }}>Name</label>
              <input
                type="text"
                value={userData.name || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              />
            </div>

            {/* Country */}
            <div>
              <label style={{ fontSize: '14px', color: '#555' }}>Country</label>
              <input
                type="text"
                value={userData.nationality || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '14px', color: '#555' }}>Email</label>
              <input
                type="email"
                value={userData.google_email || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              />
            </div>

            {/* Role */}
            <div>
              <label style={{ fontSize: '14px', color: '#555' }}>Role</label>
              <input
                type="text"
                value={userData.user_type || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              />
            </div>
            {/* Date of Birth */}
            <div>
              <label style={{ fontSize: '14px', color: '#555' }}>Date of Birth</label>
              <input
                type="text"
                value={userData.birthdate || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              />
            </div>

            {/* Address (edit) */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '14px', color: '#555' }}>Address</label>
              <input
                type="text"
                value={address}
                readOnly={!isEditingAddress}
                onChange={e => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: isEditingAddress ? '#fff' : '#f9f9f9',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '32px',
                  fontSize: '13px',
                  color: '#007BFF',
                  cursor: 'pointer',
                  display: isEditingAddress ? 'none' : 'inline',
                }}
                onClick={() => setIsEditingAddress(true)}
              >
                edit
              </span>
            </div>

            {/* Gender */}
            <div>
              <label style={{ fontSize: '14px', color: '#555' }}>Gender</label>
              <input
                type="text"
                value={userData.gender === 'male' ? '남성' : userData.gender === 'female' ? '여성' : userData.gender || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              />
            </div>

            {/* Company / factory  */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '14px', color: '#555' }}>Company / factory</label>
              <input
                type="text"
                value={`${userData.company_name || ''} / ${userData.factory_name || ''}`}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              />
              
            </div>

            {/* Bank (edit 추가됨) */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '14px', color: '#555' }}>Bank</label>
              <input
                type="text"
                value={bank}
                readOnly={!isEditingBank}
                onChange={e => setBank(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: isEditingBank ? '#fff' : '#f9f9f9',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '32px',
                  fontSize: '13px',
                  color: '#007BFF',
                  cursor: 'pointer',
                  display: isEditingBank ? 'none' : 'inline',
                }}
                onClick={() => setIsEditingBank(true)}
              >
                edit
              </span>
            </div>
            
            {/* Bank Account (edit) */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '14px', color: '#555' }}>Bank account</label>
              <input
                type="text"
                value={bankAccount}
                readOnly={!isEditingBankAccount}
                onChange={e => setBankAccount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '4px',
                  backgroundColor: isEditingBankAccount ? '#fff' : '#f9f9f9',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '32px',
                  fontSize: '13px',
                  color: '#007BFF',
                  cursor: 'pointer',
                  display: isEditingBankAccount ? 'none' : 'inline',
                }}
                onClick={() => setIsEditingBankAccount(true)}
              >
                edit
              </span>
            </div>
            {/* 저장 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button
                style={{
                  backgroundColor: '#007BFF',
                  color: 'white',
                  padding: '12px 40px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
                onClick={handleSave}
              >
                Save
              </button>
            </div>

          </div>


        </div>

      </div>
    </div>
  );
};


export default ProfileModal;

