import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_URL = "http://166.104.246.64:8000"; // 백엔드 API URL

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoginUrl, setGoogleLoginUrl] = useState('');

  // 페이지 로드 시 구글 로그인 URL 가져오기
  useEffect(() => {
    fetch(`${API_URL}/auth/google/login`)
      .then(response => response.json())
      .then(data => {
        if (data && data.login_url) {
          setGoogleLoginUrl(data.login_url);
        }
      })
      .catch(err => {
        console.error('구글 로그인 URL을 가져오는데 실패했습니다:', err);
      });
  }, []);

  // 일반 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
      
      const data = await response.json();
      
      // 토큰과 사용자 정보 저장
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
      console.error('로그인 오류:', err);
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (googleLoginUrl) {
      console.log("Google Login URL:", googleLoginUrl);
      window.location.href = googleLoginUrl;
    } else {
      setError('구글 로그인 URL을 가져오는데 실패했습니다. 나중에 다시 시도해주세요.');
    }
  };

  // 네이버 OAuth 버튼 클릭
  const handleNaverLogin = () => {
    // 네이버 로그인도 비슷하게 백엔드에서 URL 받아오도록 수정 가능
    fetch(`${API_URL}/auth/naver/login`)
      .then(response => response.json())
      .then(data => {
        if (data && data.login_url) {
          window.location.href = data.login_url;
        } else {
          setError('네이버 로그인 URL을 가져오는데 실패했습니다.');
        }
      })
      .catch(err => {
        console.error('네이버 로그인 URL을 가져오는데 실패했습니다:', err);
        setError('네이버 로그인 URL을 가져오는데 실패했습니다.');
      });
  };

  // 회원가입 페이지로 이동
  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-header__title">Defectect.</div>
        <div className="login-header__signup">
          <button 
            className="login-header__signup-button" 
            onClick={handleSignup}
          >
            SIGN UP
          </button>
        </div>
      </header>

      <div className="login-container">
        <h2 className="login-container__title">Sign in</h2>
        
        {/* 이메일/비밀번호 로그인 폼 */}
        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="login-form__error">{error}</div>}
          
          <div className="login-form__input-group">
            <label htmlFor="email">이메일</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          
          <div className="login-form__input-group">
            <label htmlFor="password">비밀번호</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-form__submit-btn"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="login-container__divider">
          <span>또는</span>
        </div>
        
        <div className="login-container__buttons">
          <button className="login-btn login-btn--google" onClick={handleGoogleLogin}>
            <span className="login-btn__icon">
              {/* 구글 아이콘 SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M3.02388 16.431L6.38721 13.859C6.1949 13.2749 6.09091 12.65 6.09091 12C6.09091 11.35 6.1949 10.7252 6.38721 10.141L3.02388 7.56909C2.36791 8.90275 2 10.4063 2 12C2 13.5937 2.36791 15.0973 3.02388 16.431Z" fill="#FBBC05"/>
                <path d="M6.38677 10.141C7.16276 7.78407 9.37681 6.09091 11.9996 6.09091C13.4086 6.09091 14.6814 6.59091 15.6814 7.40909L18.5905 4.5C16.8177 2.95455 14.545 2 11.9996 2C8.04779 2 4.65001 4.2621 3.02344 7.56906L6.38677 10.141Z" fill="#EA4335"/>
                <path d="M11.9999 22C8.04707 22 4.6485 19.7367 3.02246 16.4282L6.38442 13.8507C7.15795 16.212 9.37411 17.9091 11.9999 17.9091C13.2848 17.9091 14.4233 17.6065 15.3249 17.0375L18.5179 19.5095C16.77 21.1347 14.439 22 11.9999 22Z" fill="#34A853"/>
                <path d="M12 10.1818H21.3182C21.4545 10.7727 21.5455 11.4091 21.5455 12C21.5455 15.2593 20.3531 17.8032 18.5179 19.5095L15.325 17.0375C16.369 16.3786 17.0953 15.3626 17.3636 14.0455H12V10.1818Z" fill="#4285F4"/>
              </svg>
            </span>
            <span className="login-btn__text">Sign in with Google</span>
          </button>

          <button className="login-btn login-btn--naver" onClick={handleNaverLogin}>
            <span className="login-btn__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6817 4.8125V12.1218L9.31831 4.8125H3.5625V19.1875H9.31831V12L14.6817 19.1875H20.4375V4.8125H14.6817Z" fill="#02BB24"/>
              </svg>
            </span>
            <span className="login-btn__text">Sign in with NAVER</span>
          </button>
        </div>

        <div className="login-container__signup">
          <span>New User?</span>
          <span 
            className="login-container__signup-link"
            onClick={handleSignup}
          >
            SIGN UP HERE
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
