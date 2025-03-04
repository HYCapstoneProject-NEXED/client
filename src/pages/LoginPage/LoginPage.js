import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const googleCallbackUrl = process.env.REACT_APP_GOOGLE_CALLBACK_URL;
    const googleState = process.env.REACT_APP_GOOGLE_STATE;
  
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?response_type=code` +
      `&client_id=${googleClientId}` +
      `&redirect_uri=${encodeURIComponent(googleCallbackUrl)}` +
      `&scope=email%20profile` +
      `&state=${googleState}`;
  
    console.log("Google Auth URL:", googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  // 네이버 OAuth 버튼 클릭
  const handleNaverLogin = () => {
    const naverclientId = process.env.REACT_APP_NAVER_CLIENT_ID;
    const navercallbackUrl = process.env.REACT_APP_NAVER_CALLBACK_URL;
    const naverstate = process.env.REACT_APP_NAVER_STATE;

    // 네이버 OAuth 인증 URL 생성
    const naverAuthUrl =
      `https://nid.naver.com/oauth2.0/authorize?response_type=code` +
      `&client_id=${naverclientId}` +
      `&redirect_uri=${encodeURIComponent(navercallbackUrl)}` +
      `&state=${naverstate}`;

    // 네이버 로그인 페이지로 이동
    window.location.href = naverAuthUrl;
  };

  return (
    <div className="login-page">
      <header className="header">
        <div className="header__title">Defectect.</div>
        <div className="header__signup">
          <button className="header__signup-button">SIGN UP</button>
        </div>
      </header>

      <div className="login-container">
        <h2 className="login-container__title">Sign in</h2>
        <div className="login-container__buttons">
          <button className="btn btn--google" onClick={handleGoogleLogin}>
            <span className="btn__icon">
              {/* 구글 아이콘 SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M3.02388 16.431L6.38721 13.859C6.1949 13.2749 6.09091 12.65 6.09091 12C6.09091 11.35 6.1949 10.7252 6.38721 10.141L3.02388 7.56909C2.36791 8.90275 2 10.4063 2 12C2 13.5937 2.36791 15.0973 3.02388 16.431Z" fill="#FBBC05"/>
                <path d="M6.38677 10.141C7.16276 7.78407 9.37681 6.09091 11.9996 6.09091C13.4086 6.09091 14.6814 6.59091 15.6814 7.40909L18.5905 4.5C16.8177 2.95455 14.545 2 11.9996 2C8.04779 2 4.65001 4.2621 3.02344 7.56906L6.38677 10.141Z" fill="#EA4335"/>
                <path d="M11.9999 22C8.04707 22 4.6485 19.7367 3.02246 16.4282L6.38442 13.8507C7.15795 16.212 9.37411 17.9091 11.9999 17.9091C13.2848 17.9091 14.4233 17.6065 15.3249 17.0375L18.5179 19.5095C16.77 21.1347 14.439 22 11.9999 22Z" fill="#34A853"/>
                <path d="M12 10.1818H21.3182C21.4545 10.7727 21.5455 11.4091 21.5455 12C21.5455 15.2593 20.3531 17.8032 18.5179 19.5095L15.325 17.0375C16.369 16.3786 17.0953 15.3626 17.3636 14.0455H12V10.1818Z" fill="#4285F4"/>
              </svg>
            </span>
            <span className="btn__text">Sign in with Google</span>
          </button>

          <button className="btn btn--naver" onClick={handleNaverLogin}>
            <span className="btn__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6817 4.8125V12.1218L9.31831 4.8125H3.5625V19.1875H9.31831V12L14.6817 19.1875H20.4375V4.8125H14.6817Z" fill="#02BB24"/>
              </svg>
            </span>
            <span className="btn__text">Sign in with NAVER</span>
          </button>
        </div>

        <div className="login-container__signup">
          <span>New User?</span>
          <span className="login-container__signup-link">SIGN UP HERE</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
