import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LessonCard from "@/components/LessonCard";
import { Flame, Star } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  order_index: number;
  color: "spark" | "neon" | "volt" | "plasma" | "sky";
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index", { ascending: true });

      if (lessonsError) {
        console.error("Erro ao carregar aulas:", lessonsError);
        setError("Nao foi possivel carregar as aulas agora.");
        setLessons([]);
        setProgress([]);
        setLoading(false);
        return;
      }

      setLessons((lessonsData ?? []) as any);

      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from("lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id);

        if (progressError) {
          console.error("Erro ao carregar progresso:", progressError);
          setError("As aulas carregaram, mas o progresso do aluno nao foi recuperado.");
        } else {
          setProgress(progressData ?? []);
        }
      }

      setLoading(false);
    };

    void fetchData();
  }, [user]);

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const totalXp = lessons
    .filter((l) => completedIds.has(l.id))
    .reduce((sum, l) => sum + l.xp, 0);
  const completedCount = completedIds.size;
  const currentLessonIndex = lessons.findIndex((l) => !completedIds.has(l.id));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Stats */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-volt/15 text-volt px-4 py-2 rounded-full text-xs font-bold">
          <Star size={14} /> {totalXp} XP
        </div>
        <div className="flex items-center gap-2 bg-coral/15 text-coral px-4 py-2 rounded-full text-xs font-bold">
          <Flame size={14} /> {completedCount} aulas
        </div>
      </div>

      <span className="text-neon text-xs font-bold uppercase tracking-[0.12em]">SUA TRILHA</span>
      <h1 className="font-syne font-extrabold text-3xl text-text-high mt-2 mb-2 tracking-tight">APRENDA SCRATCH</h1>
      <p className="text-text-mid text-sm mb-8 max-w-lg">
        Complete cada fase para desbloquear a próxima. Ganhe XP e evolua na trilha!
      </p>

      {/* Overall progress */}
      <div className="bg-surface-1 rounded-3xl p-6 mb-10 border border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-text-mid uppercase tracking-wider">PROGRESSO GERAL</span>
          <span className="text-xs font-bold text-neon">
            {lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 bg-surface-3 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: lessons.length > 0 ? `${(completedCount / lessons.length) * 100}%` : "0%" }}
            transition={{ duration: 1, ease: [0.34, 1.1, 0.64, 1] }}
            className="h-full bg-neon rounded-full relative overflow-hidden"
          >
            <div className="shimmer absolute inset-0" />
          </motion.div>
        </div>
      </div>

      {/* Lesson cards */}
      {loading ? (
        <div className="text-text-mid text-center py-20">Carregando trilha...</div>
      ) : error ? (
        <div className="text-center py-20 bg-surface-1 rounded-3xl border border-border">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-text-mid">{error}</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-text-mid">Nenhuma aula disponível ainda.</p>
          <p className="text-text-low text-sm mt-1">Aguarde o professor adicionar conteúdo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => {
            const isCompleted = completedIds.has(lesson.id);
            const isCurrent = index === currentLessonIndex;
            const isLocked = index > currentLessonIndex && currentLessonIndex !== -1;

            return (
              <div key={lesson.id} className="relative">
                {index > 0 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 border-l-2 border-dashed border-text-low/30" />
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <LessonCard
                    title={lesson.title}
                    description={lesson.description}
                    emoji={lesson.emoji}
                    xp={lesson.xp}
                    progress={isCompleted ? 100 : isCurrent ? 50 : 0}
                    color={lesson.color}
                    locked={isLocked}
                    current={isCurrent}
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
