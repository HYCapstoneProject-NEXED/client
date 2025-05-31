// src/pages/AuthCallback/AuthCallback.js
import React, { useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

const API_URL = "http://166.104.246.64:8000"; // 백엔드 API URL

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
    if (location.pathname === '/naverCallback') {
      endpoint = `${API_URL}/auth/naver/callback`;
    } else if (location.pathname === '/googleCallback') {
      endpoint = `${API_URL}/auth/google/callback`;
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
          // 이미 회원가입된 경우: 백엔드가 발급한 토큰을 저장
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
        } else {
          // 미가입인 경우: 소셜 계정 정보를 SignupPage에 전달
          navigate('/signup', { 
            state: { 
              socialData: data.socialData,
              provider: location.pathname.includes('naver') ? 'naver' : 'google'
            } 
          });
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
