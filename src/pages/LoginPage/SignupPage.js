import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

function SignupPage() {
  console.log("✅ SignupPage 렌더링됨!");
  const navigate = useNavigate();

  // 입력값을 관리하는 state
  const [form, setForm] = useState({
    name: '',
    email: '',
    factoryName: '',
    role: '',
    nationality: 'Korea',
    birthdate: '',
    bank: '',
    accountNumber: '',
    agreed: false,
  });

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
      <header className="header">
        <div className="header__title">Defectect.</div>
        <button className="header__signin-button" onClick={() => navigate('/signin')}>
          SIGN IN
        </button>
      </header>

      <div className="signup-container">
        <h2 className="signup-container__title"><u>Sign up</u></h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-box">
            <label>Name (Use the same name as your bank account name.)</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Kim BogYung" required />
          </div>

          <div className="input-box">
            <label>이메일 주소</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" required />
          </div>

          <div className="input-box">
            <label>Factory Name</label>
            <select name="factoryName" value={form.factoryName} onChange={handleChange} required>
              <option value="">Select Factory</option>
              <option value="Factory A">Factory A</option>
              <option value="Factory B">Factory B</option>
              <option value="Factory C">Factory C</option>
            </select>
          </div>

          <div className="input-box">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="MLengineer">ML Engineer</option>
              <option value="Annotator">Annotator</option>
            </select>
          </div>

          <div className="input-box">
            <label>Nationality</label>
            <input type="text" name="nationality" value={form.nationality} readOnly />
          </div>

          <div className="input-box">
            <label>Date of Birth</label>
            <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} required />
          </div>

          <div className="input-box">
            <label>Bank</label>
            <input type="text" name="bank" value={form.bank} onChange={handleChange} placeholder="신한은행" required />
          </div>

          <div className="input-box">
            <label>Bank Account Number</label>
            <input type="text" name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="XXXX-XX-XXX-XXXXX" required />
          </div>

          <div className="terms-box">
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
