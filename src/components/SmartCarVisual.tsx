import { motion } from "motion/react";

export default function SmartCarVisual() {
  return (
    <div className="relative w-full max-w-[520px] aspect-[520/280]">
      {/* Car Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-[radial-gradient(ellipse,rgba(37,99,235,0.2)_0%,transparent_70%)]"
      />

      <motion.svg 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-full h-full drop-shadow-[0_20px_40px_rgba(37,99,235,0.4)]" 
        viewBox="0 0 520 280" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#1E40AF" }} />
            <stop offset="50%" style={{ stopColor: "#2563EB" }} />
            <stop offset="100%" style={{ stopColor: "#1D4ED8" }} />
          </linearGradient>
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#1E3A8A" }} />
            <stop offset="100%" style={{ stopColor: "#1E40AF" }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="260" cy="260" rx="220" ry="20" fill="rgba(37,99,235,0.2)" />

        {/* Car main body */}
        <rect x="60" y="140" width="400" height="100" rx="12" fill="url(#bodyGrad)" stroke="rgba(96,165,250,0.4)" strokeWidth="1" />

        {/* Roof/Cabin */}
        <path d="M130 140 L160 80 L360 80 L390 140 Z" fill="url(#roofGrad)" stroke="rgba(96,165,250,0.4)" strokeWidth="1" />

        {/* Windows */}
        <path d="M168 135 L185 95 L255 95 L255 135 Z" fill="rgba(147,197,253,0.25)" stroke="rgba(147,197,253,0.4)" strokeWidth="1" />
        <path d="M263 135 L263 95 L335 95 L352 135 Z" fill="rgba(147,197,253,0.25)" stroke="rgba(147,197,253,0.4)" strokeWidth="1" />

        {/* Headlights */}
        <rect x="60" y="155" width="40" height="20" rx="6" fill="#FCD34D" opacity="0.9" filter="url(#glow)" />
        <rect x="62" y="157" width="36" height="16" rx="4" fill="#FEF3C7" opacity="0.6" />

        {/* Tail lights */}
        <rect x="420" y="155" width="35" height="20" rx="6" fill="#F87171" opacity="0.9" filter="url(#glow)" />

        {/* Wheels */}
        <circle cx="150" cy="240" r="42" fill="#0F172A" stroke="rgba(96,165,250,0.6)" strokeWidth="3" />
        <circle cx="150" cy="240" r="28" fill="#1E293B" stroke="rgba(96,165,250,0.4)" strokeWidth="2" />
        <circle cx="150" cy="240" r="12" fill="#2563EB" />

        <circle cx="370" cy="240" r="42" fill="#0F172A" stroke="rgba(96,165,250,0.6)" strokeWidth="3" />
        <circle cx="370" cy="240" r="28" fill="#1E293B" stroke="rgba(96,165,250,0.4)" strokeWidth="2" />
        <circle cx="370" cy="240" r="12" fill="#2563EB" />

        {/* Wheel spokes */}
        <line x1="150" y1="212" x2="150" y2="268" stroke="rgba(96,165,250,0.5)" strokeWidth="2" />
        <line x1="122" y1="240" x2="178" y2="240" stroke="rgba(96,165,250,0.5)" strokeWidth="2" />

        <line x1="370" y1="212" x2="370" y2="268" stroke="rgba(96,165,250,0.5)" strokeWidth="2" />
        <line x1="342" y1="240" x2="398" y2="240" stroke="rgba(96,165,250,0.5)" strokeWidth="2" />

        {/* Door line */}
        <line x1="258" y1="140" x2="258" y2="200" stroke="rgba(96,165,250,0.3)" strokeWidth="1" />

        {/* Damage areas (dents) */}
        <path d="M85 160 Q90 150 95 160 Q100 170 95 175 Q90 165 85 160 Z" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" />
        <path d="M340 145 Q348 138 355 145 Q360 155 352 158 Q344 152 340 145 Z" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" />
        <path d="M200 195 Q208 188 215 195 Q220 205 212 208 Q204 202 200 195 Z" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" />
      </motion.svg>

      {/* Scan Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06B6D4,0_0_40px_#2563EB] animate-scan" />
      </div>

      {/* Damage Markers */}
      <DamageMarker top="35%" left="15%" label="Bent" delay={0.5} />
      <DamageMarker top="50%" left="65%" label="Scratch" delay={1} />
      <DamageMarker top="65%" left="40%" label="Crack" delay={1.5} />

      {/* AI Analysis Cards */}
      <motion.div 
        animate={{ y: [0, -10, 0], rotate: [-2, 0, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20px] right-[-40px] z-30 min-w-[180px] p-4 glass-panel border-blue-500/40"
      >
        <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-widest mb-2">🤖 AI Confidence</div>
        <div className="text-2xl font-black">97.4%</div>
        <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
          <motion.div 
            animate={{ width: ["0%", "87%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
          />
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 10, 0], rotate: [2, 0, 2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-[-40px] z-30 min-w-[180px] p-4 glass-panel border-blue-500/40"
      >
        <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-widest mb-2">💰 Estimated Cost</div>
        <div className="text-2xl font-black">$2,450</div>
        <div className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded-full text-[10px] font-bold mt-2">
          Verified
        </div>
      </motion.div>
    </div>
  );
}

function DamageMarker({ top, left, label, delay }: { top: string; left: string; label: string; delay: number }) {
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity, delay }}
      style={{ top, left }}
      className="absolute z-20 group"
    >
      <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center relative shadow-[0_0_15px_rgba(239,68,68,0.4)]">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
