import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070f2b] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          opacity: 0.015,
        }}
      />

      <motion.div
        className="absolute w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
      />

      <div className="relative flex flex-col items-center">
        <div className="relative w-[140px] h-[160px]">
          <motion.div
            className="absolute inset-0 rounded-full blur-xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)' }}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
          />

          <svg width="140" height="160" viewBox="0 0 240 280" fill="none" className="relative z-10">
            <motion.path
              d="M120 8C58.144 8 8 58.144 8 120c0 84 112 152 112 152s112-68 112-152C232 58.144 181.856 8 120 8z"
              fill="#FBBF24"
              animate={{ scale: [1, 1.02, 1], originX: 120, originY: 120 }}
              transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.circle
              cx="120" cy="120" r="68" fill="#FFFFFF"
              animate={{ scale: [1, 0.97, 1], originX: 120, originY: 120 }}
              transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.g
              fill="#1E3A8A"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
            >
              <path d="M88 86c-3.314 0-6 2.686-6 6v60c0 2.21 1.79 4 4 4h4v6c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-6h32v6c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-6h4c2.21 0 4-1.79 4-4V92c0-3.314-2.686-6-6-6H88z" />
              <rect x="100" y="80" width="40" height="8" rx="2" />
            </motion.g>
            <motion.path
              d="M93 100c0-1.105.895-2 2-2h22v26H95c-1.105 0-2-.895-2-2v-22z" fill="#FFFFFF"
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.path
              d="M123 98h22c1.105 0 2 .895 2 2v22c0 1.105-.895 2-2 2h-22V98z" fill="#FFFFFF"
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, delay: 0.3 }}
            />
            <motion.circle
              cx="96" cy="146" r="3" fill="#FFFFFF"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, delay: 0.1 }}
            />
            <motion.circle
              cx="144" cy="146" r="3" fill="#FFFFFF"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, delay: 0.4 }}
            />
            <rect x="108" y="138" width="24" height="3" rx="1.5" fill="#FFFFFF" />
            <rect x="108" y="144" width="24" height="3" rx="1.5" fill="#FFFFFF" />
          </svg>

          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 140 160">
            <motion.circle
              cx="70" cy="75" r="62"
              fill="none"
              stroke="rgba(251,191,36,0.15)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="390"
              strokeDashoffset="390"
              animate={{ strokeDashoffset: [390, 0, 390] }}
              transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity }}
            />
          </svg>
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.h1
            className="text-white font-semibold text-[clamp(1.2rem,1.8vw,1.8rem)] tracking-[-0.02em]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            SafeBus
          </motion.h1>
          <motion.p
            className="text-white/25 text-[clamp(0.75rem,0.85vw,0.85rem)] font-mono tracking-[0.15em] uppercase mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
            >
              Carregando
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, delay: 0 }}
            >.</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, delay: 0.3 }}
            >.</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, delay: 0.6 }}
            >.</motion.span>
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[120px] h-[1px] bg-white/[0.04] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="h-full bg-safebus-yellow/40"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}
