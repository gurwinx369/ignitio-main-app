import { useEffect } from 'react';

const SAFE_TOP_PX = 60;
const CHECK_INTERVAL_MS = 45000;

export function useKiboVisibilityGuard({ position, petSize, resetPosition, isReady }) {
  useEffect(() => {
    if (!isReady) return;

    const check = () => {
      if (typeof window === 'undefined') return;
      const { innerWidth: W, innerHeight: H } = window;
      const isMobile = W <= 768;
      const bottomPad = isMobile ? 110 : 12;

      const isOutOfBounds =
        position.x < 0 ||
        position.y < SAFE_TOP_PX ||
        position.x > W - petSize ||
        position.y > H - petSize - bottomPad;

      if (isOutOfBounds) {
        console.info('[Kibo] Out of safe zone — snapping to default position');
        resetPosition();
      }
    };

    const mountTimer = setTimeout(check, 300);
    const intervalId = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(mountTimer);
      clearInterval(intervalId);
    };
  }, [isReady, position, petSize, resetPosition]);
}
