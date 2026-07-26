import { useRef, useEffect } from 'react';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; alpha: number; alphaSpeed: number;
  color: string;
}

const COLORS = ['rgba(255,255,255,', 'rgba(251,191,36,'];
const PARTICLE_COUNT = 50;

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const particles: Particle[] = [];
    let scrollY = 0;

    const resize = () => {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    };

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3 - 0.08,
          size: Math.random() * 2.5 + 1,
          alpha: Math.random() * 0.5 + 0.15,
          alphaSpeed: (Math.random() - 0.5) * 0.004,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    resize();
    initParticles();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouse, { passive: true });

    const draw = () => {
      ctx!.clearRect(0, 0, w, h);
      const parallaxOffset = scrollY * 0.15;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;
        if (p.alpha > 0.7 || p.alpha < 0.08) p.alphaSpeed *= -1;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const dy = mouseRef.current.y - (p.y + parallaxOffset);
        const dx = mouseRef.current.x - p.x;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x -= dx * 0.002;
          p.y -= dy * 0.002;
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y + parallaxOffset, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.color + p.alpha + ')';
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;
