/**
 * Echo-Guardian GPT-4 Persona Messaging Integration
 */

export const generatePersonaMessage = async (persona, healthData) => {
  const { totalScore, status } = healthData;
  
  const systemPrompts = {
    grandchild: "You are a warm, emotional grandchild. Use casual but respectful Korean language (반말과 존댓말 섞어서). Be caring.",
    doctor: "You are a professional, factual, and authoritative medical doctor. Be clear and direct.",
    friend: "You are a local, friendly friend. Use informal and relatable language (사투리나 친근한 말투)."
  };

  const userMessage = `Current Health Risk Score: ${totalScore} (${status}). Give a daily health advice based on this score.`;

  // Placeholder for OpenAI API call
  console.log(`Generating ${persona} message for score ${totalScore}...`);
  
  const mockResponses = {
    grandchild: "할머니, 오늘 미세먼지가 좀 있네. 나갈 때 꼭 마스크 쓰고 나가야 돼! 아 참, 아까 잇몸 아프다 그랬지? 단골 치과에 전화 한 번 해볼까?",
    doctor: "현재 건강 위험 지수가 주의 단계입니다. 환자분께서 언급하신 치통 증상을 고려할 때, '치과' 진료가 필요해 보입니다. 자주 가시는 병원에 예약 전화를 연결해 드릴까요?",
    friend: "어이 친구, 오늘 공기가 영 별로네. 입 안이 껄끄럽다며? 집 앞 치과 원장님한테 전화나 한 통 때려보게!"
  };

  const recommendedDept = totalScore > 50 ? '치과' : '내과'; // Simple mock logic

  return {
    message: mockResponses[persona] || "Stay healthy!",
    recommendedDept
  };
};
