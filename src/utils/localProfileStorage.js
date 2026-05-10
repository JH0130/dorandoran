const STORAGE_KEY = 'doran-doran-local-profile-v1';

/**
 * 브라우저(폰 포함) 로컬 저장소에 사용자 프로필을 JSON으로 저장합니다.
 * 로그인 없이 접속했을 때도 동일 기기에서 복구됩니다.
 */
export function loadLocalProfile() {
  try {
    const raw =
      typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * 로컬 프로필 덮어쓰기(얕게 병합). 실패 시 false.
 */
export function saveLocalProfile(partialOrFull) {
  try {
    if (typeof localStorage === 'undefined') return false;
    const prev = loadLocalProfile() || {};
    const next = {
      ...prev,
      ...partialOrFull,
      updatedAtLocal: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch (e) {
    console.warn('local profile 저장 실패', e);
    return false;
  }
}

/** 로컬에 저장된 내용 삭제 */
export function clearLocalProfile() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** 대시보드 맞춤(미션 문구·병원 카드 등) — 사용자 건강 프로필과 같은 JSON에 병합 저장 */
export function loadDashboardPreferences() {
  const p = loadLocalProfile();
  return p?.dashboardPreferences ?? null;
}

export function saveDashboardPreferences(prefs) {
  return saveLocalProfile({ dashboardPreferences: prefs });
}
