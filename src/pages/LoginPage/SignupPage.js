import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

function SignupPage() {
    console.log("✅ SignupPage 렌더링됨!");  // 페이지가 불러오는지 확인하는 로그
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    birthdate: '',
    role: '',
    bank: '',
    accountNumber: '',
    agreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.agreed) {
      console.log('회원가입 정보:', form);
      navigate('/'); // 회원가입 후 메인 페이지 이동 (또는 로그인 페이지)
    } else {
      alert('약관에 동의해야 합니다.');
    }
  };

  return (
    <div className="signup-page">
      <header className="header">
        <div className="header__title">Defectect.</div>
      </header>

      <div className="signup-container">
        <h2 className="signup-container__title">Sign up</h2>
        <form className="signup-form">
        <div className="input-box">
        <label>이름 (은행계좌 등록 시 사용했던 이름을 쓰세요)</label>
        <input type="text" name="name" placeholder="name" required />
        </div>

    <div className="input-box">
        <label>생년월일</label>
        <input type="date" name="birthdate" required />
    </div>

    <div className="input-box">
        <label>role</label>
        <select name="role" required>
            <option value="user">user</option>
            <option value="Admin">Admin</option>
            <option value="MLengineer">MLengineer</option>
            <option value="Annotator">Annotator</option>
        </select>
    </div>

    <div className="input-box">
        <label>은행</label>
        <input type="text" name="bank" placeholder="ex)신한은행" required />
    </div>

    <div className="input-box">
        <label>계좌번호</label>
        <input type="text" name="accountNumber" placeholder="XXXX-XX-XXX-XXXXX" required />
    </div>

    <div className="terms-box">
        <input type="checkbox" name="agree" required />
        <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</span>
    </div>

    <button type="submit" className="signup-form__submit">CREATE AN ACCOUNT</button>
</form>

      </div>
    </div>
  );
}

export default SignupPage;
