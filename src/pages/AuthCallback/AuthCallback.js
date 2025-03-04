// src/pages/AuthCallback/AuthCallback.js
import React, { useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      navigate('/');
      return;
    }

    // 백엔드 엔드포인트는 URL 경로에 따라 결정
    let endpoint = '';
    if (location.pathname === '/naverLogin') {
      endpoint = 'http://your-backend-address/api/naver/callback';
    } else if (location.pathname === '/googleLogin') {
      endpoint = 'http://your-backend-address/api/google/callback';
    } else {
      console.error('Unknown callback path:', location.pathname);
      navigate('/');
      return;
    }

    // 백엔드에 code와 state를 전송
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Backend request failed');
        return res.json();
      })
      .then(data => {
        console.log('Backend response:', data);
        if (data.registered) {
          // 이미 회원가입된 경우: 백엔드가 발급한 토큰을 저장하고 메인 페이지로 이동
          localStorage.setItem('token', data.token);
          navigate('/main');
        } else {
          // 미가입인 경우: 소셜 계정 정보를 SignupPage에 전달
          navigate('/signup', { state: { socialData: data.socialData } });
        }
      })
      .catch(err => {
        console.error('Error communicating with backend:', err);
        navigate('/');
      });
  }, [searchParams, location, navigate]);

  return <div>소셜 로그인 처리 중...</div>;
}

export default AuthCallback;
