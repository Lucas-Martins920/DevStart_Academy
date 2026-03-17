import { motion } from "framer-motion";
import { Target, Clock, Star } from "lucide-react";

const missions = [
  { id: 1, title: "Complete 3 aulas esta semana", emoji: "📚", xp: 150, type: "semanal", progress: 0, total: 3 },
  { id: 2, title: "Acerte 10 perguntas do quiz", emoji: "🧠", xp: 100, type: "diária", progress: 0, total: 10 },
  { id: 3, title: "Faça login por 5 dias seguidos", emoji: "🔥", xp: 200, type: "semanal", progress: 0, total: 5 },
];

const Missions = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-spark text-xs font-bold uppercase tracking-[0.12em]">DESAFIOS</span>
      <h1 className="font-syne font-extrabold text-3xl text-text-high mt-2 mb-2 tracking-tight">MISSÕES</h1>
      <p className="text-text-mid text-sm mb-8">Complete desafios diários e semanais para ganhar XP extra!</p>

      <div className="space-y-4">
        {missions.map((m) => (
          <div key={m.id} className="bg-surface-1 border border-border rounded-3xl p-6 flex items-center gap-4">
            <div className="text-4xl">{m.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-syne font-bold text-text-high text-sm">{m.title}</h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  m.type === "diária" ? "bg-neon/15 text-neon" : "bg-plasma/15 text-plasma"
                }`}>
                  {m.type}
                </span>
              </div>
              <div className="h-2 bg-surface-3 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-spark rounded-full" style={{ width: `${(m.progress / m.total) * 100}%` }} />
              </div>
              <p className="text-[10px] text-text-low mt-1">{m.progress}/{m.total}</p>
            </div>
            <div className="flex items-center gap-1 text-volt text-xs font-bold">
              <Star size={14} /> {m.xp} XP
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <p className="text-text-mid text-sm">Sistema de missões em breve com dados reais!</p>
      </div>
    </motion.div>
  );
};

export default Missions;
