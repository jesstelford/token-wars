import { useState, useEffect, useRef, useCallback } from 'react';

export function useMiniGameTimer(seconds: number, onExpire: () => void) {
  const [timeRemaining, setTimeRemaining] = useState(seconds);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsExpired(true);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const progressFraction = timeRemaining / seconds;

  return { timeRemaining, isExpired, progressFraction, stop };
}
