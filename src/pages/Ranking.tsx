import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RankEntry {
  user_id: string;
  display_name: string;
  total_xp: number;
  completed_lessons: number;
}

const Ranking = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);

      const { data, error: rankingError } = await supabase.rpc("get_student_ranking");

      if (rankingError) {
        console.error("Erro ao carregar ranking:", rankingError);
        setError("Nao foi possivel carregar o ranking agora.");
        setRanking([]);
        setLoading(false);
        return;
      }

      setRanking((data ?? []) as RankEntry[]);
      setLoading(false);
    };

    void fetchRanking();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-volt text-xs font-bold uppercase tracking-[0.12em]">CLASSIFICAÇÃO</span>
      <h1 className="font-syne font-extrabold text-3xl text-text-high mt-2 mb-2 tracking-tight">RANKING</h1>
      <p className="text-text-mid text-sm mb-8">Veja quem lidera a trilha! 🏆</p>

      {loading ? (
        <p className="text-text-mid text-center py-20">Carregando ranking...</p>
      ) : error ? (
        <div className="text-center py-20 bg-surface-1 rounded-3xl border border-border">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-text-mid">{error}</p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-20 bg-surface-1 rounded-3xl border border-border">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-text-mid">Nenhum aluno completou aulas ainda.</p>
        </div>
      ) : (
        <div className="bg-surface-1 rounded-3xl border border-border overflow-hidden">
          {ranking.map((entry, i) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-4 px-6 py-4 border-b border-border/50 last:border-0 ${
                entry.user_id === user?.id ? "bg-spark/5" : ""
              }`}
            >
              <span className="text-2xl w-8 text-center">
                {i < 3 ? medals[i] : <span className="text-sm text-text-low font-mono">{i + 1}</span>}
              </span>
              <div className="flex-1">
                <p className="font-syne font-bold text-text-high text-sm">
                  {entry.display_name}
                  {entry.user_id === user?.id && (
                    <span className="text-spark text-[10px] ml-2">(você)</span>
                  )}
                </p>
                <p className="text-[10px] text-text-low">{entry.completed_lessons} aulas concluídas</p>
              </div>
              <span className="text-volt text-sm font-bold">{entry.total_xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Ranking;
