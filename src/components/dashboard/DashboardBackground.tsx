import React from 'react';

const DashboardBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes db-grid-pan {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(-60px, -60px); }
        }
        @keyframes db-orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(40px, -30px) scale(1.08); }
        }
        @keyframes db-orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-50px, 40px) scale(1.12); }
        }
        @keyframes db-orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(20px, 60px) scale(0.95); }
        }
        @keyframes db-particle-rise {
          0%   { transform: translateY(0) scale(0); opacity: 0; }
          10%  { opacity: 1; transform: translateY(-20px) scale(1); }
          90%  { opacity: 1; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
        @keyframes db-route-draw {
          0%   { stroke-dashoffset: 1200; }
          50%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1200; }
        }
        @keyframes db-stop-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.4); }
        }
        @keyframes db-bus-on-route-1 {
          0%   { offset-distance: 0%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes db-bus-on-route-2 {
          0%   { offset-distance: 0%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes db-shooting-line {
          0%   { transform: translateX(-100%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        @keyframes db-radar-sweep {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes db-radar-ring {
          0%   { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .db-grid {
          position: absolute;
          inset: -60px;
          background-image:
            linear-gradient(rgba(30,58,138,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,58,138,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: db-grid-pan 20s linear infinite;
        }

        .db-orb { position: absolute; border-radius: 9999px; filter: blur(80px); }
        .db-orb-1 { animation: db-orb-float-1 15s ease-in-out infinite; }
        .db-orb-2 { animation: db-orb-float-2 18s ease-in-out infinite; }
        .db-orb-3 { animation: db-orb-float-3 22s ease-in-out infinite; }

        .db-particle {
          position: absolute;
          bottom: -10px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: db-particle-rise linear infinite;
        }

        .db-route-line {
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-dasharray: 8 12;
          animation: db-route-draw 12s linear infinite;
        }

        .db-stop { animation: db-stop-pulse 2.5s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }

        .db-bus-marker {
          width: 18px;
          height: 18px;
          background: #FBBF24;
          border: 2px solid #1E3A8A;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(251,191,36,0.6);
          position: absolute;
          top: 0;
          left: 0;
          offset-rotate: 0deg;
        }

        .db-shooting-line {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, #FBBF24, transparent);
          animation: db-shooting-line 6s ease-in-out infinite;
        }

        .db-radar {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          right: -110px;
          top: 30%;
        }
        .db-radar-sweep {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0deg, rgba(251,191,36,0.18) 60deg, transparent 90deg);
          animation: db-radar-sweep 4s linear infinite;
        }
        .db-radar-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(30,58,138,0.25);
          animation: db-radar-ring 3s ease-out infinite;
        }
      `}</style>

      {/* Base white-blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/50 to-safebus-yellow/5" />

      {/* Animated grid pattern */}
      <div className="db-grid" />

      {/* Floating gradient orbs */}
      <div className="db-orb db-orb-1" style={{ top: '5%', left: '5%', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(30,58,138,0.18), transparent 70%)' }} />
      <div className="db-orb db-orb-2" style={{ bottom: '10%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(251,191,36,0.22), transparent 70%)' }} />
      <div className="db-orb db-orb-3" style={{ top: '40%', left: '40%', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(46,79,168,0.15), transparent 70%)' }} />

      {/* Radar effect (right side) */}
      <div className="db-radar">
        <div className="db-radar-ring" style={{ animationDelay: '0s' }} />
        <div className="db-radar-ring" style={{ animationDelay: '1s' }} />
        <div className="db-radar-ring" style={{ animationDelay: '2s' }} />
        <div className="db-radar-sweep" />
      </div>

      {/* SVG with animated routes + buses + stops */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="routeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="routeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="stopGlow">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Animated curved routes */}
        <path
          id="route-1"
          d="M 80 600 Q 300 400, 500 500 T 1100 200"
          stroke="url(#routeGrad1)"
          className="db-route-line"
        />
        <path
          id="route-2"
          d="M 100 100 Q 400 250, 700 150 T 1150 600"
          stroke="url(#routeGrad2)"
          className="db-route-line"
          style={{ animationDelay: '4s' }}
        />
        <path
          id="route-3"
          d="M 50 400 Q 350 350, 600 600 T 1100 500"
          stroke="url(#routeGrad1)"
          className="db-route-line"
          style={{ animationDelay: '8s', strokeDasharray: '4 8' }}
          opacity="0.5"
        />

        {/* Glowing bus stops */}
        {[
          [80, 600], [500, 500], [1100, 200],
          [100, 100], [700, 150], [1150, 600],
          [350, 350], [600, 600], [1100, 500],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="20" fill="url(#stopGlow)" className="db-stop" style={{ animationDelay: `${i * 0.3}s` }} />
            <circle cx={cx} cy={cy} r="5" fill="#FBBF24" />
            <circle cx={cx} cy={cy} r="2" fill="#1E3A8A" />
          </g>
        ))}
      </svg>

      {/* Buses moving along the routes (CSS offset-path) */}
      <div
        className="db-bus-marker"
        style={{
          offsetPath: `path('M 80 600 Q 300 400, 500 500 T 1100 200')`,
          animation: 'db-bus-on-route-1 12s linear infinite',
        }}
      />
      <div
        className="db-bus-marker"
        style={{
          offsetPath: `path('M 100 100 Q 400 250, 700 150 T 1150 600')`,
          animation: 'db-bus-on-route-2 16s linear 4s infinite',
        }}
      />
      <div
        className="db-bus-marker"
        style={{
          offsetPath: `path('M 50 400 Q 350 350, 600 600 T 1100 500')`,
          animation: 'db-bus-on-route-1 14s linear 8s infinite',
          background: '#1E3A8A',
          border: '2px solid #FBBF24',
        }}
      />

      {/* Floating yellow particles rising */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={`p-${i}`}
          className="db-particle"
          style={{
            left: `${(i * 5.5) % 100}%`,
            background: i % 3 === 0 ? '#FBBF24' : i % 3 === 1 ? '#1E3A8A' : '#2E4FA8',
            opacity: 0.4,
            animationDuration: `${10 + (i % 6)}s`,
            animationDelay: `${i * 0.6}s`,
            width: `${4 + (i % 4)}px`,
            height: `${4 + (i % 4)}px`,
          }}
        />
      ))}

      {/* Shooting horizontal lines */}
      <div className="db-shooting-line" style={{ top: '20%', width: '200px', animationDelay: '0s' }} />
      <div className="db-shooting-line" style={{ top: '55%', width: '160px', animationDelay: '3s' }} />
      <div className="db-shooting-line" style={{ top: '80%', width: '240px', animationDelay: '5s' }} />

      {/* Subtle vignette overlay so cards have contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/30" />
    </div>
  );
};

export default DashboardBackground;
