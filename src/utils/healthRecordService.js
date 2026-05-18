// ============================================================
// 📋 건강 기록 서비스 (약, 혈압, 혈당, 메모 등)
// ============================================================

const HEALTH_RECORDS_KEY = 'doran-doran-health-records';

/**
 * 건강 기록 타입 정의
 */
export const RECORD_TYPES = {
  medication: { label: '💊 약 복용', color: '#FFE5E5', icon: '💊' },
  bloodPressure: { label: '🩸 혈압', color: '#E5F5FF', icon: '🩸' },
  bloodSugar: { label: '🍬 혈당', color: '#FFF5E5', icon: '🍬' },
  weight: { label: '⚖️ 몸무게', color: '#E5FFE5', icon: '⚖️' },
  symptom: { label: '😷 증상', color: '#F5E5FF', icon: '😷' },
  mood: { label: '😊 기분', color: '#FFE5F5', icon: '😊' },
  exercise: { label: '🏃 운동', color: '#E5FFF5', icon: '🏃' },
  note: { label: '📝 메모', color: '#F0F0F0', icon: '📝' },
};

/**
 * 날짜별 건강 기록 로드
 */
export function loadHealthRecords(date) {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(HEALTH_RECORDS_KEY) : null;
    if (!raw) return [];
    
    const allRecords = JSON.parse(raw);
    return allRecords.filter(r => r.date === date) || [];
  } catch {
    return [];
  }
}

/**
 * 모든 건강 기록 로드
 */
export function loadAllHealthRecords() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(HEALTH_RECORDS_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * 건강 기록 추가
 */
export function addHealthRecord(recordType, value, notes = '') {
  try {
    if (typeof localStorage === 'undefined') return null;
    
    const today = new Date().toISOString().split('T')[0];
    let records = loadAllHealthRecords();
    
    const newRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: today,
      type: recordType,
      value,
      notes,
      timestamp: new Date().toISOString(),
    };
    
    records.push(newRecord);
    localStorage.setItem(HEALTH_RECORDS_KEY, JSON.stringify(records));
    return newRecord;
  } catch (e) {
    console.warn('건강 기록 추가 실패', e);
    return null;
  }
}

/**
 * 건강 기록 수정
 */
export function editHealthRecord(recordId, updates) {
  try {
    if (typeof localStorage === 'undefined') return null;
    
    let records = loadAllHealthRecords();
    const record = records.find(r => r.id === recordId);
    
    if (!record) return null;
    
    Object.assign(record, updates, { updatedAt: new Date().toISOString() });
    localStorage.setItem(HEALTH_RECORDS_KEY, JSON.stringify(records));
    return record;
  } catch (e) {
    console.warn('건강 기록 수정 실패', e);
    return null;
  }
}

/**
 * 건강 기록 삭제
 */
export function deleteHealthRecord(recordId) {
  try {
    if (typeof localStorage === 'undefined') return false;
    
    let records = loadAllHealthRecords();
    records = records.filter(r => r.id !== recordId);
    localStorage.setItem(HEALTH_RECORDS_KEY, JSON.stringify(records));
    return true;
  } catch (e) {
    console.warn('건강 기록 삭제 실패', e);
    return false;
  }
}

/**
 * 날짜 범위의 건강 기록 통계
 */
export function getHealthRecordsStats(startDate, endDate, recordType) {
  const allRecords = loadAllHealthRecords();
  const filtered = allRecords.filter(r => 
    r.type === recordType &&
    r.date >= startDate &&
    r.date <= endDate
  );
  
  if (filtered.length === 0) return null;
  
  // 숫자 값만 추출
  const values = filtered
    .map(r => parseFloat(r.value))
    .filter(v => !isNaN(v));
  
  if (values.length === 0) return null;
  
  return {
    count: filtered.length,
    avg: (values.reduce((a, b) => a + b) / values.length).toFixed(1),
    min: Math.min(...values),
    max: Math.max(...values),
    latest: filtered[filtered.length - 1].value,
    records: filtered,
  };
}

/**
 * 특정 날짜의 기록 타입별 요약
 */
export function getDailySummary(date) {
  const records = loadHealthRecords(date);
  const summary = {};
  
  Object.keys(RECORD_TYPES).forEach(type => {
    const typeRecords = records.filter(r => r.type === type);
    if (typeRecords.length > 0) {
      summary[type] = {
        count: typeRecords.length,
        records: typeRecords,
        label: RECORD_TYPES[type].label,
      };
    }
  });
  
  return summary;
}

/**
 * 건강 기록 백업 (JSON 다운로드)
 */
export function exportHealthRecords() {
  const records = loadAllHealthRecords();
  return JSON.stringify(records, null, 2);
}

/**
 * 건강 기록 복구 (JSON 업로드)
 */
export function importHealthRecords(jsonData) {
  try {
    if (typeof localStorage === 'undefined') return false;
    
    const records = JSON.parse(jsonData);
    if (!Array.isArray(records)) return false;
    
    localStorage.setItem(HEALTH_RECORDS_KEY, JSON.stringify(records));
    return true;
  } catch (e) {
    console.warn('건강 기록 복구 실패', e);
    return false;
  }
}
