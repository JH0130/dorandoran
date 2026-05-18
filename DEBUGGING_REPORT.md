# 🔍 도란도란 (dorandoran) - 전체 프로젝트 디버깅 리포트

## 📋 프로젝트 개요
- **프로젝트명**: dorandoran (도란도란)
- **설명**: 어르신 대상 AI 건강 수호자 앱 (Echo-Guardian)
- **기술스택**: React 19, Vite, Firebase, Google Gemini API, Open-Meteo API
- **배포**: Vercel

---

## ⚠️ 발견된 주요 문제점

### 1. **❌ 과도한 AI API 사용 (높은 비용 위험)**

#### 문제 상황
- **파일**: `src/utils/openaiService.js` (현재 비활성화 상태)
- **이슈**: OpenAI API(gpt-4o-mini)를 사용하는 세 가지 기능
  - `getOnboardingResponse()` - 온보딩 채팅 (매번 호출)
  - `getChatResponse()` - 일반 대화 응답 (매번 호출)
  - `transcribeAudio()` - Whisper STT (음성 녹음마다)
  - `textToSpeech()` - OpenAI TTS (응답 출력마다)

#### 💰 비용 분석
```
GPT-4o-mini: $0.15 / 1M 입력 토큰, $0.60 / 1M 출력 토큰
매일 100명 사용자 × 5회 대화 = 500회
→ 하루 최대 $2~5 (월 $60~150)
```

#### ✅ 해결 방안
1. **Google Gemini로 통합 (현재 상태 유지 권장)**
   - `src/utils/aiService.js`는 Gemini 사용 ✓
   - OpenAI 서비스는 완전히 제거하거나 보관용으로 변경

2. **요청 캐싱 및 스로틀링**
   - 5분 내 동일 요청은 캐시 사용
   - 1시간에 최대 20회 AI 요청 제한

---

### 2. **⚠️ 환경 데이터 API 중복/과다 호출**

#### 문제 상황
- **파일**: `src/components/HealthDashboard.jsx` (Line 106~126)
- **이슈**: 컴포넌트 로드 시 매번 `fetchEnvironmentSnapshot()` 호출
  - Open-Meteo API는 무료지만 **CORS 문제 가능**
  - 새로고침 버튼 누를 때마다 추가 호출
  - 동시에 여러 컴포넌트에서 호출 가능

#### 호출 흐름
```javascript
useEffect(() => {
  const id = window.setTimeout(() => {
    void loadEnv();  // ← 매번 호출
  }, 0);
  return () => window.clearTimeout(id);
}, [loadEnv]);
```

#### ✅ 해결 방안
1. **캐싱 추가** (5분 유효)
2. **스로틀링** (10초 최소 간격)
3. **재시도 로직** (2회 재시도, 지수 백오프)

---

### 3. **🔴 OpenAI API 키 노출 위험**

#### 문제 상황
```javascript
// .env 파일에 노출됨 (현재는 사용 안 함)
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY?.replace(/[^\x00-\x7F]/g, "").trim();
```

#### 위험성
- `.env` 파일이 공개 저장소에 커밋되면 보안 침해
- 클라이언트 사이드에서 API 키 노출

#### ✅ 해결 방안
1. `.env` 파일을 `.gitignore`에 추가
2. OpenAI 사용 필요 시 **백엔드 프록시 사용**
3. 현재는 Gemini만 사용 (클라이언트 키도 제한된 권한으로)

---

### 4. **📊 요청 모니터링 부재**

#### 문제 상황
- 사용자가 버튼을 연타하면 무제한 API 호출
- 실시간 요청 카운팅 없음
- 한도 초과 감지 불가

#### 예시
```javascript
// HealthDashboard.jsx - 새로고침 버튼
<button onClick={loadEnv} disabled={envStatus === 'loading'}>
  새로고침
</button>
// loading 상태만 확인, 한도는 없음
```

#### ✅ 해결 방안
- `localStorage`에 요청 시간 기록
- 1시간 내 요청 수 추적
- 한도 초과 시 사용자 피드백

---

## 📁 현재 코드 구조 분석

```
src/
├── utils/
│   ├── aiService.js ✅ (Gemini 사용 - 추천)
│   ├── openaiService.js ❌ (사용 안 함 - 제거 권장)
│   ├── environmentService.js ⚠️ (캐싱 없음)
│   ├── apiOptimization.js ✨ (신규 생성됨)
│   └── ...
├── components/
│   ├── HealthDashboard.jsx ⚠️ (API 호출 최적화 필요)
│   ├── OnboardingChat.jsx ⚠️ (AI 요청 제한 필요)
│   └── ...
└── firebase.js
```

---

## 🛠️ 즉시 적용 가능한 개선 사항

### Step 1: API 최적화 유틸 적용
✅ 생성됨: `src/utils/apiOptimization.js`

```javascript
// 캐싱
getCachedEnvironmentData()
setCachedEnvironmentData(data)

// 스로틀링
canFetchEnvironmentData()

// AI 요청 제한
canMakeAIRequest()
logAIRequest()

// 재시도
fetchWithRetry(url, options, maxRetries)
```

### Step 2: HealthDashboard.jsx 업데이트 (추천)
```javascript
// 변경 전
const snap = await fetchEnvironmentSnapshot(coords);

// 변경 후
const snap = await fetchEnvironmentSnapshotOptimized(coords);
```

### Step 3: OnboardingChat.jsx & 대화 기능 업데이트
```javascript
// 변경 전
const response = await getChatResponse(messages);

// 변경 후
if (!canMakeAIRequest()) {
  alert('AI 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.');
  return;
}
const response = await getAIResponse(messages);
logAIRequest();
```

---

## 📊 권장 사항 정리

| 항목 | 현재 상태 | 권장 | 우선순위 |
|------|----------|------|---------|
| AI 서비스 | Gemini + OpenAI 혼용 | **Gemini만 사용** | 🔴 높음 |
| 환경 데이터 | 캐싱 없음 | **5분 캐시 추가** | 🟡 중간 |
| 요청 제한 | 없음 | **1시간 20회 제한** | 🟡 중간 |
| API 키 보안 | `.env` 노출 가능 | **백엔드 프록시 검토** | 🔴 높음 |
| 에러 처리 | 기본적 | **지수 백오프 재시도** | 🟢 낮음 |

---

## 🚀 다음 단계

1. **즉시**: OpenAI 서비스 제거 또는 비활성화
2. **이번 주**: `apiOptimization.js` 적용
3. **다음 주**: 환경 데이터 & AI 요청 통합 모니터링 추가
4. **월말**: 백엔드 프록시 검토 (필요시)

---

## 💡 추가 참고사항

### .gitignore 확인
```bash
# .env 파일이 추적되지 않는지 확인
cat .gitignore | grep "\.env"
```

### 로컬 테스트
```bash
# API 최적화 유틸 테스트
// 브라우저 콘솔에서
localStorage.getItem('ai_request_log')  // AI 요청 기록 확인
localStorage.getItem('env_snapshot_cache')  // 환경 캐시 확인
```

---

**작성**: 2026-05-18  
**검토 대상**: JH0130/dorandoran
