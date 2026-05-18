// ============================================================
// 🎯 미션 커스터마이징 & 관리 서비스
// ============================================================

const MISSIONS_KEY = 'doran-doran-missions';
const MISSION_HISTORY_KEY = 'doran-doran-mission-history';

/**
 * 기본 미션 템플릿
 */
const DEFAULT_MISSIONS = [
  { id: 1, icon: '💊', text: '약 먹기', category: 'health', completed: false, completedAt: null },
  { id: 2, icon: '💧', text: '물 마시기', category: 'health', completed: false, completedAt: null },
];

/**
 * 로컬에서 오늘의 미션 로드
 */
export function loadTodayMissions() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(MISSIONS_KEY) : null;
    if (!raw) return { date: today, missions: JSON.parse(JSON.stringify(DEFAULT_MISSIONS)) };
    
    const data = JSON.parse(raw);
    if (data.date !== today) {
      // 날짜가 바뀌었으면 미션 리셋
      return {
        date: today,
        missions: JSON.parse(JSON.stringify(DEFAULT_MISSIONS)),
      };
    }
    return data;
  } catch {
    const today = new Date().toISOString().split('T')[0];
    return { date: today, missions: JSON.parse(JSON.stringify(DEFAULT_MISSIONS)) };
  }
}

/**
 * 오늘의 미션 저장
 */
export function saveTodayMissions(missions) {
  try {
    if (typeof localStorage === 'undefined') return false;
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(MISSIONS_KEY, JSON.stringify({ date: today, missions }));
    return true;
  } catch (e) {
    console.warn('미션 저장 실패', e);
    return false;
  }
}

/**
 * 미션 완료 토글
 */
export function toggleMissionCompletion(missionId) {
  const data = loadTodayMissions();
  const mission = data.missions.find(m => m.id === missionId);
  if (mission) {
    mission.completed = !mission.completed;
    mission.completedAt = mission.completed ? new Date().toISOString() : null;
  }
  saveTodayMissions(data.missions);
  return mission;
}

/**
 * 새 미션 추가
 */
export function addMission(icon, text, category = 'custom') {
  const data = loadTodayMissions();
  const newMission = {
    id: Math.max(...data.missions.map(m => m.id), 0) + 1,
    icon,
    text,
    category,
    completed: false,
    completedAt: null,
  };
  data.missions.push(newMission);
  saveTodayMissions(data.missions);
  return newMission;
}

/**
 * 미션 수정
 */
export function editMission(missionId, updates) {
  const data = loadTodayMissions();
  const mission = data.missions.find(m => m.id === missionId);
  if (mission) {
    Object.assign(mission, updates);
  }
  saveTodayMissions(data.missions);
  return mission;
}

/**
 * 미션 삭제
 */
export function deleteMission(missionId) {
  const data = loadTodayMissions();
  data.missions = data.missions.filter(m => m.id !== missionId);
  saveTodayMissions(data.missions);
  return true;
}

/**
 * 미션 완료율 계산
 */
export function calculateMissionCompletionRate(missions) {
  if (!missions || missions.length === 0) return 0;
  const completed = missions.filter(m => m.completed).length;
  return Math.round((completed / missions.length) * 100);
}

/**
 * 미션 히스토리 저장
 */
export function saveMissionHistory(date, missions, completionRate) {
  try {
    if (typeof localStorage === 'undefined') return false;
    let history = [];
    const raw = localStorage.getItem(MISSION_HISTORY_KEY);
    if (raw) {
      history = JSON.parse(raw);
    }
    
    // 중복 제거 (같은 날짜 존재 시 업데이트)
    history = history.filter(h => h.date !== date);
    history.push({ date, missions, completionRate, timestamp: new Date().toISOString() });
    
    // 최근 90일만 유지
    history = history.slice(-90);
    localStorage.setItem(MISSION_HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (e) {
    console.warn('미션 히스토리 저장 실패', e);
    return false;
  }
}

/**
 * 미션 히스토리 로드
 */
export function loadMissionHistory() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(MISSION_HISTORY_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
