// ============================================================
// 🤖 OpenAI 서비스 유틸
// VITE_OPENAI_API_KEY 환경변수를 .env 파일에 설정해 주세요.
// ============================================================

export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY?.replace(/[^\x00-\x7F]/g, "").trim();

// AI 온보딩 인터뷰 메시지 생성
export const getOnboardingResponse = async (messages, personaType = 'grandchild') => {
  const systemPrompt = `당신은 '도란도란' 앱의 따뜻한 AI 수호자입니다. 
역할: ${personaType === 'grandchild' ? '친절한 손주' : personaType === 'doctor' ? '다정한 주치의' : '동네 친구'}
목표: 어르신과 자연스럽게 대화하며 아래 정보를 파악하세요.
- 성함
- 나이
- 현재 드시는 약 종류와 복약 시간
- 기저질환 (고혈압, 당뇨, 심장병 등)
- 단골 병원 이름과 전화번호
- 보호자(자녀) 연락처 (선택)

규칙:
- 한 번에 한 가지 질문만 하세요.
- 어르신이 이해하기 쉬운 쉬운 말을 사용하세요.
- 답변이 모호하면 친절하게 다시 물어보세요.
- 모든 정보가 수집되면 "이제 도란도란이 어르신을 잘 도와드릴 수 있을 것 같아요!" 라고 마무리하세요.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 300
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'OpenAI API 호출 실패');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// AI 일반 대화 응답 생성
export const getChatResponse = async (messages, userProfile, personaType = 'grandchild') => {
  const systemPrompt = `당신은 '도란도란' 앱의 AI 수호자입니다.
역할: ${personaType === 'grandchild' ? '사랑스러운 손주' : personaType === 'doctor' ? '믿음직한 주치의' : '따뜻한 동네 친구'}
사용자 정보: ${JSON.stringify(userProfile)}
규칙:
- 어르신을 항상 따뜻하게 대해주세요.
- 의학적으로 위험한 조언은 하지 마세요.
- 한국어로만 대답하세요.
- 짧고 명확하게 말하세요.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 200
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};

// STT: 음성 → 텍스트 (Whisper)
export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'ko');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: formData
  });

  const data = await response.json();
  return data.text;
};

// TTS: 텍스트 → 음성 (OpenAI TTS)
export const textToSpeech = async (text) => {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'nova' // 따뜻한 여성 목소리
    })
  });

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
  return audio;
};
