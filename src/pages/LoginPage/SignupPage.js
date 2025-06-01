import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SignupPage.css';

// 백엔드 API URL - 환경 변수 사용
const API_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';

function SignupPage() {
  console.log("✅ SignupPage 렌더링됨!"); // 원래 로그 복원
  const navigate = useNavigate();
  const location = useLocation();
  const socialData = location.state?.socialData || {};
  const provider = location.state?.provider || ''; // 'google' 또는 'naver'

  // 입력값을 관리하는 state
  const [form, setForm] = useState({
    name: socialData.name || '',
    email: socialData.email || '', 
    factoryName: '',
    role: '',
    nationality: 'Korea',
    birthdate: '',
    bank: '',
    accountNumber: '',
    agreed: false,
    gender: '', // gender 필드 유지
  });

  // 폼 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreed) {
      alert('약관에 동의해야 합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 소셜 로그인 정보를 포함한 회원가입 데이터 준비
      const signupData = {
        ...form,
        socialId: socialData.id,
        socialType: provider, // 'google' 또는 'naver'
        socialToken: socialData.token
      };

      // 백엔드 API로 회원가입 요청 전송 (소셜 타입에 따라 다른 엔드포인트 사용)
      const endpoint = provider === 'naver' 
        ? `${API_URL}/auth/naver/signup` 
        : `${API_URL}/auth/signup`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        throw new Error('회원가입 처리 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      
      // 회원가입 성공 후 토큰 저장
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 역할에 따른 페이지로 리다이렉트
      switch(data.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'annotator':
          navigate('/annotator');
          break;
        case 'customer':
          navigate('/customer');
          break;
        default:
          navigate('/main');
          break;
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <header className="signup-header">
        <div className="signup-header__title">Defectect.</div>
        <button className="signup-header__signin-button" onClick={() => navigate('/signin')}>
          SIGN IN
        </button>
      </header>

      <div className="signup-container">
        <h2 className="signup-container__title">Sign up</h2>
        {error && <div className="signup-error">{error}</div>}
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-input-box">
            <label>Name (Use the same name as your bank account name.)</label>
            <input 
              type="text" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="Kim BoKyung" 
              required 
            />
          </div>

          <div className="signup-input-box">
            <label>이메일 주소</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="name@example.com" 
              readOnly 
              required 
            />
            <small>소셜 계정에서 가져온 이메일은 변경할 수 없습니다.</small>
          </div>

          <div className="signup-input-box">
            <label>Factory / Company Name</label>
            <select name="factoryName" value={form.factoryName} onChange={handleChange} required>
              <option value="">Select Factory / Company</option>
              <option value="A Factory/1 Company">A Factory / 1 Company</option>
              <option value="A Factory/2 Company">A Factory / 2 Company</option>
              <option value="A Factory/3 Company">A Factory / 3 Company</option>
            </select>
          </div>

          <div className="signup-input-box">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="annotator">Annotator</option>
              <option value="ml_engineer">ML Engineer</option>
            </select>
          </div>

          <div className="signup-input-box">
            <label>Nationality</label>
            <input 
              type="text" 
              name="nationality" 
              value={form.nationality} 
              onChange={handleChange}  
              placeholder="Korea" 
              required 
            />
          </div>

          <div className="signup-input-box">
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div className="signup-input-box">
            <label>Date of Birth</label>
            <input 
              type="date" 
              name="birthdate" 
              value={form.birthdate} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="signup-input-box">
            <label>Bank</label>
            <input 
              type="text" 
              name="bank" 
              value={form.bank} 
              onChange={handleChange} 
              placeholder="신한은행" 
              required 
            />
          </div>

          <div className="signup-input-box">
            <label>Bank Account Number</label>
            <input 
              type="text" 
              name="accountNumber" 
              value={form.accountNumber} 
              onChange={handleChange} 
              placeholder="XXXX-XX-XXX-XXXXX" 
              required 
            />
          </div>

          <div className="signup-terms-box">
            <input 
              type="checkbox" 
              name="agreed" 
              checked={form.agreed} 
              onChange={handleChange} 
            />
            <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</span>
          </div>

          <button 
            type="submit" 
            className="signup-form__submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '계정 생성'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
