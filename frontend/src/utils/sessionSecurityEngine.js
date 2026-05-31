/**
 * UCRS Session Security Infrastructure
 * Handles JWT persistence, refresh rotation, and inactivity heartbeats.
 */

const SESSION_KEYS = {
  TOKEN: 'officerToken',
  REFRESH: 'officerRefreshToken',
  INFO: 'officerInfo',
  LAST_ACTIVITY: 'ucrs_last_activity'
};

const TIMEOUT_MS = 30 * 60 * 1000; // 30 Minutes

export const establishSecureSession = (data) => {
  const { token, refreshToken, officer } = data;
  localStorage.setItem(SESSION_KEYS.TOKEN, token);
  localStorage.setItem(SESSION_KEYS.REFRESH, refreshToken);
  localStorage.setItem(SESSION_KEYS.INFO, JSON.stringify(officer));
  localStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, Date.now().toString());
  
  console.log(`[SESSION] Uplink Established for ${officer.fullName} | Node: ${officer.officeCode}`);
};

export const clearSecureSession = () => {
  localStorage.removeItem(SESSION_KEYS.TOKEN);
  localStorage.removeItem(SESSION_KEYS.REFRESH);
  localStorage.removeItem(SESSION_KEYS.INFO);
  localStorage.removeItem(SESSION_KEYS.LAST_ACTIVITY);
  window.location.href = '/officer-login';
};

export const validateSessionHeartbeat = () => {
  const lastActivity = localStorage.getItem(SESSION_KEYS.LAST_ACTIVITY);
  if (!lastActivity) return false;

  const now = Date.now();
  if (now - parseInt(lastActivity) > TIMEOUT_MS) {
    console.warn("[SESSION] Security Timeout: Administrative session expired.");
    clearSecureSession();
    return false;
  }

  localStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, now.toString());
  return true;
};

export const getSessionMetadata = () => {
  const info = localStorage.getItem(SESSION_KEYS.INFO);
  return info ? JSON.parse(info) : null;
};

export const rotateAccessTokens = (newToken) => {
  localStorage.setItem(SESSION_KEYS.TOKEN, newToken);
};
