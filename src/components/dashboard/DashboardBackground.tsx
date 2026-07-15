import React from 'react';

const DashboardBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        .db-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(30,58,138,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,58,138,0.05) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 70%);
        }

        .db-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(50px);
          will-change: transform;
        }
      `}</style>

      {/* Base gradient — painted once */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-safebus-yellow/5" />

      {/* Static grid with radial mask — no animation, painted once */}
      <div className="db-grid" />

      {/* Static orbs — 1 instead of 3, blur 50px instead of 100px, no animation */}
      <div className="db-orb" style={{ top: '15%', left: '5%', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(30,58,138,0.12), transparent 70%)' }} />
      <div className="db-orb" style={{ bottom: '10%', right: '5%', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(251,191,36,0.12), transparent 70%)' }} />

      {/* Static decorative SVG — no animation, painted once */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.35 }}
      >
        <defs>
          <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Static curved lines — no animation */}
        <path d="M 60 650 Q 250 350, 450 480 T 1050 180" stroke="url(#rg1)" fill="none" strokeWidth="1.5" strokeDasharray="10 14" />
        <path d="M 120 80 Q 350 220, 650 120 T 1120 580" stroke="url(#rg2)" fill="none" strokeWidth="1.5" strokeDasharray="10 14" />
        <path d="M 30 380 Q 280 300, 550 580 T 1150 480" stroke="url(#rg1)" fill="none" strokeWidth="1" strokeDasharray="6 12" />

        {/* Static stop dots */}
        {[[60,650],[250,515],[450,480],[700,380],[1050,180],[120,80],[350,220],[650,120],[900,310],[1120,580],[30,380],[280,300],[550,580],[850,560],[1150,480]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="#FBBF24" opacity="0.5" />
        ))}
      </svg>

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-white/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40" />
    </div>
  );
};

export default DashboardBackground;