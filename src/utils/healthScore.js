/**
 * Echo-Guardian Health Risk Scoring Engine
 * Weighted 4:3:3 ratio:
 * - Environmental Factors (40%)
 * - Socio-economic Factors (30%)
 * - Bio-medical Factors (30%)
 */

export const calculateHealthRiskScore = (data) => {
  const { environmental, socioEconomic, bioMedical } = data;

  // 1. Environmental (40%) - PM2.5, PM10 based normalized score
  const envScore = (environmental.pm25 / 100) * 40; 

  // 2. Socio-economic (30%) - Living alone + income level
  let socioScore = 0;
  if (socioEconomic.livingAlone) socioScore += 15;
  if (socioEconomic.incomeLevel === 'low') socioScore += 15;

  // 3. Bio-medical (30%) - Age + Multimorbidity + Specific Risks + Adherence
  let bioScore = 0;
  
  // 3.1 Age Penalty
  if (bioMedical.age >= 75) bioScore += 5;
  
  // 3.2 Multimorbidity (Number of chronic diseases)
  const numDiseases = bioMedical.chronicDiseases.length;
  if (numDiseases === 1) bioScore += 5;
  else if (numDiseases === 2) bioScore += 10;
  else if (numDiseases >= 3) bioScore += 15;

  // 3.3 Specific Critical Disease Weights
  const diseases = bioMedical.chronicDiseases;
  if (diseases.includes('cardiovascular')) bioScore += 10;
  if (diseases.includes('diabetes')) bioScore += 7;
  if (diseases.includes('hypertension')) bioScore += 5;
  if (diseases.includes('periodontitis')) bioScore += 3;

  // 3.4 Medication Non-Adherence
  if (!bioMedical.medicationAdherence) bioScore += 10;

  // Cap Bio-Medical score at 30 to preserve the 4:3:3 ratio
  bioScore = Math.min(bioScore, 30);

  const totalScore = Math.min(Math.round(envScore + socioScore + bioScore), 100);

  let status = 'green';
  if (totalScore >= 70) status = 'red';
  else if (totalScore >= 30) status = 'yellow';

  return { totalScore, status };
};
