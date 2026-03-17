import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Mail, Lock, AlertCircle } from "lucide-react";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      const { error: authError } = await signUp(email, password, "student");
      if (authError) {
        setError(authError.message);
      } else {
        setIsSignUp(false);
        alert("Conta criada! Verifique seu email para confirmar.");
      }
    } else {
      const { error: authError, role: userRole } = await signIn(email, password);
      if (authError) {
        setError(authError.message);
      } else {
        navigate(userRole === "admin" || userRole === "professor" ? "/admin" : "/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-surface-0">
      {/* Left — Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-surface-1 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-spark rounded-3xl rotate-12" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-neon rounded-2xl -rotate-6" />
          <div className="absolute bottom-32 left-40 w-28 h-28 bg-volt rounded-3xl rotate-45" />
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-plasma rounded-2xl -rotate-12" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-sky rounded-xl rotate-6" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-12"
        >
          <div className="text-8xl mb-8 animate-float">🐱</div>
          <h1 className="font-syne font-extrabold text-4xl text-text-high mb-4 tracking-tight">
            CRIE SEU<br />PRIMEIRO MUNDO.
          </h1>
          <p className="text-text-mid text-base max-w-xs mx-auto">
            Aprenda programação de forma divertida com Scratch. Blocos, lógica e criatividade.
          </p>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <span className="text-neon text-xs font-bold uppercase tracking-[0.12em]">
              DEVSTART
            </span>
            <h2 className="font-syne font-extrabold text-3xl text-text-high mt-2">
              {isSignUp ? "CRIAR CONTA" : "BEM-VINDO DE VOLTA"}
            </h2>
            <p className="text-text-mid text-sm mt-1">
              {isSignUp
                ? "Preencha os dados para começar sua jornada."
                : "Entre com sua conta para continuar."}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-spark/10 text-spark text-sm p-3 rounded-2xl mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                EMAIL
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-low" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-surface-2 border-2 border-border rounded-2xl py-3 pl-11 pr-4 text-text-high text-sm font-medium placeholder:text-text-low focus:border-spark focus:outline-none transition-colors"
                  placeholder="aluno@escola.com"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                SENHA
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-low" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-surface-2 border-2 border-border rounded-2xl py-3 pl-11 pr-4 text-text-high text-sm font-medium placeholder:text-text-low focus:border-spark focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full mt-2"
            >
              {loading ? "CARREGANDO..." : isSignUp ? "CRIAR CONTA" : "ENTRAR"}
            </Button>
          </form>

          <p className="text-text-mid text-sm text-center mt-6">
            {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-spark font-bold hover:underline"
            >
              {isSignUp ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
