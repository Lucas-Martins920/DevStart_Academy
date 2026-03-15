import { useState } from "react";
import { Plus, Trash2, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: "easy" | "medium" | "hard";
  xp: number;
}

interface QuizEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const DIFFICULTY_LABELS = {
  easy: { label: "Fácil", xp: 5 },
  medium: { label: "Médio", xp: 10 },
  hard: { label: "Difícil", xp: 20 },
};

const QuizEditor = ({ questions, onChange }: QuizEditorProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addQuestion = () => {
    onChange([
      ...questions,
      { question: "", options: ["", "", "", ""], correct_answer: 0, difficulty: "medium", xp: 10 },
    ]);
    setExpandedIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: unknown) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "difficulty") {
      updated[index].xp = DIFFICULTY_LABELS[value as "easy" | "medium" | "hard"].xp;
    }
    onChange(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    const opts = [...updated[qIndex].options];
    opts[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: opts };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">
          PERGUNTAS DO QUIZ ({questions.length})
        </label>
        <button onClick={addQuestion} className="text-xs font-bold text-spark hover:underline flex items-center gap-1">
          <Plus size={12} /> Adicionar pergunta
        </button>
      </div>

      {questions.length === 0 && (
        <p className="text-text-low text-xs py-4 text-center">Nenhuma pergunta adicionada. O quiz será opcional.</p>
      )}

      {questions.map((q, qi) => (
        <div
          key={qi}
          className="bg-surface-2 border-2 border-border rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => setExpandedIndex(expandedIndex === qi ? null : qi)}
            className="w-full flex items-center justify-between p-3 text-left"
          >
            <span className="text-sm font-medium text-text-high truncate flex-1">
              {q.question || `Pergunta ${qi + 1}`}
            </span>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                q.difficulty === "easy" ? "bg-neon/15 text-neon" :
                q.difficulty === "medium" ? "bg-volt/15 text-volt" :
                "bg-spark/15 text-spark"
              }`}>
                {DIFFICULTY_LABELS[q.difficulty].label}
              </span>
              <span className="text-[10px] font-bold text-volt">{q.xp}XP</span>
              <button onClick={(e) => { e.stopPropagation(); removeQuestion(qi); }} className="text-text-low hover:text-spark">
                <Trash2 size={14} />
              </button>
            </div>
          </button>

          {expandedIndex === qi && (
            <div className="p-3 pt-0 space-y-3 border-t border-border">
              {/* Question text */}
              <input
                value={q.question}
                onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                className="w-full bg-surface-0 border-2 border-border rounded-xl py-2 px-3 text-text-high text-sm focus:border-spark focus:outline-none transition-colors"
                placeholder="Enunciado da pergunta"
              />

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuestion(qi, "correct_answer", oi)}
                      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        q.correct_answer === oi
                          ? "border-neon bg-neon/20 text-neon"
                          : "border-border text-transparent hover:border-text-low"
                      }`}
                    >
                      <CheckCircle size={14} />
                    </button>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      className="flex-1 bg-surface-0 border-2 border-border rounded-xl py-2 px-3 text-text-high text-sm focus:border-spark focus:outline-none transition-colors"
                      placeholder={`Opção ${oi + 1}`}
                    />
                  </div>
                ))}
              </div>

              {/* Difficulty */}
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => updateQuestion(qi, "difficulty", d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      q.difficulty === d
                        ? d === "easy" ? "bg-neon/20 text-neon border-2 border-neon/30"
                        : d === "medium" ? "bg-volt/20 text-volt border-2 border-volt/30"
                        : "bg-spark/20 text-spark border-2 border-spark/30"
                        : "bg-surface-0 text-text-mid border-2 border-border"
                    }`}
                  >
                    {DIFFICULTY_LABELS[d].label} ({DIFFICULTY_LABELS[d].xp}XP)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuizEditor;
