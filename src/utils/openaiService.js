// ============================================================
// ⚠️ DISABLED - OpenAI 서비스 비활성화 (비용 절감)
// 대신 aiService.js의 Gemini를 사용하세요 (FREE!)
// ============================================================

/*
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY?.replace(/[^\x00-\x7F]/g, "").trim();

export const getOnboardingResponse = async (messages, personaType = 'grandchild') => {
  throw new Error('OpenAI 서비스는 비용 절감으로 인해 비활성화되었습니다. aiService.js의 getAIResponse를 사용해주세요.');
};

export const getChatResponse = async (messages, userProfile, personaType = 'grandchild') => {
  throw new Error('OpenAI 서비스는 비용 절감으로 인해 비활성화되었습니다. aiService.js의 getAIResponse를 사용해주세요.');
};

export const transcribeAudio = async (audioBlob) => {
  throw new Error('OpenAI 서비스는 비용 절감으로 인해 비활성화되었습니다. aiService.js의 startListening을 사용해주세요.');
};

export const textToSpeech = async (text) => {
  throw new Error('OpenAI 서비스는 비용 절감으로 인해 비활성화되었습니다. aiService.js의 speakText를 사용해주세요.');
};
*/

// ============================================================
// ✅ 모든 AI 기능은 aiService.js에서 구현됩니다 (100% 무료)
// ============================================================
export default {
  message: '⚠️ OpenAI 서비스가 비활성화되었습니다. aiService.js의 Gemini 서비스를 사용하세요.'
};
