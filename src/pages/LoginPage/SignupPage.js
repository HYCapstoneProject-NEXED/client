import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

const API_URL = "https://3cb10afb-6a7e-4ea3-9af3-f685c60b3d88.mock.pstmn.io"; // Mock API URL

function SignupPage() {
  console.log("✅ SignupPage 렌더링됨!");
  const navigate = useNavigate();

  // 입력값을 관리하는 state
  const [form, setForm] = useState({
    name: '',
    email: '', // 초기 이메일 값
    factoryName: '',
    role: '',
    nationality: 'Korea',
    birthdate: '',
    bank: '',
    accountNumber: '',
    agreed: false,
    gender: '',
  });

  // 🚀 API에서 사용자 이메일 가져오기
  useEffect(() => {
    fetch(`https://3cb10afb-6a7e-4ea3-9af3-f685c60b3d88.mock.pstmn.io/auth/login`) // 실제 API 엔드포인트로 변경
      .then((response) => response.json())
      .then((data) => {
        if (data.user && data.user.google_email) {
          setForm((prevForm) => ({
            ...prevForm,
            email: data.user.google_email, // API에서 받은 이메일 설정
          }));
        }
      })
      .catch((error) => console.error("API 호출 오류:", error));
  }, []);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.agreed) {
      console.log('회원가입 정보:', form);
      navigate('/');
    } else {
      alert('약관에 동의해야 합니다.');
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
        <h2 className="signup-container__title"><u>Sign up</u></h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-input-box">
            <label>Name (Use the same name as your bank account name.)</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Kim BoKyung" required />
          </div>

          <div className="signup-input-box">
            <label>이메일 주소</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} readOnly required />
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
            <input type="text" name="nationality" value={form.nationality} onChange={handleChange}  placeholder="Korea" required />
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
            <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} required />
          </div>

          <div className="signup-input-box">
            <label>Bank</label>
            <input type="text" name="bank" value={form.bank} onChange={handleChange} placeholder="신한은행" required />
          </div>

          <div className="signup-input-box">
            <label>Bank Account Number</label>
            <input type="text" name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="XXXX-XX-XXX-XXXXX" required />
          </div>

          <div className="signup-terms-box">
            <input type="checkbox" name="agreed" checked={form.agreed} onChange={handleChange} />
            <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</span>
          </div>

          <button type="submit" className="signup-form__submit">CREATE AN ACCOUNT</button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
