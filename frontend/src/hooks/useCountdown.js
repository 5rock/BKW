import { useEffect, useMemo, useState } from 'react';

const getRemaining = (target) => {
  const total = Math.max(0, target - Date.now());
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  return { total, hours, minutes, seconds };
};

export const useCountdown = (hoursFromNow = 12) => {
  const target = useMemo(() => Date.now() + hoursFromNow * 3600000, [hoursFromNow]);
  const [time, setTime] = useState(() => getRemaining(target));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(getRemaining(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  return time;
};

export const padTime = (value) => String(value).padStart(2, '0');
