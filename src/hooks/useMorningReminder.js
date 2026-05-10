import { useEffect, useRef, useCallback, useState } from 'react';
import { loadLocalProfile, saveLocalProfile } from '../utils/localProfileStorage';

const LAST_KEY = 'doran-doran-last-morning-notification-day';

function dateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function readMorningReminderPrefs() {
  const p = loadLocalProfile();
  const hour = Number(p?.morningReminderHour);
  return {
    enabled: !!p?.morningReminderEnabled,
    hour: Number.isFinite(hour) && hour >= 5 && hour <= 11 ? hour : 8,
  };
}

export function writeMorningReminderPrefs(enabled, hour = 8) {
  saveLocalProfile({
    morningReminderEnabled: enabled,
    morningReminderHour: hour,
  });
}

/**
 * 로컬 설정·브라우저 알림(탭/앱이 켜진 상태에서 동작).
 * 정확한 '푸시'는 FCM 등 별도 구성이 필요합니다.
 */
export function useMorningReminder({ getTitle, getBody, active }) {
  const getTitleRef = useRef(getTitle);
  const getBodyRef = useRef(getBody);
  getTitleRef.current = getTitle;
  getBodyRef.current = getBody;

  const tryNotify = useCallback(() => {
    if (!active) return;
    const { enabled, hour } = readMorningReminderPrefs();
    if (!enabled || typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    if (now.getHours() < hour) return;

    const today = dateKey(now);
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(LAST_KEY) === today) {
        return;
      }
    } catch {
      /* ignore */
    }

    const title = getTitleRef.current?.() || '도란도란';
    const body = getBodyRef.current?.() || '오늘 건강도 도란도란이 함께할게요.';
    try {
      const n = new Notification(title, { body, icon: '/favicon.svg', tag: 'doran-morning' });
      void n;
    } catch {
      return;
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LAST_KEY, today);
      }
    } catch {
      /* ignore */
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const id = window.setInterval(() => tryNotify(), 45_000);
    const boot = window.setTimeout(() => tryNotify(), 2_000);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(boot);
    };
  }, [active, tryNotify]);
}

export function useMorningReminderUi() {
  const [enabled, setEnabled] = useState(() => readMorningReminderPrefs().enabled);
  const [hour, setHour] = useState(() => readMorningReminderPrefs().hour);
  const [perm, setPerm] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  const refreshPerm = useCallback(() => {
    if (typeof Notification !== 'undefined') {
      setPerm(Notification.permission);
    }
  }, []);

  const toggleEnabled = useCallback(async (on) => {
    if (on && typeof Notification !== 'undefined') {
      const r = await Notification.requestPermission();
      refreshPerm();
      if (r !== 'granted') {
        setEnabled(false);
        writeMorningReminderPrefs(false, hour);
        return;
      }
    }
    setEnabled(on);
    writeMorningReminderPrefs(on, hour);
  }, [hour, refreshPerm]);

  const setHourAndSave = useCallback(
    (h) => {
      const next = Number(h);
      setHour(next);
      writeMorningReminderPrefs(enabled, next);
    },
    [enabled],
  );

  return { enabled, hour, perm, toggleEnabled, setHourAndSave, refreshPerm };
}
