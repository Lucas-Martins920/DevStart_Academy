import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import QuizPlayer from "@/components/QuizPlayer";
import { ArrowLeft, CheckSquare, Square, FileText, Image, Video } from "lucide-react";

interface QuizQuestion {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: "easy" | "medium" | "hard";
  xp: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  emoji: string;
  media_type: "video" | "pdf" | "image";
  media_url: string;
  steps: string[];
}

interface StepProgress {
  step_index: number;
  completed: boolean;
}

const LessonPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [
        { data, error: lessonError },
        { count, error: quizError },
      ] = await Promise.all([
        supabase.from("lessons").select("*").eq("id", id).single(),
        supabase.from("quiz_questions").select("*", { count: "exact", head: true }).eq("lesson_id", id),
      ]);

      if (lessonError || quizError) {
        console.error("Erro ao carregar aula:", { lessonError, quizError });
        setError("Nao foi possivel carregar esta aula agora.");
        setLoading(false);
        return;
      }

      if (data) {
        setLesson({ ...data, steps: (data.steps ?? []) as string[], media_type: data.media_type as any });
        const steps = (data.steps ?? []) as string[];
        setStepProgress(steps.map((_, i) => ({ step_index: i, completed: false })));
      }
      setHasQuiz((count ?? 0) > 0);
      setLoading(false);
    };

    void fetchLesson();
  }, [id]);

  const toggleStep = (index: number) => {
    setStepProgress((prev) =>
      prev.map((s) => (s.step_index === index ? { ...s, completed: !s.completed } : s))
    );
  };

  const allStepsCompleted = stepProgress.length === 0 || stepProgress.every((s) => s.completed);
  const canComplete = allStepsCompleted && (!hasQuiz || quizCompleted);

  const handleComplete = async () => {
    if (!user || !id) return;
    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: id,
      completed: true,
    });
    navigate("/");
  };

  const handleQuizComplete = (score: number, total: number, xp: number) => {
    if (score === total) {
      setQuizCompleted(true);
    }
  };

  const MediaIcon = lesson?.media_type === "video" ? Video : lesson?.media_type === "pdf" ? FileText : Image;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center text-text-mid">
        Carregando aula...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center">
        <p className="text-text-mid mb-4">{error ?? "Aula nao encontrada."}</p>
        <Button variant="outline" onClick={() => navigate("/")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{lesson.emoji}</span>
            <h1 className="font-syne font-extrabold text-lg text-text-high tracking-tight">
              {lesson.title}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-[7]">
          <div className="aspect-video bg-surface-1 rounded-3xl border border-border overflow-hidden flex items-center justify-center relative">
            {lesson.media_url ? (
              lesson.media_type === "video" ? (
                <video src={lesson.media_url} controls className="w-full h-full object-contain" />
              ) : lesson.media_type === "pdf" ? (
                <iframe src={lesson.media_url} className="w-full h-full" title={lesson.title} />
              ) : (
                <img src={lesson.media_url} alt={lesson.title} className="w-full h-full object-contain" />
              )
            ) : (
              <div className="flex flex-col items-center gap-3 text-text-low">
                <MediaIcon size={48} />
                <span className="text-sm">Mídia não disponível</span>
              </div>
            )}
          </div>
          <div className="mt-6">
            <p className="text-text-mid text-sm leading-relaxed">{lesson.description}</p>
          </div>

          {hasQuiz && allStepsCompleted && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              {!showQuiz ? (
                <Button variant="accent" size="lg" className="w-full" onClick={() => setShowQuiz(true)}>
                  🧠 INICIAR QUIZ
                </Button>
              ) : (
                <QuizPlayer lessonId={id!} onComplete={handleQuizComplete} />
              )}
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-[3] flex flex-col">
          <div className="bg-surface-1 rounded-3xl border border-border p-6 flex-1">
            <h2 className="font-syne font-extrabold text-sm text-text-high mb-4 uppercase tracking-wider">ETAPAS DA AULA</h2>
            {lesson.steps.length === 0 ? (
              <p className="text-text-low text-xs">Nenhuma etapa definida.</p>
            ) : (
              <div className="space-y-3">
                {lesson.steps.map((step, index) => {
                  const isChecked = stepProgress[index]?.completed ?? false;
                  return (
                    <button key={index} onClick={() => toggleStep(index)}
                      className={`w-full flex items-start gap-3 text-left p-3 rounded-2xl border-2 transition-all ${isChecked ? "border-neon/30 bg-neon/5" : "border-border bg-surface-2 hover:border-text-low/30"}`}>
                      {isChecked ? <CheckSquare size={18} className="text-neon mt-0.5 shrink-0" /> : <Square size={18} className="text-text-low mt-0.5 shrink-0" />}
                      <span className={`text-sm font-medium ${isChecked ? "text-neon" : "text-text-mid"}`}>{step}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button variant="success" size="lg" className="w-full" disabled={!canComplete} onClick={handleComplete}>
              ✓ CONCLUIR DESAFIO
            </Button>
            {!canComplete && (
              <p className="text-text-low text-xs text-center mt-2">
                {!allStepsCompleted ? "Complete todas as etapas para continuar" : "Complete o quiz para concluir"}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LessonPlayer;
