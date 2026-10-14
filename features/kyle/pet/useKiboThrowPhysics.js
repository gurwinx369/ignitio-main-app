import { useRef } from 'react';

const GRAVITY = 0.45;
const FRICTION_X = 0.985;
const BOUNCE_DAMPING = 0.55;
const THROW_THRESHOLD = 2.5;
const BUFFER_SIZE = 5;
const MOBILE_BOTTOM_PAD = 110;

export function useKiboThrowPhysics({ petSize, onPositionChange, onBouncing, storageKey }) {
  const vel = useRef({ x: 0, y: 0 });
  const posBuf = useRef([]);
  const timeBuf = useRef([]);
  const rafId = useRef(null);
  const isBouncing = useRef(false);

  const recordDragPoint = (x, y) => {
    const now = performance.now();
    posBuf.current.push({ x, y });
    timeBuf.current.push(now);
    if (posBuf.current.length > BUFFER_SIZE) {
      posBuf.current.shift();
      timeBuf.current.shift();
    }
  };

  const computeVelocity = () => {
    const n = posBuf.current.length;
    if (n < 2) return { x: 0, y: 0 };
    const dt = timeBuf.current[n-1] - timeBuf.current[0];
    if (dt <= 0) return { x: 0, y: 0 };
    return {
      x: (posBuf.current[n-1].x - posBuf.current[0].x) / dt,
      y: (posBuf.current[n-1].y - posBuf.current[0].y) / dt,
    };
  };

  const startThrow = (releasePos) => {
    const v = computeVelocity();
    const speed = Math.sqrt(v.x**2 + v.y**2);
    posBuf.current = [];
    timeBuf.current = [];

    if (speed < THROW_THRESHOLD) return false;

    vel.current = { x: v.x * 16, y: v.y * 16 };
    isBouncing.current = true;
    onBouncing(true);

    let pos = { ...releasePos };

    const simulate = () => {
      const { innerWidth: width, innerHeight: height } = window;
      const isMobile = width <= 768;
      const pad = 12;
      const bottomPad = isMobile ? MOBILE_BOTTOM_PAD : pad;
      const topPad = 60; // topSafeZonePx

      vel.current.y += GRAVITY;
      vel.current.x *= FRICTION_X;

      pos.x += vel.current.x;
      pos.y += vel.current.y;

      if (pos.x < pad) {
        pos.x = pad;
        vel.current.x = Math.abs(vel.current.x) * BOUNCE_DAMPING;
      }
      if (pos.x > width - petSize - pad) {
        pos.x = width - petSize - pad;
        vel.current.x = -Math.abs(vel.current.x) * BOUNCE_DAMPING;
      }

      if (pos.y < topPad) {
        pos.y = topPad;
        vel.current.y = Math.abs(vel.current.y) * BOUNCE_DAMPING;
      }
      if (pos.y > height - petSize - bottomPad) {
        pos.y = height - petSize - bottomPad;
        vel.current.y = -Math.abs(vel.current.y) * BOUNCE_DAMPING;
      }

      onPositionChange({ x: pos.x, y: pos.y });

      const totalV = Math.abs(vel.current.x) + Math.abs(vel.current.y);
      if (totalV < 0.5 && Math.abs(pos.y - (height - petSize - bottomPad)) < 2) {
        isBouncing.current = false;
        onBouncing(false);
        try { localStorage.setItem(storageKey, JSON.stringify(pos)); } catch(e) {}
        return;
      }

      rafId.current = requestAnimationFrame(simulate);
    };

    rafId.current = requestAnimationFrame(simulate);
    return true;
  };

  const cancel = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    isBouncing.current = false;
    posBuf.current = [];
    timeBuf.current = [];
  };

  return { recordDragPoint, startThrow, cancel, isBouncing };
}
