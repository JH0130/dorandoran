/**
 * 규칙 기반 개인화 — 미션, 브리핑, 소셜 프리스크립션 힌트
 * (LLM 없이 청사진 방향의 UX를 채움)
 */

function honorific(userData) {
  const n = (userData?.displayName || userData?.name || '').trim();
  return n || '어르신';
}

/**
 * @param {object} userData
 * @param {{ pm25?: number, pm10?: number, temperatureC?: number | null, weatherLabel?: string }} env
 * @param {'green'|'yellow'|'red'} riskStatus
 */
export function buildPersonalizedMissions(userData, env, riskStatus) {
  const pm25 = env?.pm25 ?? 0;
  const diseases = Array.isArray(userData?.chronic_diseases) ? userData.chronic_diseases : [];
  const hot = env?.temperatureC != null && env.temperatureC >= 30;

  let mission1 = { icon: '💊', text: '오늘 약 챙겨 드시기' };
  let mission2 = { icon: '💧', text: '물 한 컵 천천히 마시기' };

  if (diseases.includes('diabetes')) {
    mission1 = { icon: '🩺', text: '혈당·발 상태 가볍게 확인' };
  }
  if (diseases.includes('periodontitis')) {
    mission2 = { icon: '🦷', text: '부드러운 칫솔로 잇몸 마사지' };
  }
  if (diseases.includes('cardiovascular') || diseases.includes('hypertension')) {
    mission2 = { icon: '🚶', text: '실내 가볍게 10분 걷기' };
  }

  if (pm25 >= 55 || riskStatus === 'red') {
    mission2 = { icon: '🏠', text: '창문 닫고 실내 공기 정화' };
  } else if (pm25 >= 35 || riskStatus === 'yellow') {
    mission2 = { icon: '😷', text: '외출 시 마스크 챙기기' };
  }

  if (hot) {
    mission1 = { icon: '🧊', text: '시원한 물 자주 조금씩' };
  }

  return { mission1, mission2 };
}

/**
 * @param {'grandchild'|'doctor'|'friend'} persona
 */
export function buildMorningBriefing({ persona, userData, status, env }) {
  const who = honorific(userData);
  const pm = env?.pm25 != null ? `${env.pm25}` : '?';
  const wx = env?.weatherLabel || '날씨';
  const temp =
    env?.temperatureC != null ? `${Math.round(env.temperatureC)}°` : '';

  const riskLine =
    status === 'red'
      ? '오늘은 건강 점수가 다소 높게 나왔어요. 무리하지 말고 휴식을 우선해요.'
      : status === 'yellow'
        ? '조금만 더 챙기면 좋겠어요. 약·물·실내 공기부터 천천히요.'
        : '지금은 비교적 안정적인 편이에요. 가벼운 루틴만 유지해요.';

  const airLine =
    env?.pm25 != null && env.pm25 >= 55
      ? `미세먼지(PM2.5)가 ${pm}㎍/m³ 수준이에요. 실외는 짧게!`
      : env?.pm25 != null && env.pm25 >= 35
        ? `대기는 한때씩 민감할 수 있어요(PM2.5 ${pm}).`
        : `대기는 비교적 양호한 편이에요(PM2.5 ${pm}).`;

  if (persona === 'doctor') {
    return [
      `${who}님, 오늘 브리핑입니다. ${riskLine}`,
      `${airLine} ${temp ? `기온 ${temp}, ${wx}.` : wx + '.'}`,
      '이상 증상이 있으면 단골 의료기관에 문의하세요.',
    ];
  }
  if (persona === 'friend') {
    return [
      `${who}님! ${riskLine}`,
      `${airLine} ${temp ? `오늘은 ${wx}, ${temp}예요.` : ''}`.trim(),
      '힘들면 바로 전화해요. 오늘도 한 걸음씩!',
    ];
  }
  return [
    `${who}님, ${riskLine}`,
    `${airLine} ${temp ? `날씨는 ${wx}, ${temp}래요.` : ''}`.trim(),
    '오늘의 미션만 천천히 해도 충분해요. 응원해요!',
  ];
}

/**
 * @param {'green'|'yellow'|'red'} status
 */
export function socialPrescriptionHints(status, userData) {
  const alone = userData?.living_condition === 'alone';
  const items = [];

  if (status === 'red' || status === 'yellow') {
    items.push({
      icon: '🏥',
      title: '가까운 의료·약국',
      body: '단골 병원 전화 버튼을 눌러 상담해 보세요. 응급이면 119입니다.',
    });
    items.push({
      icon: '🤝',
      title: '복지·돌봄 상담',
      body: alone
        ? '혼자 계시면 동주민센터 복지 상담(129번 등)도 참고해 보세요.'
        : '가족과 함께 동주민센터 복지 상담을 알아보셔도 좋아요.',
    });
  } else {
    items.push({
      icon: '🌿',
      title: '유지 루틴',
      body: '가벼운 산책·스트레칭으로 컨디션을 유지해 보세요.',
    });
  }

  if (Array.isArray(userData?.chronic_diseases) && userData.chronic_diseases.includes('periodontitis')) {
    items.push({
      icon: '🦷',
      title: '치주 건강',
      body: '가까운 치과·구강 검진 일정을 한 번 확인해 보세요.',
    });
  }

  return { headline: '오늘의 맞춤 안내', items };
}
