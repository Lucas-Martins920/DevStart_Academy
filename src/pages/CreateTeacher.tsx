import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CreateTeacher = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Sign up the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Assign professor role
      await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: "professor" as any,
      });

      toast({
        title: "Professor criado!",
        description: `Conta criada para ${email}. O professor receberá um email de confirmação.`,
      });
      setEmail("");
      setPassword("");
    }

    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-volt text-xs font-bold uppercase tracking-[0.12em]">GERENCIAR</span>
      <h1 className="font-syne font-extrabold text-3xl text-text-high mt-2 mb-2 tracking-tight">CRIAR PROFESSOR</h1>
      <p className="text-text-mid text-sm mb-8">Crie contas de professor para sua equipe.</p>

      <div className="bg-surface-1 border border-border rounded-3xl p-8 max-w-lg">
        {error && (
          <div className="flex items-center gap-2 bg-spark/10 text-spark text-sm p-3 rounded-2xl mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
              EMAIL DO PROFESSOR
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-low" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-2 border-2 border-border rounded-2xl py-3 pl-11 pr-4 text-text-high text-sm font-medium placeholder:text-text-low focus:border-volt focus:outline-none transition-colors"
                placeholder="professor@escola.com"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
              SENHA TEMPORÁRIA
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-low" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-surface-2 border-2 border-border rounded-2xl py-3 pl-11 pr-4 text-text-high text-sm font-medium placeholder:text-text-low focus:border-volt focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
            <UserPlus size={16} /> {loading ? "CRIANDO..." : "CRIAR PROFESSOR"}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateTeacher;
