import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Badge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  condition: (stats: Stats) => boolean;
}

interface Stats {
  completedLessons: number;
  totalXp: number;
  quizPerfects: number;
}

const BADGES: Badge[] = [
  { id: "first-lesson", emoji: "🌱", title: "Primeiro Passo", description: "Complete sua primeira aula", condition: (s) => s.completedLessons >= 1 },
  { id: "three-lessons", emoji: "🔥", title: "Em Chamas", description: "Complete 3 aulas", condition: (s) => s.completedLessons >= 3 },
  { id: "five-lessons", emoji: "⭐", title: "Estrela em Ascensão", description: "Complete 5 aulas", condition: (s) => s.completedLessons >= 5 },
  { id: "ten-lessons", emoji: "🏆", title: "Mestre Aprendiz", description: "Complete 10 aulas", condition: (s) => s.completedLessons >= 10 },
  { id: "xp-500", emoji: "💎", title: "Coletor de XP", description: "Acumule 500 XP", condition: (s) => s.totalXp >= 500 },
  { id: "xp-1000", emoji: "👑", title: "Rei do XP", description: "Acumule 1000 XP", condition: (s) => s.totalXp >= 1000 },
  { id: "quiz-perfect", emoji: "🧠", title: "Gênio do Quiz", description: "Gabarite um quiz", condition: (s) => s.quizPerfects >= 1 },
  { id: "quiz-3-perfect", emoji: "🎯", title: "Mente Afiada", description: "Gabarite 3 quizzes", condition: (s) => s.quizPerfects >= 3 },
];

const Achievements = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ completedLessons: 0, totalXp: 0, quizPerfects: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [
        { data: progress, error: progressError },
        { data: lessons, error: lessonsError },
        { data: attempts, error: attemptsError },
      ] = await Promise.all([
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("completed", true),
        supabase.from("lessons").select("id, xp"),
        supabase.from("quiz_attempts").select("score, total_questions").eq("user_id", user.id),
      ]);

      if (progressError || lessonsError || attemptsError) {
        console.error("Erro ao carregar conquistas:", {
          progressError,
          lessonsError,
          attemptsError,
        });
        setError("Nao foi possivel carregar as conquistas agora.");
        setLoading(false);
        return;
      }

      const completedIds = new Set((progress ?? []).map(p => p.lesson_id));
      const totalXp = (lessons ?? []).filter(l => completedIds.has(l.id)).reduce((s, l) => s + l.xp, 0);
      const quizPerfects = (attempts ?? []).filter(a => a.score === a.total_questions && a.total_questions > 0).length;

      setStats({ completedLessons: completedIds.size, totalXp, quizPerfects });
      setLoading(false);
    };

    void fetchStats();
  }, [user]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-neon text-xs font-bold uppercase tracking-[0.12em]">COLEÇÃO</span>
      <h1 className="font-syne font-extrabold text-3xl text-text-high mt-2 mb-2 tracking-tight">CONQUISTAS</h1>
      <p className="text-text-mid text-sm mb-8">Desbloqueie badges ao atingir marcos especiais!</p>

      {loading ? (
        <p className="text-text-mid text-center py-20">Carregando...</p>
      ) : error ? (
        <p className="text-text-mid text-center py-20">{error}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const unlocked = badge.condition(stats);
            return (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`bg-surface-1 border rounded-3xl p-6 text-center transition-all ${
                  unlocked ? "border-neon/30" : "border-border opacity-40 grayscale"
                }`}
              >
                <div className="text-5xl mb-3">{badge.emoji}</div>
                <h3 className="font-syne font-bold text-text-high text-xs mb-1">{badge.title}</h3>
                <p className="text-[10px] text-text-low">{badge.description}</p>
                {unlocked && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-neon bg-neon/15 px-2 py-0.5 rounded-full">
                    DESBLOQUEADO
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Achievements;
