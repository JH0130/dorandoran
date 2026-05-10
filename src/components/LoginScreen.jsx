import React from 'react';

const LoginScreen = ({ onLogin }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '60px', color: 'white', animation: 'fadeIn 1s ease' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🌱</div>
        <h1 style={{ fontSize: 'var(--font-display)', fontWeight: 800, margin: 0, letterSpacing: '-2px' }}>도란도란</h1>
        <p style={{ fontSize: 'var(--font-body)', marginTop: '8px', opacity: 0.9 }}>당신의 따뜻한 AI 건강 수호자</p>
      </div>

      {/* Login Card */}
      <div className="card-floating" style={{ width: '100%', maxWidth: '360px', padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-heading-sm)', fontWeight: 700, marginBottom: '8px' }}>시작하기</h2>
        <p style={{ fontSize: '15px', color: 'var(--color-ink)', marginBottom: '28px', lineHeight: 1.5 }}>
          처음 오셨나요?<br/>로그인하면 AI 수호자가 맞이합니다.
        </p>

        {/* Google Login */}
        <button
          onClick={() => onLogin('google')}
          style={{
            width: '100%', padding: '16px', marginBottom: '12px',
            borderRadius: 'var(--rounded-full)', border: '1.5px solid #ddd',
            backgroundColor: 'white', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '12px',
            fontSize: '16px', fontWeight: 600, fontFamily: 'inherit'
          }}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="22" height="22" alt="Google" />
          구글 계정으로 시작하기
        </button>

        {/* Kakao Login (placeholder - requires Kakao SDK setup) */}
        <button
          onClick={() => onLogin('kakao')}
          style={{
            width: '100%', padding: '16px',
            borderRadius: 'var(--rounded-full)', border: 'none',
            backgroundColor: '#FEE500', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '12px',
            fontSize: '16px', fontWeight: 600, fontFamily: 'inherit', color: '#191919'
          }}
        >
          <span style={{ fontSize: '20px' }}>💬</span>
          카카오 계정으로 시작하기
        </button>

        <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--color-ink)', lineHeight: 1.6 }}>
          로그인하면 도란도란의<br/>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>개인정보 처리방침</span>에 동의하는 것으로 간주합니다.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
