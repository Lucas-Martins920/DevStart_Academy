import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Star, BookOpen, Trophy } from "lucide-react";

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string } | null>(null);
  const [stats, setStats] = useState({ xp: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const [{ data: prof }, { data: progress }, { data: lessons }] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).single(),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("completed", true),
        supabase.from("lessons").select("id, xp"),
      ]);

      if (prof) setProfile(prof as any);
      const completedIds = new Set((progress ?? []).map(p => p.lesson_id));
      const xp = (lessons ?? []).filter(l => completedIds.has(l.id)).reduce((s, l) => s + l.xp, 0);
      setStats({ xp, completed: completedIds.size, total: (lessons ?? []).length });
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <p className="text-text-mid text-center py-20">Carregando...</p>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-plasma text-xs font-bold uppercase tracking-[0.12em]">MEU PERFIL</span>
      <h1 className="font-syne font-extrabold text-3xl text-text-high mt-2 mb-8 tracking-tight">PERFIL</h1>

      <div className="bg-surface-1 border border-border rounded-3xl p-8 max-w-lg">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-plasma/20 flex items-center justify-center text-4xl">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : "🐱"}
          </div>
          <div>
            <h2 className="font-syne font-extrabold text-xl text-text-high">
              {profile?.display_name || "Aluno"}
            </h2>
            <p className="text-text-low text-xs">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-2 rounded-2xl p-4 text-center">
            <Star size={20} className="text-volt mx-auto mb-2" />
            <p className="font-syne font-bold text-text-high text-lg">{stats.xp}</p>
            <p className="text-[10px] text-text-low uppercase font-bold">XP Total</p>
          </div>
          <div className="bg-surface-2 rounded-2xl p-4 text-center">
            <BookOpen size={20} className="text-neon mx-auto mb-2" />
            <p className="font-syne font-bold text-text-high text-lg">{stats.completed}</p>
            <p className="text-[10px] text-text-low uppercase font-bold">Concluídas</p>
          </div>
          <div className="bg-surface-2 rounded-2xl p-4 text-center">
            <Trophy size={20} className="text-spark mx-auto mb-2" />
            <p className="font-syne font-bold text-text-high text-lg">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </p>
            <p className="text-[10px] text-text-low uppercase font-bold">Progresso</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfile;
