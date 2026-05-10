import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// 사용자 프로필 저장
export const saveUserProfile = async (userId, profileData) => {
  await setDoc(doc(db, 'users', userId), {
    ...profileData,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

// 사용자 프로필 불러오기
export const getUserProfile = async (userId) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// 일일 미션 기록 저장
export const saveDailyRecord = async (userId, date, record) => {
  const recordId = `${userId}_${date}`;
  await setDoc(doc(db, 'dailyRecords', recordId), {
    userId,
    date,
    ...record,
    savedAt: new Date().toISOString()
  }, { merge: true });
};

// 온보딩 완료 여부 업데이트
export const setOnboardingComplete = async (userId) => {
  await updateDoc(doc(db, 'users', userId), {
    onboardingComplete: true
  });
};
