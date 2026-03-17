import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Trophy, TrendingUp } from "lucide-react";

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLessons: 0,
    avgProgress: 0,
    topLessons: [] as { title: string; emoji: string; completions: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: roles }, { data: lessons }, { data: progress }] = await Promise.all([
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("lessons").select("id, title, emoji"),
        supabase.from("lesson_progress").select("user_id, lesson_id, completed").eq("completed", true),
      ]);

      const studentIds = new Set((roles ?? []).filter(r => r.role === "student").map(r => r.user_id));
      const totalStudents = studentIds.size;
      const totalLessons = (lessons ?? []).length;

      // Completions per lesson
      const lessonCompletions = new Map<string, number>();
      const studentCompletions = new Map<string, number>();
      for (const p of (progress ?? [])) {
        if (!studentIds.has(p.user_id)) continue;
        lessonCompletions.set(p.lesson_id, (lessonCompletions.get(p.lesson_id) ?? 0) + 1);
        studentCompletions.set(p.user_id, (studentCompletions.get(p.user_id) ?? 0) + 1);
      }

      const avgProgress = totalStudents > 0 && totalLessons > 0
        ? Math.round(
            (Array.from(studentCompletions.values()).reduce((s, v) => s + v, 0) / totalStudents / totalLessons) * 100
          )
        : 0;

      const lessonMap = new Map((lessons ?? []).map(l => [l.id, l]));
      const topLessons = Array.from(lessonCompletions.entries())
        .map(([id, count]) => ({
          title: lessonMap.get(id)?.title ?? "",
          emoji: lessonMap.get(id)?.emoji ?? "📚",
          completions: count,
        }))
        .sort((a, b) => b.completions - a.completions)
        .slice(0, 5);

      setStats({ totalStudents, totalLessons, avgProgress, topLessons });
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <p className="text-text-mid text-center py-20">Carregando...</p>;

  const cards = [
    { label: "Total de Alunos", value: stats.totalStudents, icon: Users, color: "text-spark" },
    { label: "Total de Aulas", value: stats.totalLessons, icon: BookOpen, color: "text-neon" },
    { label: "Progresso Médio", value: `${stats.avgProgress}%`, icon: TrendingUp, color: "text-volt" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-volt text-xs font-bold uppercase tracking-[0.12em]">PAINEL</span>
      <h1 className="font-syne font-extrabold text-3xl text-text-high mt-2 mb-8 tracking-tight">ESTATÍSTICAS</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface-1 border border-border rounded-3xl p-6">
            <c.icon size={24} className={`${c.color} mb-3`} />
            <p className="font-syne font-extrabold text-2xl text-text-high">{c.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-low mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-1 border border-border rounded-3xl p-6">
        <h2 className="font-syne font-bold text-sm text-text-high mb-4 uppercase tracking-wider">
          🔥 AULAS MAIS ASSISTIDAS
        </h2>
        {stats.topLessons.length === 0 ? (
          <p className="text-text-low text-sm">Nenhuma aula completada ainda.</p>
        ) : (
          <div className="space-y-3">
            {stats.topLessons.map((l, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{l.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-high">{l.title}</p>
                  <div className="h-2 bg-surface-3 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-neon rounded-full"
                      style={{ width: `${Math.min(100, (l.completions / Math.max(stats.totalStudents, 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-text-mid">{l.completions} alunos</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminStats;
