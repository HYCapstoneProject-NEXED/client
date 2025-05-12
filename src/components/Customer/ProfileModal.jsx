// src/components/ProfileModal.jsx
import { useContext, useState } from 'react';
import { ProfileModalContext } from '../../context/ProfileModalContext';

const ProfileModal = () => {
  const { isProfileOpen, setIsProfileOpen } = useContext(ProfileModalContext);
  // 상태 추가: 각 필드 값과 수정 가능 여부
  const [address, setAddress] = useState('Korea, Gyunggi-do');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [bank, setBank] = useState('신한은행');
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankAccount, setBankAccount] = useState('xxxx-0000-xxxxx-000');
  const [isEditingBankAccount, setIsEditingBankAccount] = useState(false);

  console.log("isProfileOpen:", isProfileOpen);

  if (!isProfileOpen) return null;

  // 저장 함수
  const handleSave = () => {
    setIsEditingAddress(false);
    setIsEditingBank(false);
    setIsEditingBankAccount(false);
    // 실제 저장 로직은 백엔드 연동 시 추가
    console.log('저장됨!', { address, bank, bankAccount });
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
            <img
              src="/default-profile.jpg"
              alt="프로필 이미지"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '8px',
              }}
            />
            <button style={{ fontSize: '14px', color: '#007BFF', border: 'none', background: 'none' }}>
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
                value="Kim"
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
                value="Korea"
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
                value="name@gmail.com"
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
                value="CEO"
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
                value="1990-01-25"
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
                value="Female"
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
                value="A company / 1 factory"
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

