import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================
// 🌟 Google Gemini AI 서비스 (무료!)
// VITE_GEMINI_API_KEY를 .env 파일에 설정해 주세요.
// ============================================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// AI 응답 생성 (Onboarding & Chat 통합)
export const getAIResponse = async (messages, personaType = 'grandchild', isOnboarding = false) => {
  if (!genAI) throw new Error('Gemini API 키가 설정되지 않았습니다.');

  const systemPrompt = isOnboarding 
    ? `당신은 '도란도란' 앱의 따뜻한 AI 수호자입니다. 
       역할: ${personaType === 'grandchild' ? '친절한 손주' : personaType === 'doctor' ? '다정한 주치의' : '동네 친구'}
       목표: 어르신과 자연스럽게 대화하며 성함, 나이, 복약 정보, 기저질환, 보호자 연락처 등을 파악하세요.
       규칙: 한 번에 한 가지 질문만 하고, 한국어로 아주 쉽고 따뜻하게 말하세요. 
       모든 정보 파악 시 "이제 도란도란이 어르신을 잘 도와드릴 수 있을 것 같아요!"라고 하세요.`
    : `당신은 '도란도란' 앱의 AI 수호자입니다. 
       역할: ${personaType === 'grandchild' ? '사랑스러운 손주' : personaType === 'doctor' ? '믿음직한 주치의' : '따뜻한 동네 친구'}
       규칙: 어르신을 항상 따뜻하게 대하고, 짧고 명확하게 한국어로 답하세요.`;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt 
  });

  // 메시지 형식 변환 (Gemini용)
  // Gemini는 첫 메시지가 반드시 'user'여야 합니다.
  let history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  // 첫 메시지가 model(assistant)인 경우 제거 (Gemini 제약 조건)
  if (history.length > 0 && history[0].role === 'model') {
    history = history.slice(1);
  }
  
  const lastMessage = messages[messages.length - 1].content;

  const chat = model.startChat({
    history: history,
    generationConfig: { maxOutputTokens: 500 }
  });

  const result = await chat.sendMessage(lastMessage);
  const response = await result.response;
  return response.text();
};

// ============================================================
// 🔊 브라우저 내장 음성 서비스 (100% 무료!)
// ============================================================

// 1. TTS: 텍스트 → 음성 (Web Speech API)
export const speakText = (text) => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.error('이 브라우저는 음성 합성을 지원하지 않습니다.');
      resolve();
      return;
    }

    // 기존 음성 중단
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // 약간 천천히
    utterance.pitch = 1.0;

    // 한국어 목소리 찾기 (여성 목소리 선호)
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.includes('KR')) || voices[0];
    if (koVoice) utterance.voice = koVoice;

    utterance.onend = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
};

// 2. STT: 음성 → 텍스트 (Web Speech API)
// 이 기능은 브라우저의 마이크 권한을 사용합니다.
export const startListening = (onResult, onError) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('이 브라우저는 음성 인식을 지원하지 않습니다. 크롬을 사용해 주세요.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onerror = (event) => {
    console.error('음성 인식 오류:', event.error);
    if (onError) onError(event.error);
  };

  recognition.start();
  return recognition;
};

// ============================================================
// 🩺 의공학적 분석 서비스 (비정형 데이터 기반)
// ============================================================

/**
 * 사용자의 대화 텍스트를 분석하여 정서 및 인지 상태 점수를 반환합니다.
 * @param {string} text 분석할 대화 텍스트
 * @returns {Promise<{depressionScore: number, cognitionScore: number, insights: string}>}
 */
export const analyzeUserStatus = async (text) => {
  if (!genAI) return { depressionScore: 0, cognitionScore: 0, insights: '분석 불가' };

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    다음은 어르신의 대화 내용입니다: "${text}"
    
    이 내용을 바탕으로 다음 두 가지 항목을 0~100점 사이로 평가하고, 짧은 분석 의견을 주세요.
    1. 우울감 지수 (높을수록 위험)
    2. 인지 능력 저하 지수 (높을수록 위험)
    
    응답 형식: JSON { "depression": 점수, "cognition": 점수, "insights": "의견" }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(jsonStr);
    return {
      depressionScore: data.depression,
      cognitionScore: data.cognition,
      insights: data.insights
    };
  } catch (e) {
    console.error('분석 오류:', e);
    return { depressionScore: 0, cognitionScore: 0, insights: '분석 중 오류 발생' };
  }
};
