import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";

interface Suggestion {
  id: string;
  message: string;
  author_email: string;
  author_role: string;
  created_at: string;
}

const AdminSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false });
      setSuggestions((data as any) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const roleLabel = (r: string) => {
    if (r === "admin") return "Admin";
    if (r === "professor") return "Professor";
    return "Aluno";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-volt text-xs font-bold uppercase tracking-[0.12em]">FEEDBACK</span>
      <h1 className="font-syne font-extrabold text-3xl text-text-high mt-2 mb-2 tracking-tight">SUGESTÕES</h1>
      <p className="text-text-mid text-sm mb-8">Sugestões enviadas pelos alunos e professores.</p>

      {loading ? (
        <p className="text-text-mid text-center py-20">Carregando...</p>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-20 bg-surface-1 rounded-3xl border border-border">
          <div className="text-5xl mb-4">💡</div>
          <p className="text-text-mid">Nenhuma sugestão recebida ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s) => (
            <div key={s.id} className="bg-surface-1 border border-border rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-plasma/15 flex items-center justify-center shrink-0">
                  <MessageSquare size={18} className="text-plasma" />
                </div>
                <div className="flex-1">
                  <p className="text-text-high text-sm mb-2">{s.message}</p>
                  <div className="flex items-center gap-3 text-[10px] text-text-low">
                    <span>{s.author_email}</span>
                    <span className="bg-surface-2 px-2 py-0.5 rounded-full font-bold uppercase">
                      {roleLabel(s.author_role)}
                    </span>
                    <span>{new Date(s.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdminSuggestions;
