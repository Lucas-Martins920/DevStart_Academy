import { motion } from "framer-motion";

interface LessonCardProps {
  title: string;
  description: string;
  emoji: string;
  xp: number;
  progress: number;
  color: "spark" | "neon" | "volt" | "plasma" | "sky";
  locked?: boolean;
  current?: boolean;
  onClick?: () => void;
}

const colorMap = {
  spark: { bg: "bg-spark/15", text: "text-spark", border: "border-spark/30" },
  neon: { bg: "bg-neon/15", text: "text-neon", border: "border-neon/30" },
  volt: { bg: "bg-volt/15", text: "text-volt", border: "border-volt/30" },
  plasma: { bg: "bg-plasma/15", text: "text-plasma", border: "border-plasma/30" },
  sky: { bg: "bg-sky/15", text: "text-sky", border: "border-sky/30" },
};

const LessonCard = ({
  title,
  description,
  emoji,
  xp,
  progress,
  color,
  locked = false,
  current = false,
  onClick,
}: LessonCardProps) => {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: locked ? 0.4 : 1, y: 0 }}
      whileHover={locked ? {} : { y: -4 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      onClick={locked ? undefined : onClick}
      className={`relative bg-surface-1 border rounded-3xl overflow-hidden cursor-pointer transition-colors ${
        current ? `border-2 ${c.border}` : "border-border"
      } ${locked ? "grayscale pointer-events-none" : ""}`}
    >
      {/* Banner */}
      <div className={`h-24 flex items-center justify-center ${c.bg} relative`}>
        <span className="text-5xl animate-float">{emoji}</span>
        {current && (
          <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${c.bg} ${c.text}`}>
            ATUAL
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-syne font-extrabold text-text-high text-lg leading-tight mb-1">
          {title}
        </h3>
        <p className="text-xs text-text-mid leading-relaxed mb-3">{description}</p>

        {/* Progress */}
        {progress > 0 && (
          <div className="mb-3">
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full relative overflow-hidden ${
                  color === "neon" ? "bg-neon" : color === "spark" ? "bg-spark" : color === "volt" ? "bg-volt" : color === "plasma" ? "bg-plasma" : "bg-sky"
                }`}
                style={{ width: `${progress}%` }}
              >
                <div className="shimmer absolute inset-0" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <span className="text-xs font-bold text-volt flex items-center gap-1">
          ⚡ {xp} XP
        </span>
        {progress === 100 && (
          <span className="text-xs font-bold text-neon">✓ COMPLETO</span>
        )}
      </div>
    </motion.div>
  );
};

export default LessonCard;
