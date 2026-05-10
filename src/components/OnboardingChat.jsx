import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { saveUserProfile } from '../utils/firestoreService';
import { saveLocalProfile } from '../utils/localProfileStorage';
import { useAuth } from '../contexts/AuthContext';

const CHRONIC_OPTIONS = [
  { id: 'hypertension', label: '고혈압' },
  { id: 'diabetes', label: '당뇨병' },
  { id: 'cardiovascular', label: '심혈관 질환' },
  { id: 'periodontitis', label: '치주(잇몸) 질환' },
];

const STEPS_COUNT = 5;

const pillBase = {
  flex: '1',
  padding: '16px',
  borderRadius: 'var(--rounded-full)',
  border: '1.5px solid #e5e7eb',
  fontSize: 'var(--font-body)',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  backgroundColor: 'white',
  color: 'var(--color-ink-deep)',
};

const OnboardingChat = ({ onComplete, selectedPersona }) => {
  const { user, setUserProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [livingCondition, setLivingCondition] = useState('alone');
  const [incomeLevel, setIncomeLevel] = useState('low');
  const [chronicDiseases, setChronicDiseases] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const progress = useMemo(() => `${step + 1} / ${STEPS_COUNT}`, [step]);

  const toggleChronic = (id) => {
    setChronicDiseases((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const canGoNext = () => {
    if (step === 1) {
      const n = parseInt(String(age).trim(), 10);
      return !Number.isNaN(n) && n >= 40 && n <= 120;
    }
    return true;
  };

  const finish = async () => {
    setError('');
    const n = parseInt(String(age).trim(), 10);
    if (Number.isNaN(n) || n < 40 || n > 120) {
      setError('나이를 40세 이상 120세 이하로 입력해 주세요.');
      setStep(1);
      return;
    }

    const payload = {
      persona: selectedPersona,
      onboardingComplete: true,
      ...(displayName.trim() ? { displayName: displayName.trim(), name: displayName.trim() } : {}),
      age: n,
      living_condition: livingCondition,
      income_level: incomeLevel,
      chronic_diseases: chronicDiseases,
    };

    setSaving(true);
    try {
      if (user) {
        await saveUserProfile(user.uid, payload);
      }
      setUserProfile((prev) => {
        const merged = { ...(prev || {}), ...payload };
        saveLocalProfile(merged);
        return merged;
      });
      onComplete();
    } catch (e) {
      console.error(e);
      setError(e?.message || '저장 중 문제가 생겼어요.');
    }
    setSaving(false);
  };

  const goNext = () => {
    if (!canGoNext()) return;
    if (step >= STEPS_COUNT - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  const headerIcon =
    selectedPersona === 'grandchild' ? '👶' : selectedPersona === 'doctor' ? '👨‍⚕️' : '🤝';

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <>
            <p style={{ fontSize: 'var(--font-body)', lineHeight: 1.7, color: 'var(--color-ink)' }}>
              처음 뵙겠습니다. 편하게 &ldquo;호칭&rdquo;이나 이름을 알려 주세요. (선택)
            </p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="예: 김 할머니, 홍길동"
              style={{
                width: '100%',
                padding: '16px 18px',
                marginTop: '16px',
                borderRadius: '16px',
                border: '1.5px solid #e5e7eb',
                fontSize: 'var(--font-body)',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <p style={{ fontSize: 'var(--font-body)', lineHeight: 1.7, color: 'var(--color-ink)' }}>
              만 나이를 숫자로 알려 주세요.
            </p>
            <input
              type="number"
              inputMode="numeric"
              min={40}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="예: 76"
              style={{
                width: '100%',
                padding: '16px 18px',
                marginTop: '16px',
                borderRadius: '16px',
                border: '1.5px solid #e5e7eb',
                fontSize: '22px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: '13px', color: 'var(--color-ink)', marginTop: '10px' }}>
              건강 위험 점수 계산에만 사용되며 비밀이 보장됩니다.
            </p>
          </>
        );
      case 2:
        return (
          <>
            <p style={{ fontSize: 'var(--font-body)', lineHeight: 1.7, color: 'var(--color-ink)' }}>
              현재 거주 형태를 골라 주세요.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              {[
                { id: 'alone', label: '혼자 사세요' },
                { id: 'with_family', label: '가족과 함께' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLivingCondition(id)}
                  style={{
                    ...pillBase,
                    flex: '1',
                    minWidth: '140px',
                    backgroundColor:
                      livingCondition === id ? 'var(--color-primary)' : 'white',
                    color: livingCondition === id ? 'white' : pillBase.color,
                    borderColor: livingCondition === id ? 'var(--color-primary)' : '#e5e7eb',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <p style={{ fontSize: 'var(--font-body)', lineHeight: 1.7, color: 'var(--color-ink)' }}>
              생활비·경제적 여유는 어느 쪽에 가깝나요?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              {[
                { id: 'low', label: '조금 버거운 편이에요' },
                { id: 'mid', label: '보통이에요' },
                { id: 'high', label: '여유 있는 편이에요' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setIncomeLevel(id)}
                  style={{
                    ...pillBase,
                    textAlign: 'left',
                    backgroundColor:
                      incomeLevel === id ? 'var(--color-primary)' : 'white',
                    color: incomeLevel === id ? 'white' : pillBase.color,
                    borderColor:
                      incomeLevel === id ? 'var(--color-primary)' : '#e5e7eb',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        );
      default:
        return (
          <>
            <p style={{ fontSize: 'var(--font-body)', lineHeight: 1.7, color: 'var(--color-ink)' }}>
              해당하시는 만성질환이 있다면 모두 눌러 주세요. 없으면 그냥 &ldquo;다음&rdquo;을 눌러도 됩니다.
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              {CHRONIC_OPTIONS.map(({ id, label }) => {
                const on = chronicDiseases.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleChronic(id)}
                    style={{
                      ...pillBase,
                      textAlign: 'left',
                      backgroundColor: on ? 'var(--color-primary)' : 'white',
                      color: on ? 'white' : pillBase.color,
                      borderColor: on ? 'var(--color-primary)' : '#e5e7eb',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface-soft)',
      }}
    >
      <div
        style={{
          padding: '20px',
          background: 'var(--gradient-safe)',
          textAlign: 'center',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '4px' }}>{headerIcon}</div>
        <h2 style={{ fontSize: 'var(--font-heading-sm)', fontWeight: 700, margin: 0 }}>
          건강 정보 간단히 알려주세요
        </h2>
        <p style={{ fontSize: '14px', margin: '8px 0 0', opacity: 0.85 }}>
          질문 {progress}
        </p>
      </div>

      <div style={{ flex: 1, padding: '24px 20px' }}>
        <div
          className="card-floating"
          style={{ padding: '24px', minHeight: '220px', boxSizing: 'border-box' }}
        >
          {renderStepContent()}
        </div>

        {error ? (
          <p
            style={{
              marginTop: '14px',
              fontSize: '14px',
              color: 'var(--color-critical)',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        ) : null}
      </div>

      <div
        style={{
          padding: '16px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          backgroundColor: 'white',
          borderTop: '1px solid #eee',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0 || saving}
            style={{
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '16px 18px',
              borderRadius: 'var(--rounded-full)',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              cursor: step === 0 || saving ? 'default' : 'pointer',
              opacity: step === 0 ? 0.5 : 1,
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            <ChevronLeft size={20} aria-hidden /> 이전
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext() || saving}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '16px',
              borderRadius: 'var(--rounded-full)',
              border: 'none',
              backgroundColor:
                !canGoNext() || saving ? '#d1d5db' : 'var(--color-primary)',
              color: 'white',
              fontWeight: 700,
              fontSize: '17px',
              cursor: !canGoNext() || saving ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {step >= STEPS_COUNT - 1
              ? saving
                ? '저장 중...'
                : '시작하기'
              : '다음'}{' '}
            {step >= STEPS_COUNT - 1 ? null : <ChevronRight size={20} aria-hidden />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingChat;
