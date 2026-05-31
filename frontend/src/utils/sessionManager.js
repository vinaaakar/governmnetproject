import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useInactivityLogout
 * Monitors user activity and automatically logs out after 10 minutes of idle time.
 */
export const useInactivityLogout = (logoutFn, timeoutMs = 600000) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      console.log('Session Expired: Inactivity detected.');
      localStorage.setItem('session_status', 'LOCKED');
      logoutFn();
    }, timeoutMs);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return resetTimer;
};
