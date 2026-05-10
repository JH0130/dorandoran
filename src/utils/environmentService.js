/**
 * Echo-Guardian — 환경 스냅샷 (API 키 없음)
 * Open-Meteo Air Quality + Weather (브라우저에서 CORS 허용)
 */

const SEOUL = { lat: 37.5665, lon: 126.978, label: '서울 시청 기준' };

const WEATHER_KO = {
  0: '맑음', 1: '대체로 맑음', 2: '구름 조금', 3: '흐림',
  45: '안개', 48: '안개', 51: '이슬비', 53: '이슬비', 55: '이슬비',
  61: '비', 63: '비', 65: '폭우', 71: '눈', 73: '눈', 75: '폭설',
  80: '소나기', 81: '소나기', 82: '강한 소나기', 95: '뇌우', 96: '뇌우', 99: '뇌우',
};

function weatherLabel(code) {
  return WEATHER_KO[code] ?? '날씨 확인';
}

/**
 * @param {{ latitude: number, longitude: number, locationLabel?: string }} coords
 * @returns {Promise<{ pm25: number, pm10: number, temperatureC: number | null, weatherCode: number | null, weatherLabel: string, locationLabel: string, fetchedAt: string, greenIndex: null, noiseDb: null }>}
 */
export async function fetchEnvironmentSnapshot({ latitude, longitude, locationLabel }) {
  const lat = latitude;
  const lon = longitude;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10`;
  const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;

  const [airRes, wxRes] = await Promise.all([fetch(airUrl), fetch(wxUrl)]);
  if (!airRes.ok) throw new Error('대기질 정보를 불러오지 못했습니다.');
  if (!wxRes.ok) throw new Error('날씨 정보를 불러오지 못했습니다.');

  const airJson = await airRes.json();
  const wxJson = await wxRes.json();

  const pm25 = Number(airJson?.current?.pm2_5);
  const pm10 = Number(airJson?.current?.pm10);
  const temperatureC = wxJson?.current?.temperature_2m != null
    ? Number(wxJson.current.temperature_2m)
    : null;
  const weatherCode = wxJson?.current?.weather_code != null
    ? Number(wxJson.current.weather_code)
    : null;

  return {
    pm25: Number.isFinite(pm25) ? Math.round(pm25) : 0,
    pm10: Number.isFinite(pm10) ? Math.round(pm10) : 0,
    temperatureC,
    weatherCode,
    weatherLabel: weatherLabel(weatherCode ?? 0),
    locationLabel: locationLabel || '선택 위치',
    fetchedAt: new Date().toISOString(),
    greenIndex: null,
    noiseDb: null,
  };
}

export function getDefaultSeoulCoords() {
  return SEOUL;
}

/**
 * 브라우저 위치 → 실패 시 서울
 * @returns {Promise<{ latitude: number, longitude: number, locationLabel: string }>}
 */
export function resolveUserCoordinates() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ ...SEOUL });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          locationLabel: '내 위치 기준',
        });
      },
      () => resolve({ ...SEOUL }),
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 600_000 },
    );
  });
}
