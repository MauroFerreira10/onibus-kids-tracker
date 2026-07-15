import React from 'react';

const DashboardBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes db-grid-pan {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(-80px, -80px); }
        }
        @keyframes db-orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(50px, -35px) scale(1.1); }
        }
        @keyframes db-orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-60px, 45px) scale(1.15); }
        }
        @keyframes db-orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, 70px) scale(0.92); }
        }
        @keyframes db-particle-rise {
          0%   { transform: translateY(0) scale(0); opacity: 0; }
          10%  { opacity: 0.6; transform: translateY(-30px) scale(1); }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(0.2); opacity: 0; }
        }
        @keyframes db-route-draw-1 {
          0%   { stroke-dashoffset: 1800; }
          50%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1800; }
        }
        @keyframes db-route-draw-2 {
          0%   { stroke-dashoffset: 1600; }
          50%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1600; }
        }
        @keyframes db-route-draw-3 {
          0%   { stroke-dashoffset: 1400; }
          50%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1400; }
        }
        @keyframes db-stop-pulse {
          0%, 100% { opacity: 0.3; r: 4; }
          50%       { opacity: 1; r: 7; }
        }
        @keyframes db-stop-glow-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes db-bus-on-route {
          0%   { offset-distance: 0%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes db-shimmer {
          0%   { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes db-noise {
          0%   { transform: translate(0, 0); }
          10%  { transform: translate(-5%, -5%); }
          20%  { transform: translate(-10%, 5%); }
          30%  { transform: translate(5%, -10%); }
          40%  { transform: translate(-5%, 15%); }
          50%  { transform: translate(-10%, 5%); }
          60%  { transform: translate(15%, 0); }
          70%  { transform: translate(0, 10%); }
          80%  { transform: translate(-15%, 0); }
          90%  { transform: translate(10%, 5%); }
          100% { transform: translate(5%, 0); }
        }

        .db-grid {
          position: absolute;
          inset: -80px;
          background-image:
            linear-gradient(rgba(30,58,138,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,58,138,0.06) 1px, transparent 1px);
          background-size: 80px 80px;
          animation: db-grid-pan 30s linear infinite;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 70%);
        }

        .db-orb { position: absolute; border-radius: 9999px; filter: blur(100px); }
        .db-orb-1 { animation: db-orb-float-1 18s ease-in-out infinite; }
        .db-orb-2 { animation: db-orb-float-2 22s ease-in-out infinite; }
        .db-orb-3 { animation: db-orb-float-3 26s ease-in-out infinite; }

        .db-particle {
          position: absolute;
          bottom: -10px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: db-particle-rise linear infinite;
        }

        .db-route-line {
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-dasharray: 10 14;
          filter: drop-shadow(0 0 4px currentColor);
        }

        .db-stop-glow {
          animation: db-stop-glow-pulse 3s ease-in-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .db-bus-marker {
          width: 16px;
          height: 16px;
          background: #FBBF24;
          border: 2.5px solid #1E3A8A;
          border-radius: 50%;
          box-shadow: 0 0 14px rgba(251,191,36,0.7), 0 0 30px rgba(251,191,36,0.2);
          position: absolute;
          top: 0;
          left: 0;
          offset-rotate: 0deg;
        }
        .db-bus-marker::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 6px;
          height: 6px;
          background: #1E3A8A;
          border-radius: 50%;
        }

        .db-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,0.15), transparent);
          animation: db-shimmer 8s ease-in-out infinite;
        }

        .db-noise-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
          animation: db-noise 0.5s steps(5) infinite;
        }
      `}</style>

      {/* Base white-blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/40 to-safebus-yellow/8" />

      {/* Animated grid pattern with radial mask */}
      <div className="db-grid" />

      {/* Floating gradient orbs - larger and softer */}
      <div className="db-orb db-orb-1" style={{ top: '3%', left: '-2%', width: '520px', height: '520px', background: 'radial-gradient(circle, rgba(30,58,138,0.15), transparent 70%)' }} />
      <div className="db-orb db-orb-2" style={{ bottom: '5%', right: '-3%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(251,191,36,0.18), transparent 70%)' }} />
      <div className="db-orb db-orb-3" style={{ top: '35%', left: '35%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(46,79,168,0.12), transparent 70%)' }} />

      {/* SVG with animated routes + buses + stops */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="routeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="routeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="stopGlow">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Route 1 - curved top to bottom */}
        <path
          id="route-1"
          d="M 60 650 Q 250 350, 450 480 T 1050 180"
          stroke="url(#routeGrad1)"
          className="db-route-line"
          style={{ animation: 'db-route-draw-1 14s linear infinite' }}
        />

        {/* Route 2 - S-curve */}
        <path
          id="route-2"
          d="M 120 80 Q 350 220, 650 120 T 1120 580"
          stroke="url(#routeGrad2)"
          className="db-route-line"
          style={{ animation: 'db-route-draw-2 18s linear 3s infinite' }}
        />

        {/* Route 3 - shallow curve */}
        <path
          id="route-3"
          d="M 30 380 Q 280 300, 550 580 T 1150 480"
          stroke="url(#routeGrad1)"
          className="db-route-line"
          style={{ animation: 'db-route-draw-3 22s linear 6s infinite', strokeDasharray: '6 12', opacity: 0.6 }}
        />

        {/* Stop markers with glow on route 1 */}
        {[
          [60, 650], [250, 515], [450, 480], [700, 380], [1050, 180],
        ].map(([cx, cy], i) => (
          <g key={`r1-${i}`}>
            <circle cx={cx} cy={cy} r="18" fill="url(#stopGlow)" className="db-stop-glow" style={{ animationDelay: `${i * 0.5}s` }} />
            <circle cx={cx} cy={cy} r="4" fill="#FBBF24" filter="url(#glow)">
              <animate attributeName="r" values="4;7;4" dur="2.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={cx} cy={cy} r="1.5" fill="#1E3A8A" />
          </g>
        ))}

        {/* Stop markers on route 2 */}
        {[
          [120, 80], [350, 220], [650, 120], [900, 310], [1120, 580],
        ].map(([cx, cy], i) => (
          <g key={`r2-${i}`}>
            <circle cx={cx} cy={cy} r="18" fill="url(#stopGlow)" className="db-stop-glow" style={{ animationDelay: `${i * 0.4}s` }} />
            <circle cx={cx} cy={cy} r="4" fill="#FBBF24" filter="url(#glow)">
              <animate attributeName="r" values="4;6.5;4" dur="2.8s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={cx} cy={cy} r="1.5" fill="#1E3A8A" />
          </g>
        ))}

        {/* Stop markers on route 3 */}
        {[
          [30, 380], [280, 300], [550, 580], [850, 560], [1150, 480],
        ].map(([cx, cy], i) => (
          <g key={`r3-${i}`}>
            <circle cx={cx} cy={cy} r="16" fill="url(#stopGlow)" className="db-stop-glow" style={{ animationDelay: `${i * 0.6}s` }} />
            <circle cx={cx} cy={cy} r="3.5" fill="#FBBF24" filter="url(#glow)">
              <animate attributeName="r" values="3.5;6;3.5" dur="3s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={cx} cy={cy} r="1.5" fill="#1E3A8A" />
          </g>
        ))}
      </svg>

      {/* Buses moving along routes (CSS offset-path) */}
      <div
        className="db-bus-marker"
        style={{
          offsetPath: `path('M 60 650 Q 250 350, 450 480 T 1050 180')`,
          animation: 'db-bus-on-route 14s linear infinite',
        }}
      />
      <div
        className="db-bus-marker"
        style={{
          offsetPath: `path('M 120 80 Q 350 220, 650 120 T 1120 580')`,
          animation: 'db-bus-on-route 18s linear 3s infinite',
        }}
      />
      <div
        className="db-bus-marker"
        style={{
          offsetPath: `path('M 30 380 Q 280 300, 550 580 T 1150 480')`,
          animation: 'db-bus-on-route 22s linear 6s infinite',
          background: '#1E3A8A',
          border: '2.5px solid #FBBF24',
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={`p-${i}`}
          className="db-particle"
          style={{
            left: `${(i * 6.2 + 2) % 100}%`,
            background: i % 3 === 0 ? '#FBBF24' : i % 3 === 1 ? '#1E3A8A' : '#2E4FA8',
            opacity: 0.3,
            animationDuration: `${12 + (i % 8)}s`,
            animationDelay: `${i * 0.8}s`,
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
          }}
        />
      ))}

      {/* Shimmer lines */}
      <div className="db-shimmer" style={{ top: '15%', animationDelay: '0s' }} />
      <div className="db-shimmer" style={{ top: '45%', animationDelay: '3s' }} />
      <div className="db-shimmer" style={{ top: '75%', animationDelay: '6s' }} />

      {/* Film grain noise overlay */}
      <div className="db-noise-overlay" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30" />
    </div>
  );
};

export default DashboardBackground;