import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Phone, Settings, X, MapPin, RefreshCw } from 'lucide-react';
import { calculateHealthRiskScore } from '../utils/healthScore';
import { dailyCheckIn } from '../utils/personaScripts';
import { resolveUserCoordinates, fetchEnvironmentSnapshot } from '../utils/environmentService';
import {
  buildPersonalizedMissions,
  buildMorningBriefing,
  socialPrescriptionHints,
} from '../utils/personalization';
import { loadDashboardPreferences, saveDashboardPreferences } from '../utils/localProfileStorage';
import { useMorningReminder, useMorningReminderUi } from '../hooks/useMorningReminder';

function defaultHospital(userData) {
  const f = userData?.favorite_hospitals?.[0];
  if (f) {
    return {
      name: f.name,
      phone: f.phone || '1588-0000',
      lastVisit: f.department ? `${f.department} 진료` : '단골 의료기관',
    };
  }
  return {
    name: '행복한 심내과',
    phone: '02-1234-5678',
    lastVisit: '최근 2주 전 방문',
  };
}

const HealthDashboard = ({ userData, environmentalData, activePersona = 'grandchild' }) => {
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [waterDrank, setWaterDrank] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const prefsLockedRef = useRef(
    (() => {
      const s = loadDashboardPreferences();
      return !!(s?.mission1 && s?.mission2 && s?.hospital);
    })(),
  );

  const dummyUser = useMemo(
    () =>
      userData || {
        living_condition: 'alone',
        income_level: 'low',
        age: 76,
        chronic_diseases: ['hypertension', 'diabetes', 'cardiovascular'],
      },
    [userData],
  );

  const [liveEnv, setLiveEnv] = useState(null);
  const [envStatus, setEnvStatus] = useState('idle');
  const [envError, setEnvError] = useState('');

  const fallbackEnv = useMemo(
    () => ({
      pm25: environmentalData?.pm25 ?? 55,
      pm10: environmentalData?.pm10 ?? 70,
      temperatureC: null,
      weatherLabel: '날씨',
      locationLabel: '기본값',
      fetchedAt: null,
    }),
    [environmentalData],
  );

  const effectiveEnv = useMemo(() => {
    if (liveEnv) return { ...liveEnv };
    return { ...fallbackEnv };
  }, [liveEnv, fallbackEnv]);

  const { totalScore, status } = useMemo(
    () =>
      calculateHealthRiskScore({
        environmental: { pm25: effectiveEnv.pm25, pm10: effectiveEnv.pm10 },
        socioEconomic: {
          livingAlone: dummyUser.living_condition === 'alone',
          incomeLevel: dummyUser.income_level,
        },
        bioMedical: {
          age: dummyUser.age,
          chronicDiseases: dummyUser.chronic_diseases || [],
          medicationAdherence: medicationTaken,
        },
      }),
    [effectiveEnv.pm25, effectiveEnv.pm10, dummyUser, medicationTaken],
  );

  const [userSettings, setUserSettings] = useState(() => {
    const saved = loadDashboardPreferences();
    if (saved?.mission1 && saved?.mission2 && saved?.hospital) {
      return saved;
    }
    return {
      mission1: { icon: '💊', text: '약 먹기' },
      mission2: { icon: '💧', text: '물 마시기' },
      hospital: defaultHospital(userData),
    };
  });

  const [tempSettings, setTempSettings] = useState(userSettings);

  const loadEnv = useCallback(async () => {
    setEnvStatus('loading');
    setEnvError('');
    try {
      const coords = await resolveUserCoordinates();
      const snap = await fetchEnvironmentSnapshot(coords);
      setLiveEnv(snap);
      setEnvStatus('ok');
    } catch (e) {
      console.warn(e);
      setEnvError(e?.message || '날씨·대기 정보를 불러오지 못했어요.');
      setEnvStatus('error');
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadEnv();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadEnv]);

  const personalizationKey = useMemo(
    () =>
      [
        effectiveEnv.pm25,
        effectiveEnv.temperatureC ?? '',
        status,
        dummyUser.age,
        dummyUser.living_condition,
        dummyUser.income_level,
        (dummyUser.chronic_diseases || []).join(','),
      ].join('|'),
    [
      effectiveEnv.pm25,
      effectiveEnv.temperatureC,
      status,
      dummyUser.age,
      dummyUser.living_condition,
      dummyUser.income_level,
      dummyUser.chronic_diseases,
    ],
  );

  useEffect(() => {
    if (prefsLockedRef.current) return;
    const m = buildPersonalizedMissions(dummyUser, effectiveEnv, status);
    setUserSettings((prev) => {
      if (prev.mission1.text === m.mission1.text && prev.mission2.text === m.mission2.text) return prev;
      return {
        ...prev,
        mission1: m.mission1,
        mission2: m.mission2,
        hospital: prev.hospital?.name ? prev.hospital : defaultHospital(userData),
      };
    });
  }, [personalizationKey, dummyUser, effectiveEnv, status, userData]);

  const briefingLines = useMemo(
    () =>
      buildMorningBriefing({
        persona: activePersona,
        userData: dummyUser,
        status,
        env: effectiveEnv,
      }),
    [activePersona, dummyUser, status, effectiveEnv],
  );

  const socialHints = useMemo(
    () => socialPrescriptionHints(status, dummyUser),
    [status, dummyUser],
  );

  const getReminderTitle = useCallback(() => '도란도란 · 오늘의 안내', []);
  const getReminderBody = useCallback(
    () => briefingLines[0] || '오늘도 편안한 하루 되세요.',
    [briefingLines],
  );
  useMorningReminder({ getTitle: getReminderTitle, getBody: getReminderBody, active: true });
  const reminderUi = useMorningReminderUi();

  const getStatusColor = (s) =>
    s === 'red' ? 'var(--color-critical)' : s === 'yellow' ? 'var(--color-warning)' : 'var(--color-success)';
  const getGradient = (s) =>
    s === 'red' ? 'var(--gradient-danger)' : s === 'yellow' ? 'var(--gradient-caution)' : 'var(--gradient-safe)';
  const statusText = status === 'green' ? '안전' : status === 'yellow' ? '주의' : '위험';

  const personaDetails = {
    grandchild: { icon: '👶', title: '손주', buttonText: '손주와 도란도란 대화하기' },
    doctor: { icon: '👨‍⚕️', title: '주치의', buttonText: '주치의와 건강 상담하기' },
    friend: { icon: '🤝', title: '동네 친구', buttonText: '친구와 이야기 나누기' },
  };
  const activeDetails = personaDetails[activePersona] || personaDetails.grandchild;

  const handleSaveSettings = () => {
    prefsLockedRef.current = true;
    saveDashboardPreferences(tempSettings);
    setUserSettings(tempSettings);
    setShowSettingsModal(false);
  };

  const telHref = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits ? `tel:${digits}` : 'tel:';
  };

  return (
    <div style={{ backgroundColor: 'var(--color-surface-soft)', minHeight: '100vh', paddingBottom: '40px', position: 'relative' }}>
      <div
        style={{
          background: getGradient(status),
          padding: '52px 20px 100px',
          textAlign: 'center',
          borderBottomLeftRadius: '40px',
          borderBottomRightRadius: '40px',
          transition: 'background 0.5s ease',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setTempSettings(userSettings);
            setShowSettingsModal(true);
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <Settings size={28} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '40px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '50%' }}>
            {activeDetails.icon}
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: 'var(--font-heading-sm)', margin: 0, fontWeight: 700 }}>환영합니다!</h2>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--color-ink-deep)', opacity: 0.85 }}>
              오늘도 {activeDetails.title}와 함께 건강 챙겨요.
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: '-72px' }}>
        <div className="card-floating" style={{ padding: '28px 22px', textAlign: 'left', transition: 'all 0.3s ease' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
            오늘의 한 줄 브리핑
          </div>
          {briefingLines.map((line, i) => (
            <p key={i} style={{ fontSize: '15px', lineHeight: 1.65, color: 'var(--color-ink-deep)', margin: i ? '8px 0 0' : 0 }}>
              {line}
            </p>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: '14px' }}>
        <div className="card-floating" style={{ padding: '22px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <MapPin size={20} color="var(--color-primary)" aria-hidden />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: 'var(--color-ink)', fontWeight: 600 }}>{effectiveEnv.locationLabel}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink-deep)' }}>
                {effectiveEnv.temperatureC != null ? `${Math.round(effectiveEnv.temperatureC)}° · ` : ''}
                {effectiveEnv.weatherLabel}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-ink)', marginTop: '4px' }}>
                PM2.5 {effectiveEnv.pm25} · PM10 {effectiveEnv.pm10}
                {liveEnv?.fetchedAt ? ` · 갱신 ${new Date(liveEnv.fetchedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : ''}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={loadEnv}
            disabled={envStatus === 'loading'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '999px',
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: envStatus === 'loading' ? 'wait' : 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <span className={envStatus === 'loading' ? 'spin-env' : ''} style={{ display: 'inline-flex' }}>
              <RefreshCw size={16} aria-hidden />
            </span>
            새로고침
          </button>
          <style>{`.spin-env{animation:spin360 0.9s linear infinite}@keyframes spin360{to{transform:rotate(360deg)}}`}</style>
        </div>
        {envError ? (
          <p style={{ fontSize: '13px', color: 'var(--color-critical)', marginTop: '8px', textAlign: 'center' }}>{envError}</p>
        ) : null}
      </div>

      <div style={{ padding: '0 20px', marginTop: '16px' }}>
        <div className="card-floating" style={{ padding: '36px 28px', textAlign: 'center', transition: 'all 0.3s ease' }}>
          <h1 style={{ fontSize: 'var(--font-heading-md)', fontWeight: 700, marginBottom: '8px' }}>오늘의 건강 리포트</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-ink)', marginBottom: '20px' }}>
            환경·사회·건강을 4:3:3으로 반영한 점수예요.
          </p>

          <div
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: `14px solid ${getStatusColor(status)}`,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 20px ${getStatusColor(status)}33`,
              transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
            }}
          >
            <span style={{ fontSize: 'var(--font-hero)', fontWeight: 700, color: 'var(--color-ink-deep)' }}>{totalScore}</span>
            <span style={{ fontSize: 'var(--font-heading-sm)', fontWeight: 700, color: getStatusColor(status) }}>{statusText}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '22px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: 'var(--font-heading-sm)', fontWeight: 700, margin: 0 }}>오늘의 미션</h3>
          <span style={{ fontSize: '12px', color: 'var(--color-ink)' }}>맞춤 제안</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
          <button
            type="button"
            className="card-meta"
            onClick={() => setMedicationTaken(!medicationTaken)}
            style={{
              padding: '18px',
              textAlign: 'center',
              cursor: 'pointer',
              border: medicationTaken ? '2px solid var(--color-success)' : '1px solid rgba(0,0,0,0.06)',
              background: 'white',
              borderRadius: '16px',
            }}
          >
            <div style={{ fontSize: '30px', marginBottom: '6px' }}>{medicationTaken ? '💖' : userSettings.mission1.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: medicationTaken ? 'var(--color-success)' : 'inherit' }}>
              {userSettings.mission1.text}
            </div>
            <div
              style={{
                marginTop: '10px',
                width: '44px',
                height: '26px',
                backgroundColor: medicationTaken ? 'var(--color-success)' : 'var(--color-surface-soft)',
                borderRadius: '13px',
                margin: '10px auto 0',
                display: 'flex',
                justifyContent: medicationTaken ? 'flex-end' : 'flex-start',
                transition: 'all 0.25s',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  backgroundColor: medicationTaken ? '#fff' : 'var(--color-ink)',
                  borderRadius: '50%',
                  margin: '2px',
                }}
              />
            </div>
          </button>

          <button
            type="button"
            className="card-meta"
            onClick={() => setWaterDrank(!waterDrank)}
            style={{
              padding: '18px',
              textAlign: 'center',
              cursor: 'pointer',
              border: waterDrank ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.06)',
              background: 'white',
              borderRadius: '16px',
            }}
          >
            <div style={{ fontSize: '30px', marginBottom: '6px' }}>{waterDrank ? '🌊' : userSettings.mission2.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: waterDrank ? 'var(--color-primary)' : 'inherit' }}>
              {userSettings.mission2.text}
            </div>
            <div
              style={{
                marginTop: '10px',
                width: '44px',
                height: '26px',
                backgroundColor: waterDrank ? 'var(--color-primary)' : 'var(--color-surface-soft)',
                borderRadius: '13px',
                margin: '10px auto 0',
                display: 'flex',
                justifyContent: waterDrank ? 'flex-end' : 'flex-start',
                transition: 'all 0.25s',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  backgroundColor: waterDrank ? '#fff' : 'var(--color-ink)',
                  borderRadius: '50%',
                  margin: '2px',
                }}
              />
            </div>
          </button>
        </div>

        {(status === 'yellow' || status === 'red') && (
          <div className="card-floating" style={{ padding: '18px', marginBottom: '18px', textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '10px' }}>{socialHints.headline}</div>
            {socialHints.items.map((it, idx) => (
              <div key={idx} style={{ padding: '10px 0', borderTop: idx ? '1px solid #eef2f7' : 'none' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>
                  {it.icon} {it.title}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-ink)', marginTop: '4px', lineHeight: 1.55 }}>{it.body}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            className="button-pill-primary"
            onClick={() => setShowChatModal(true)}
            style={{
              padding: '16px',
              fontSize: '17px',
              fontWeight: 700,
              borderRadius: 'var(--rounded-full)',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,100,224,0.3)',
            }}
          >
            {activeDetails.buttonText}
          </button>

          <div className="card-meta" style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>{userSettings.hospital.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-ink)', marginTop: '4px' }}>{userSettings.hospital.lastVisit}</div>
            </div>
            <a
              href={telHref(userSettings.hospital.phone)}
              style={{
                padding: '14px 18px',
                fontSize: '15px',
                fontWeight: 800,
                borderRadius: 'var(--rounded-full)',
                border: 'none',
                backgroundColor: 'var(--color-critical)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(225,29,72,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <Phone size={18} fill="currentColor" aria-hidden /> 전화
            </a>
          </div>
        </div>
      </div>

      {showChatModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="card-floating" style={{ width: '100%', maxWidth: '360px', padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>{activeDetails.icon}</div>
            <h2 style={{ fontSize: 'var(--font-heading-md)', fontWeight: 800, marginBottom: '12px' }}>{activeDetails.title}</h2>
            <p style={{ fontSize: 'var(--font-body)', lineHeight: 1.65, marginBottom: '26px' }}>
              {dailyCheckIn[activePersona] ? dailyCheckIn[activePersona](totalScore, status) : '안녕하세요!'}
            </p>
            <button
              type="button"
              onClick={() => setShowChatModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 800,
                borderRadius: 'var(--rounded-full)',
                border: '1px solid var(--color-ink)',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              대화 마치기
            </button>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="card-floating" style={{ width: '100%', maxWidth: '400px', padding: '26px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: 'var(--font-heading-sm)', fontWeight: 800, margin: 0 }}>맞춤 설정</h2>
              <button type="button" onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink-deep)' }}>미션 1</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={tempSettings.mission1.icon}
                  onChange={(e) => setTempSettings({ ...tempSettings, mission1: { ...tempSettings.mission1, icon: e.target.value } })}
                  style={{ width: '56px', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '16px' }}
                  placeholder="이모지"
                />
                <input
                  type="text"
                  value={tempSettings.mission1.text}
                  onChange={(e) => setTempSettings({ ...tempSettings, mission1: { ...tempSettings.mission1, text: e.target.value } })}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px' }}
                  placeholder="미션 이름"
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink-deep)' }}>미션 2</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={tempSettings.mission2.icon}
                  onChange={(e) => setTempSettings({ ...tempSettings, mission2: { ...tempSettings.mission2, icon: e.target.value } })}
                  style={{ width: '56px', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '16px' }}
                  placeholder="이모지"
                />
                <input
                  type="text"
                  value={tempSettings.mission2.text}
                  onChange={(e) => setTempSettings({ ...tempSettings, mission2: { ...tempSettings.mission2, text: e.target.value } })}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px' }}
                  placeholder="미션 이름"
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--color-ink-deep)' }}>단골 병원</h4>
              <input
                type="text"
                value={tempSettings.hospital.name}
                onChange={(e) => setTempSettings({ ...tempSettings, hospital: { ...tempSettings.hospital, name: e.target.value } })}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '8px', boxSizing: 'border-box', fontSize: '16px' }}
                placeholder="병원 이름"
              />
              <input
                type="text"
                value={tempSettings.hospital.phone}
                onChange={(e) => setTempSettings({ ...tempSettings, hospital: { ...tempSettings.hospital, phone: e.target.value } })}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '8px', boxSizing: 'border-box', fontSize: '16px' }}
                placeholder="전화번호"
              />
              <input
                type="text"
                value={tempSettings.hospital.lastVisit}
                onChange={(e) => setTempSettings({ ...tempSettings, hospital: { ...tempSettings.hospital, lastVisit: e.target.value } })}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px' }}
                placeholder="메모 (예: 최근 방문)"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 800,
                borderRadius: 'var(--rounded-full)',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,100,224,0.3)',
              }}
            >
              저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthDashboard;

// HCI 개선: 응급 버튼 컴포넌트
const EmergencyButton = () => {
  const handleEmergency = () => {
    if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
    import('../utils/aiService').then(({ speakText }) => {
      speakText("위급 상황을 감지했습니다. 119에 연결합니다.");
    });
    setTimeout(() => {
      window.location.href = 'tel:119';
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '400px',
      zIndex: 2000
    }}>
      <button
        onClick={handleEmergency}
        style={{
          width: '100%',
          padding: '24px',
          backgroundColor: '#FF0000',
          color: '#FFFFFF',
          fontSize: '28px',
          fontWeight: '900',
          borderRadius: '20px',
          border: '5px solid #FFFF00',
          boxShadow: '0 10px 30px rgba(255,0,0,0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px'
        }}
      >
        <span style={{ fontSize: '40px' }}>🚨</span>
        응급 버튼 (119)
      </button>
      <EmergencyButton />
    </div>
  );
};
