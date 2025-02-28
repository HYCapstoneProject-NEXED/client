import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function AuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 소셜 로그인 인증 후, URL에 ?code=...가 붙어있다고 가정
    const code = searchParams.get('code');

    if (code) {
      // 실제로는 이 code를 백엔드로 보내 JWT를 받아오겠지만,
      // 여기서는 "가짜"로 토큰을 생성해 localStorage에 저장
      console.log('Received code:', code);

      // 가짜 토큰 생성
      const fakeToken = `FAKE_TOKEN_${code}_${Date.now()}`;

      // 토큰 저장
      localStorage.setItem('token', fakeToken);

      // 이후 홈 화면으로 이동
      window.location.replace('./MainPage/MainPage');
    }
  }, [searchParams]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>소셜 로그인 처리 중입니다... (가짜)</p>
    </div>
  );
}

export default AuthCallback;
