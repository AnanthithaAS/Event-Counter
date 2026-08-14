/**
 * Calculates remaining time until targetDate.
 * @param {string|Date} targetDate - The target date/time string or Date object.
 * @param {string|Date} [createdAt] - Optional creation timestamp to compute percentage elapsed.
 * @returns {Object} Countdown info: days, hours, minutes, seconds, isExpired, totalSeconds, percentElapsed
 */
export function getRemainingTime(targetDate, createdAt = null) {
  if (!targetDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
      percentElapsed: 100,
    };
  }

  const targetTime = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = targetTime - now;

  if (isNaN(targetTime) || diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
      percentElapsed: 100,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let percentElapsed = 0;
  if (createdAt) {
    const createdTime = new Date(createdAt).getTime();
    if (!isNaN(createdTime) && targetTime > createdTime) {
      const totalDuration = targetTime - createdTime;
      const elapsed = now - createdTime;
      percentElapsed = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
    percentElapsed: Math.round(percentElapsed),
  };
}

/**
 * Pads numbers with a leading zero if less than 10.
 */
export function padZero(num) {
  return String(num).padStart(2, '0');
}
