import { useState, useEffect, useRef } from 'react';
import { getRemainingTime } from '../utils/countdown';

/**
 * Custom hook to manage live countdown interval for an event.
 * @param {string|Date} targetDate 
 * @param {string|Date} [createdAt] 
 * @param {Function} [onExpire] 
 */
export function useCountdown(targetDate, createdAt = null, onExpire = null) {
  const [timeLeft, setTimeLeft] = useState(() => getRemainingTime(targetDate, createdAt));
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    // Initial sync
    const initial = getRemainingTime(targetDate, createdAt);
    setTimeLeft(initial);
    hasExpiredRef.current = initial.isExpired;

    if (initial.isExpired) {
      return;
    }

    const intervalId = setInterval(() => {
      const remaining = getRemainingTime(targetDate, createdAt);
      setTimeLeft(remaining);

      if (remaining.isExpired) {
        clearInterval(intervalId);
        if (!hasExpiredRef.current && typeof onExpire === 'function') {
          hasExpiredRef.current = true;
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate, createdAt, onExpire]);

  return timeLeft;
}
