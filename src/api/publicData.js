/**
 * Echo-Guardian Public Data API Integration
 * Fetches Air Quality and Welfare Facility data.
 */

import { fetchEnvironmentSnapshot } from '../utils/environmentService';

/** @deprecated 이름 호환 — 실제로는 Open-Meteo 스냅샷 */
export const fetchAirQuality = async (lat, lon) => {
  const snap = await fetchEnvironmentSnapshot({
    latitude: lat,
    longitude: lon,
    locationLabel: '요청 좌표',
  });
  return {
    pm25: snap.pm25,
    pm10: snap.pm10,
    status: snap.pm25 >= 75 ? 'Unhealthy' : snap.pm25 >= 35 ? 'Moderate' : 'Good',
  };
};

export const fetchWelfareFacilities = async (region) => {
  // Placeholder for Welfare Facility API integration
  console.log(`Fetching Welfare Facilities in ${region}...`);
  return [
    { name: 'Happy Seniors Center', distance: '500m', type: 'Counseling' },
    { name: 'Local Health Clinic', distance: '1.2km', type: 'Medical' }
  ];
};
