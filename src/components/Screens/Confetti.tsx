import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

const COLORS = [
  '#10b981', '#34d399', '#6ee7b7',
  '#0ea5e9', '#38bdf8',
  '#f59e0b', '#fcd34d',
  '#f97316', '#fb923c',
  '#ec4899', '#f472b6',
];

function createParticle(canvasWidth: number): Particle {
  return {
    x: Math.random() * canvasWidth,
    y: -10 - Math.random() * 100,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    opacity: 1,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  };
}

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const INITIAL_BURST = 180;
    for (let i = 0; i < INITIAL_BURST; i++) {
      const p = createParticle(canvas.width);
      p.y = Math.random() * canvas.height * 0.6;
      particles.push(p);
    }

    let spawned = INITIAL_BURST;
    const MAX_PARTICLES = 300;
    let rafId: number;
    let frame = 0;

    function tick() {
      rafId = requestAnimationFrame(tick);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      frame++;
      if (spawned < MAX_PARTICLES && frame % 2 === 0) {
        particles.push(createParticle(canvas!.width));
        spawned++;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas!.height * 0.85) {
          p.opacity -= 0.02;
        }
        if (p.opacity <= 0 || p.y > canvas!.height + 20) {
          particles.splice(i, 1);
          continue;
        }
        ctx!.save();
        ctx!.globalAlpha = p.opacity;
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx!.beginPath();
          ctx!.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();
      }

      if (particles.length === 0 && spawned >= MAX_PARTICLES) {
        cancelAnimationFrame(rafId);
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
    />
  );
}
