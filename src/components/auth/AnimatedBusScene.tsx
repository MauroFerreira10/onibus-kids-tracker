import React from 'react';

const AnimatedBusScene: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <style>{`
        @keyframes busRide {
          0%   { transform: translateX(-320px) translateY(0px); }
          48%  { transform: translateX(calc(50vw - 80px)) translateY(-6px); }
          50%  { transform: translateX(calc(50vw - 80px)) translateY(0px); }
          52%  { transform: translateX(calc(50vw - 80px)) translateY(-4px); }
          100% { transform: translateX(calc(100vw + 80px)) translateY(0px); }
        }
        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes floatCloud {
          0%   { transform: translateX(110vw); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateX(-20vw); opacity: 0; }
        }
        @keyframes starFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50%       { transform: translateY(-14px) scale(1.15); opacity: 1; }
        }
        @keyframes roadDash {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-120px); }
        }
        @keyframes exhaustPuff {
          0%   { transform: translateX(0) scale(0.4); opacity: 0.7; }
          100% { transform: translateX(-40px) scale(1.6); opacity: 0; }
        }
        @keyframes sunPulse {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50%       { opacity: 0.28; transform: scale(1.08); }
        }
        .bus-container { animation: busRide 7s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
        .wheel        { animation: wheelSpin 0.6s linear infinite; }
        .cloud-1      { animation: floatCloud 18s linear infinite; }
        .cloud-2      { animation: floatCloud 26s linear 6s infinite; }
        .cloud-3      { animation: floatCloud 22s linear 12s infinite; }
        .star-1       { animation: starFloat 3.2s ease-in-out infinite; }
        .star-2       { animation: starFloat 4.1s ease-in-out 0.8s infinite; }
        .star-3       { animation: starFloat 3.7s ease-in-out 1.6s infinite; }
        .road-dash    { animation: roadDash 0.5s linear infinite; }
        .exhaust-1    { animation: exhaustPuff 0.9s ease-out infinite; }
        .exhaust-2    { animation: exhaustPuff 0.9s ease-out 0.3s infinite; }
        .exhaust-3    { animation: exhaustPuff 0.9s ease-out 0.6s infinite; }
        .sun-glow     { animation: sunPulse 4s ease-in-out infinite; }
      `}</style>

      {/* Sun glow top-right */}
      <div className="sun-glow absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, #FBBF24 0%, transparent 70%)' }} />

      {/* Stars / sparkles */}
      {[
        { cls: 'star-1', top: '12%', left: '18%', size: 10 },
        { cls: 'star-2', top: '20%', right: '22%', size: 8 },
        { cls: 'star-3', top: '35%', left: '60%', size: 6 },
      ].map(({ cls, top, left, right, size }) => (
        <svg key={cls} className={cls} style={{ position: 'absolute', top, left, right, width: size, height: size }} viewBox="0 0 20 20">
          <path d="M10 0L12.245 7.755L20 10L12.245 12.245L10 20L7.755 12.245L0 10L7.755 7.755Z"
            fill="#FBBF24" fillOpacity="0.7" />
        </svg>
      ))}

      {/* Clouds */}
      {[
        { cls: 'cloud-1', bottom: '44%', opacity: 0.12, scale: 1 },
        { cls: 'cloud-2', bottom: '52%', opacity: 0.08, scale: 0.7 },
        { cls: 'cloud-3', bottom: '58%', opacity: 0.10, scale: 0.85 },
      ].map(({ cls, bottom, opacity, scale }) => (
        <svg key={cls} className={cls}
          style={{ position: 'absolute', bottom, width: 160 * scale, height: 60 * scale, opacity }}
          viewBox="0 0 160 60">
          <ellipse cx="80" cy="40" rx="78" ry="20" fill="white" />
          <ellipse cx="55" cy="32" rx="36" ry="26" fill="white" />
          <ellipse cx="105" cy="30" rx="32" ry="24" fill="white" />
          <ellipse cx="80" cy="24" rx="28" ry="22" fill="white" />
        </svg>
      ))}

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-20"
        style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.55) 0%, transparent 100%)' }} />

      {/* Road dashes */}
      <div className="absolute bottom-10 left-0 right-0 h-3 overflow-hidden">
        <div className="road-dash flex gap-8" style={{ width: '240px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 h-2 w-16 rounded-full"
              style={{ background: 'rgba(251,191,36,0.35)' }} />
          ))}
        </div>
      </div>

      {/* Bus */}
      <div className="bus-container absolute" style={{ bottom: '14px' }}>
        {/* Exhaust puffs */}
        <div style={{ position: 'absolute', left: -2, top: 28 }}>
          <div className="exhaust-1" style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
          <div className="exhaust-2" style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', top: 4, left: 6 }} />
          <div className="exhaust-3" style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', top: 8, left: 2 }} />
        </div>

        <svg width="160" height="88" viewBox="0 0 160 88" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bus body */}
          <rect x="10" y="8" width="140" height="62" rx="10" fill="#1E3A8A" />
          {/* Yellow stripe */}
          <rect x="10" y="46" width="140" height="6" fill="#FBBF24" opacity="0.9" />
          {/* Roof bar */}
          <rect x="18" y="8" width="124" height="6" rx="3" fill="#172E6E" />

          {/* Windows */}
          <rect x="20" y="16" width="28" height="22" rx="4" fill="#93C5FD" opacity="0.9" />
          <rect x="56" y="16" width="28" height="22" rx="4" fill="#93C5FD" opacity="0.9" />
          <rect x="92" y="16" width="28" height="22" rx="4" fill="#93C5FD" opacity="0.9" />
          {/* Window reflections */}
          <rect x="22" y="18" width="8" height="6" rx="2" fill="white" opacity="0.5" />
          <rect x="58" y="18" width="8" height="6" rx="2" fill="white" opacity="0.5" />
          <rect x="94" y="18" width="8" height="6" rx="2" fill="white" opacity="0.5" />

          {/* Door */}
          <rect x="126" y="16" width="20" height="32" rx="3" fill="#172E6E" />
          <line x1="136" y1="18" x2="136" y2="46" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Front face */}
          {/* Headlights */}
          <rect x="132" y="52" width="14" height="8" rx="3" fill="#FCD34D" opacity="0.95" />
          <rect x="132" y="52" width="14" height="4" rx="2" fill="white" opacity="0.4" />
          {/* Grill */}
          <rect x="130" y="64" width="20" height="3" rx="1.5" fill="#FBBF24" opacity="0.6" />

          {/* Bumper */}
          <rect x="10" y="66" width="140" height="6" rx="3" fill="#172E6E" />

          {/* Wheels */}
          <g transform="translate(32, 72)">
            <circle cx="0" cy="0" r="12" fill="#0F1D3A" />
            <circle cx="0" cy="0" r="8" fill="#374151" />
            <g className="wheel" style={{ transformOrigin: '0 0' }}>
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
              <line x1="-4.2" y1="-4.2" x2="4.2" y2="4.2" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="4.2" y1="-4.2" x2="-4.2" y2="4.2" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <circle cx="0" cy="0" r="3" fill="#FBBF24" />
          </g>

          <g transform="translate(120, 72)">
            <circle cx="0" cy="0" r="12" fill="#0F1D3A" />
            <circle cx="0" cy="0" r="8" fill="#374151" />
            <g className="wheel" style={{ transformOrigin: '0 0' }}>
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
              <line x1="-4.2" y1="-4.2" x2="4.2" y2="4.2" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="4.2" y1="-4.2" x2="-4.2" y2="4.2" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <circle cx="0" cy="0" r="3" fill="#FBBF24" />
          </g>

          {/* Tail light */}
          <rect x="10" y="52" width="10" height="8" rx="2" fill="#EF4444" opacity="0.85" />
          <rect x="10" y="52" width="10" height="4" rx="2" fill="#FCA5A5" opacity="0.5" />

          {/* SafeBus text */}
          <text x="84" y="44" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill="#FBBF24" letterSpacing="1">SAFEBUS</text>
        </svg>
      </div>
    </div>
  );
};

export default AnimatedBusScene;
