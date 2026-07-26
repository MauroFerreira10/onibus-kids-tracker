import React from 'react';

export interface Segment {
  startScroll: number;
  endScroll: number;
  startBus: number;
  endBus: number;
}

export interface Waypoint {
  label: string;
  busPct: number;
}

interface BusJourneyProps {
  progress: number;
  activeWaypoint: number;
}

const WAYPOINTS: Waypoint[] = [
  { label: '', busPct: 0 },
  { label: 'Funcionalidades', busPct: 20 },
  { label: 'Benefícios', busPct: 45 },
  { label: 'Como Funciona', busPct: 70 },
  { label: 'CTA', busPct: 90 },
];

export const SEGMENTS: Segment[] = [
  { startScroll: 0.00, endScroll: 0.12, startBus: 0.00, endBus: 20.00 },
  { startScroll: 0.12, endScroll: 0.22, startBus: 20.00, endBus: 20.00 },
  { startScroll: 0.22, endScroll: 0.35, startBus: 20.00, endBus: 45.00 },
  { startScroll: 0.35, endScroll: 0.48, startBus: 45.00, endBus: 45.00 },
  { startScroll: 0.48, endScroll: 0.60, startBus: 45.00, endBus: 70.00 },
  { startScroll: 0.60, endScroll: 0.72, startBus: 70.00, endBus: 70.00 },
  { startScroll: 0.72, endScroll: 0.85, startBus: 70.00, endBus: 90.00 },
  { startScroll: 0.85, endScroll: 1.00, startBus: 90.00, endBus: 90.00 },
];

export function mapScrollToBus(scrollProgress: number): number {
  if (scrollProgress <= 0) return 0;
  if (scrollProgress >= 1) return 90;
  for (const seg of SEGMENTS) {
    if (scrollProgress >= seg.startScroll && scrollProgress < seg.endScroll) {
      const t = (scrollProgress - seg.startScroll) / (seg.endScroll - seg.startScroll);
      return seg.startBus + (seg.endBus - seg.startBus) * t;
    }
  }
  return 90;
}

export function getActiveWaypoint(scrollProgress: number): number {
  if (scrollProgress >= 0.85) return 4;
  if (scrollProgress >= 0.60) return 3;
  if (scrollProgress >= 0.35) return 2;
  if (scrollProgress >= 0.12) return 1;
  return 0;
}

const SchoolBusSVG: React.FC<{ moving?: boolean }> = ({ moving }) => (
  <div className={`relative transition-transform duration-200 ${moving ? 'scale-110' : 'scale-100'}`}>
    <svg width="52" height="36" viewBox="0 0 52 36" fill="none" aria-hidden="true">
      {/* shadow */}
      <ellipse cx="26" cy="33" rx="20" ry="3" fill="rgba(0,0,0,0.15)" />
      {/* body */}
      <rect x="4" y="10" width="44" height="20" rx="4" fill="#FBBF24" />
      {/* roof */}
      <rect x="12" y="4" width="28" height="8" rx="3" fill="#FBBF24" />
      {/* roof highlight */}
      <rect x="14" y="5" width="24" height="2" rx="1" fill="#FCD34D" opacity={0.6} />
      {/* stripe */}
      <rect x="4" y="22" width="44" height="3" fill="#1E3A8A" />
      {/* windows */}
      <rect x="10" y="13" width="8" height="7" rx="1.5" fill="#1E3A8A" />
      <rect x="22" y="13" width="8" height="7" rx="1.5" fill="#1E3A8A" />
      <rect x="34" y="13" width="8" height="7" rx="1.5" fill="#1E3A8A" />
      {/* window reflections */}
      <rect x="11" y="14" width="2.5" height="5" rx="0.5" fill="rgba(255,255,255,0.15)" />
      <rect x="23" y="14" width="2.5" height="5" rx="0.5" fill="rgba(255,255,255,0.15)" />
      <rect x="35" y="14" width="2.5" height="5" rx="0.5" fill="rgba(255,255,255,0.15)" />
      {/* wheels */}
      <circle cx="16" cy="30" r="4.5" fill="#212529" />
      <circle cx="16" cy="30" r="2" fill="#4A5568" />
      <circle cx="36" cy="30" r="4.5" fill="#212529" />
      <circle cx="36" cy="30" r="2" fill="#4A5568" />
      {/* headlights */}
      <rect x="45" y="16" width="3" height="6" rx="1" fill="white" />
      <rect x="45" y="17" width="2" height="4" rx="0.5" fill="#FDE68A" />
    </svg>
    {/* motion dust */}
    {moving && (
      <div className="absolute -right-3 bottom-0 flex gap-0.5">
        <div className="w-1 h-1 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '0.6s' }} />
        <div className="w-0.5 h-0.5 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }} />
      </div>
    )}
  </div>
);

const BusJourney: React.FC<BusJourneyProps> = ({ progress, activeWaypoint }) => {
  const moving = SEGMENTS.some(
    (s) => progress >= s.startScroll && progress < s.endScroll && s.startBus !== s.endBus
  );

  const ROUTE_PADDING = 8;

  return (
    <>
      {/* Road strip behind track */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-[28px] bg-safebus-blue/95 backdrop-blur-sm border-t border-white/8">
        {/* road surface */}
        <div className="absolute inset-0 flex items-center">
          {/* dashed center line */}
          <div
            className="absolute h-[1.5px]"
            style={{
              left: `${ROUTE_PADDING}%`,
              right: `${ROUTE_PADDING}%`,
              background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 12px, transparent 12px, transparent 24px)',
            }}
          />
          {/* top edge */}
          <div
            className="absolute h-[1px] bg-white/5"
            style={{ left: `${ROUTE_PADDING}%`, right: `${ROUTE_PADDING}%`, top: '4px' }}
          />
          {/* bottom edge */}
          <div
            className="absolute h-[1px] bg-white/5"
            style={{ left: `${ROUTE_PADDING}%`, right: `${ROUTE_PADDING}%`, bottom: '4px' }}
          />
        </div>

        {/* waypoint markers on road */}
        {WAYPOINTS.map((wp, i) => {
          if (i === 0) return null;
          const left = ROUTE_PADDING + (wp.busPct / 100) * (100 - ROUTE_PADDING * 2);
          const isActive = i <= activeWaypoint;
          const isCurrent = i === activeWaypoint;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${left}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
            >
              {/* stop dot */}
              <div
                className={`rounded-full transition-all duration-700 ${
                  isCurrent
                    ? 'w-[7px] h-[7px] bg-safebus-yellow shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                    : isActive
                      ? 'w-[5px] h-[5px] bg-safebus-yellow/60'
                      : 'w-[4px] h-[4px] bg-white/15'
                }`}
              />
            </div>
          );
        })}

        {/* bus */}
        <div
          className="absolute bottom-0" style={{ transition: 'left 400ms ease-out' }}
          style={{
            left: `${ROUTE_PADDING + (progress / 100) * (100 - ROUTE_PADDING * 2)}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="relative" style={{ bottom: '-2px' }}>
            <SchoolBusSVG moving={moving} />
          </div>
        </div>

        {/* active waypoint label */}
        {activeWaypoint > 0 && (
          <div
            className="absolute -top-5 text-[9px] font-medium text-safebus-yellow/70 whitespace-nowrap transition-all duration-500"
            style={{
              left: `${ROUTE_PADDING + (WAYPOINTS[activeWaypoint]?.busPct / 100) * (100 - ROUTE_PADDING * 2)}%`,
              transform: 'translateX(-50%)',
              opacity: activeWaypoint > 0 ? 1 : 0,
            }}
          >
            {WAYPOINTS[activeWaypoint]?.label}
          </div>
        )}
      </div>

      {/* spacer so content isn't hidden behind track */}
      <div className="h-[28px]" />
    </>
  );
};

export default BusJourney;
