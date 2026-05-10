import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import PersonaSelection from './components/PersonaSelection';
import OnboardingChat from './components/OnboardingChat';
import HealthDashboard from './components/HealthDashboard';
import { auth } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { googleProvider } from './firebase';
import { loadLocalProfile } from './utils/localProfileStorage';

// 메인 앱 로직 (AuthProvider 내부)
function AppContent() {
  const { user, userProfile, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [selectedPersona, setSelectedPersona] = useState('grandchild');
  const userRef = useRef(user);
  const profileRef = useRef(userProfile);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    profileRef.current = userProfile;
  }, [userProfile]);

  /** 스플래시 종료 시점의 최신 로그인/프로필을 보기 위해 ref 사용 (타이머가 user 변경마다 초기화되지 않도록) */
  useEffect(() => {
    if (loading || currentScreen !== 'splash') return;
    const t = setTimeout(() => {
      const u = userRef.current;
      const p = profileRef.current ?? loadLocalProfile();
      if (u) {
        if (p?.onboardingComplete) {
          setSelectedPersona(p.persona || 'grandchild');
          setCurrentScreen('dashboard');
        } else {
          setCurrentScreen('consent');
        }
      } else if (p?.onboardingComplete) {
        setSelectedPersona(p.persona || 'grandchild');
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('consent');
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [loading, currentScreen]);

  /** 로그인 화면에서 세션이 살아 있거나 로그인 직후 진입했을 때만 반응 (currentScreen을 deps에 포함) */
  useEffect(() => {
    if (loading || !user || currentScreen !== 'login') return;
    queueMicrotask(() => {
      if (userProfile?.onboardingComplete) {
        setSelectedPersona(userProfile.persona || 'grandchild');
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('consent');
      }
    });
  }, [loading, user, userProfile, currentScreen]);

  const handleLogin = async (method) => {
    try {
      if (method === 'skip') {
        setCurrentScreen('consent');
        return;
      }
      if (method === 'google') {
        await signInWithPopup(auth, googleProvider);
      } else if (method === 'kakao') {
        alert('카카오 로그인은 추후 지원 예정입니다. 구글 로그인을 이용해 주세요!');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      alert(`로그인에 실패했습니다: ${err.message}`);
    }
  };

  const dummyUserData = {
    living_condition: 'alone', income_level: 'low', age: 76,
    chronic_diseases: ['hypertension', 'diabetes', 'cardiovascular']
  };
  const dummyEnvData = { pm25: 85, pm10: 90 };

  // === SCREENS ===

  // 1. Splash
  if (currentScreen === 'splash') {
    return (
      <div style={{ height: '100vh', backgroundColor: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', animation: 'fadeIn 1s ease-in-out' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🌱</div>
        <h1 style={{ fontSize: 'var(--font-display)', fontWeight: 800, margin: 0, letterSpacing: '-2px' }}>도란도란</h1>
        <p style={{ fontSize: 'var(--font-body)', marginTop: '10px', opacity: 0.9 }}>당신의 따뜻한 AI 건강 수호자</p>
      </div>
    );
  }

  // 2. Login
  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 3. Consent
  if (currentScreen === 'consent') {
    return (
      <div style={{ padding: '40px 20px', minHeight: '100vh', backgroundColor: 'var(--color-surface-soft)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="card-floating" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ fontSize: 'var(--font-heading-sm)', fontWeight: 700, marginBottom: '16px' }}>건강 정보 보호 안내</h2>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-ink)', marginBottom: '32px', textAlign: 'left', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
            도란도란은 간단한 질문과 대화 형태로 건강 상황을 파악하고 맞춤형 건강 안내를 제공합니다. 수집된 정보는 안전하게 보호되며 다른 목적으로 사용되지 않습니다.
          </p>
          <button onClick={() => setCurrentScreen('persona')} style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 700, borderRadius: 'var(--rounded-full)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
            동의하고 시작하기
          </button>
          <p style={{ fontSize: '13px', color: 'var(--color-ink)', marginTop: '20px', lineHeight: 1.6 }}>
            이 기기에만 간단히 저장해 두었다가, 원하실 때 계정과 연결할 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => setCurrentScreen('login')}
            style={{
              marginTop: '14px',
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              borderRadius: 'var(--rounded-full)',
              backgroundColor: 'transparent',
              color: 'var(--color-ink-deep)',
              border: '1.5px solid #cbd5e1',
              cursor: 'pointer',
            }}
          >
            Google로 로그인 (선택)
          </button>
        </div>
      </div>
    );
  }

  // 4. Persona Selection
  if (currentScreen === 'persona') {
    return (
      <PersonaSelection
        onSelect={(id) => {
          setSelectedPersona(id);
          setCurrentScreen('onboarding');
        }}
      />
    );
  }

  // 5. 온보딩 (고정 질문)
  if (currentScreen === 'onboarding') {
    return (
      <OnboardingChat
        selectedPersona={selectedPersona}
        onComplete={() => setCurrentScreen('dashboard')}
      />
    );
  }

  // 6. Main Dashboard
  return (
    <div className="App" style={{ animation: 'fadeIn 0.5s ease' }}>
      <HealthDashboard
        userData={userProfile || dummyUserData}
        environmentalData={dummyEnvData}
        activePersona={selectedPersona}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
