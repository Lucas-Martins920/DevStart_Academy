import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw, ArrowRight, Sparkles } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: string;
  xp: number;
}

interface QuizPlayerProps {
  lessonId: string;
  onComplete: (score: number, total: number, xp: number) => void;
}

const QuizPlayer = ({ lessonId, onComplete }: QuizPlayerProps) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("lesson_id", lessonId);
      if (data) {
        // Shuffle and take up to 5
        const shuffled = (data as QuizQuestion[]).sort(() => Math.random() - 0.5).slice(0, 5);
        setQuestions(shuffled);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [lessonId]);

  const currentQ = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQ?.correct_answer;
  const totalQuestions = questions.length;

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === currentQ.correct_answer) {
      setScore((s) => s + 1);
      setXpEarned((x) => x + currentQ.xp);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      finishQuiz();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const finishQuiz = async () => {
    const finalScore = selectedAnswer === currentQ.correct_answer ? score : score;
    const finalXp = xpEarned;
    setQuizFinished(true);

    if (user) {
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        lesson_id: lessonId,
        score: finalScore,
        total_questions: totalQuestions,
        xp_earned: finalXp,
      });
    }

    if (finalScore === totalQuestions) {
      // Perfect score - bonus XP
      onComplete(finalScore, totalQuestions, finalXp + 20);
    } else {
      onComplete(finalScore, totalQuestions, finalXp);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setXpEarned(0);
    setQuizFinished(false);
    // Re-shuffle
    setQuestions((q) => [...q].sort(() => Math.random() - 0.5));
  };

  if (loading) {
    return <div className="text-text-mid text-sm py-4 text-center">Carregando quiz...</div>;
  }

  if (questions.length === 0) return null;

  // Finished state
  if (quizFinished) {
    const perfect = score === totalQuestions;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-1 rounded-3xl border border-border p-8 text-center"
      >
        {perfect ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="font-syne font-extrabold text-2xl text-neon mb-2">PERFEITO!</h3>
              <p className="text-text-mid text-sm mb-1">Você acertou todas as {totalQuestions} perguntas!</p>
              <div className="flex items-center justify-center gap-2 text-volt font-bold text-lg mt-3">
                <Sparkles size={20} />
                +{xpEarned + 20} XP (inclui bônus!)
              </div>
            </motion.div>
            {/* Confetti particles */}
            <div className="relative h-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, y: 0, x: 0 }}
                  animate={{
                    opacity: 0,
                    y: -100 - Math.random() * 100,
                    x: (Math.random() - 0.5) * 200,
                  }}
                  transition={{ duration: 1.5, delay: 0.3 + i * 0.05 }}
                  className={`absolute left-1/2 -top-8 w-2 h-2 rounded-full ${
                    ["bg-spark", "bg-neon", "bg-volt", "bg-plasma"][i % 4]
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">📊</div>
            <h3 className="font-syne font-extrabold text-xl text-text-high mb-2">RESULTADO</h3>
            <p className="text-text-mid text-sm mb-1">
              Você acertou {score} de {totalQuestions} perguntas
            </p>
            <div className="flex items-center justify-center gap-2 text-volt font-bold mt-3 mb-4">
              <Trophy size={18} />
              +{xpEarned} XP
            </div>
            <Button variant="outline" onClick={handleRetry} className="gap-2">
              <RefreshCw size={14} /> TENTAR NOVAMENTE
            </Button>
          </>
        )}
      </motion.div>
    );
  }

  // Question view
  return (
    <div className="bg-surface-1 rounded-3xl border border-border p-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">
          QUIZ
        </span>
        <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-spark rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-text-mid tabular-nums">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Difficulty badge */}
      <div className="mb-3">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          currentQ.difficulty === "easy" ? "bg-neon/15 text-neon" :
          currentQ.difficulty === "medium" ? "bg-volt/15 text-volt" :
          "bg-spark/15 text-spark"
        }`}>
          {currentQ.difficulty === "easy" ? "Fácil" : currentQ.difficulty === "medium" ? "Médio" : "Difícil"}
          {" · "}{currentQ.xp}XP
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="font-syne font-bold text-lg text-text-high mb-5">{currentQ.question}</h3>

          <div className="space-y-2">
            {currentQ.options.map((opt, oi) => {
              let style = "border-border bg-surface-2 hover:border-text-low/30 text-text-mid";
              if (showResult) {
                if (oi === currentQ.correct_answer) {
                  style = "border-neon bg-neon/10 text-neon";
                } else if (oi === selectedAnswer && !isCorrect) {
                  style = "border-spark bg-spark/10 text-spark";
                } else {
                  style = "border-border bg-surface-2 text-text-low opacity-50";
                }
              } else if (selectedAnswer === oi) {
                style = "border-spark bg-spark/10 text-spark";
              }

              return (
                <button
                  key={oi}
                  onClick={() => handleAnswer(oi)}
                  disabled={showResult}
                  className={`w-full flex items-center gap-3 text-left p-4 rounded-2xl border-2 transition-all ${style}`}
                >
                  <span className="w-7 h-7 rounded-lg bg-surface-0 flex items-center justify-center text-xs font-bold shrink-0">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="text-sm font-medium">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-between"
            >
              <span className={`text-sm font-bold ${isCorrect ? "text-neon" : "text-spark"}`}>
                {isCorrect ? "✓ Correto!" : "✗ Incorreto"}
              </span>
              <Button size="sm" onClick={handleNext} className="gap-1">
                {currentIndex + 1 >= totalQuestions ? "VER RESULTADO" : "PRÓXIMA"}
                <ArrowRight size={14} />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizPlayer;
