import { useRef, useEffect, useState, useCallback } from 'react';

const TOTAL_FRAMES = 20;
const FRAME_PATH = '/frames/image_';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

interface Props {
  /** Exposed so parent can call draw(frameNum) directly */
  drawRef?: React.MutableRefObject<((frame: number) => void) | null>;
}

const ScrollFrameSequence: React.FC<Props> = ({ drawRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  /* preload all frames into memory */
  useEffect(() => {
    let done = 0;
    const imgs: HTMLImageElement[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.onload = () => {
        done++;
        setLoadPct(done / TOTAL_FRAMES);
        if (done === TOTAL_FRAMES) setLoaded(true);
      };
      img.onerror = () => {
        done++;
        if (done === TOTAL_FRAMES) setLoaded(true);
      };
      img.src = `${FRAME_PATH}${pad(i)}.jpg`;
      imgs.push(img);
    }
    imagesRef.current = imgs;
    return () => {
      imgs.forEach((img) => { img.onload = null; img.onerror = null; });
    };
  }, []);

  /* initialise canvas + resize */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  /* draw a specific frame — reset transform each time because canvas context resets on resize */
  const draw = useCallback((frame: number) => {
    const img = imagesRef.current[frame - 1];
    if (!img || !img.complete) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    /* reset transform and clear */
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const iw = img.naturalWidth || 1920;
    const ih = img.naturalHeight || 1080;
    const scale = Math.max(w / iw, h / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (w - sw) / 2;
    const sy = (h - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  /* draw first frame once loaded */
  useEffect(() => {
    if (!loaded) return;
    draw(1);
  }, [loaded, draw]);

  /* expose draw to parent */
  useEffect(() => {
    if (drawRef) {
      drawRef.current = draw;
    }
  }, [draw, drawRef]);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-safebus-blue">
          <div className="w-10 h-10 border-2 border-white/20 border-t-safebus-yellow rounded-full animate-spin mb-4" />
          <p className="text-white/60 text-[13px] font-medium tracking-[0.025em]">
            A preparar experiência... {Math.round(loadPct * 100)}%
          </p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
    </>
  );
};

export default ScrollFrameSequence;
