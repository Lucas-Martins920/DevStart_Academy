import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface StudentInfo {
  user_id: string;
  display_name: string;
  email: string;
  completed_lessons: number;
  total_xp: number;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: roles }, { data: profiles }, { data: progress }, { data: lessons }] = await Promise.all([
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("profiles").select("user_id, display_name"),
        supabase.from("lesson_progress").select("user_id, lesson_id, completed").eq("completed", true),
        supabase.from("lessons").select("id, xp"),
      ]);

      const studentIds = new Set((roles ?? []).filter(r => r.role === "student").map(r => r.user_id));
      const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p.display_name]));
      const xpMap = new Map((lessons ?? []).map(l => [l.id, l.xp]));

      const statsMap = new Map<string, { completed: number; xp: number }>();
      for (const p of (progress ?? [])) {
        if (!studentIds.has(p.user_id)) continue;
        const cur = statsMap.get(p.user_id) ?? { completed: 0, xp: 0 };
        cur.completed += 1;
        cur.xp += xpMap.get(p.lesson_id) ?? 0;
        statsMap.set(p.user_id, cur);
      }

      const result: StudentInfo[] = Array.from(studentIds).map(uid => ({
        user_id: uid,
        display_name: profileMap.get(uid) || "Aluno",
        email: "",
        completed_lessons: statsMap.get(uid)?.completed ?? 0,
        total_xp: statsMap.get(uid)?.xp ?? 0,
      }));

      result.sort((a, b) => b.total_xp - a.total_xp);
      setStudents(result);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-volt text-xs font-bold uppercase tracking-[0.12em]">PAINEL</span>
      <h1 className="font-syne font-extrabold text-3xl text-text-high mt-2 mb-2 tracking-tight">ALUNOS</h1>
      <p className="text-text-mid text-sm mb-8">Acompanhe o progresso individual de cada aluno.</p>

      {loading ? (
        <p className="text-text-mid text-center py-20">Carregando...</p>
      ) : students.length === 0 ? (
        <div className="text-center py-20 bg-surface-1 rounded-3xl border border-border">
          <div className="text-5xl mb-4">👨‍🎓</div>
          <p className="text-text-mid">Nenhum aluno cadastrado ainda.</p>
        </div>
      ) : (
        <div className="bg-surface-1 rounded-3xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">#</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">ALUNO</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">AULAS</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">XP</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.user_id} className="border-b border-border/50 hover:bg-surface-2/50">
                  <td className="p-4 text-sm text-text-low font-mono">{i + 1}</td>
                  <td className="p-4">
                    <p className="font-syne font-bold text-sm text-text-high">{s.display_name}</p>
                  </td>
                  <td className="p-4 text-sm text-neon font-bold">{s.completed_lessons}</td>
                  <td className="p-4 text-sm text-volt font-bold">{s.total_xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default AdminStudents;
