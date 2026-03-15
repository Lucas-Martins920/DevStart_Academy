import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Upload,
  GripVertical,
  Video,
  FileText,
  Image,
  X,
  Save,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  order_index: number;
  color: string;
  media_type: "video" | "pdf" | "image";
  media_url: string;
  steps: string[];
}

const COLORS = ["spark", "neon", "volt", "plasma", "sky"];
const EMOJIS = ["🐱", "🎮", "🚀", "🎨", "🧩", "⭐", "🔮", "🎯", "💡", "🌟"];

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🐱");
  const [xp, setXp] = useState(100);
  const [color, setColor] = useState("spark");
  const [mediaType, setMediaType] = useState<"video" | "pdf" | "image">("video");
  const [mediaUrl, setMediaUrl] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [uploading, setUploading] = useState(false);

  const fetchLessons = useCallback(async () => {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .order("order_index", { ascending: true });
    if (data) setLessons(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEmoji("🐱");
    setXp(100);
    setColor("spark");
    setMediaType("video");
    setMediaUrl("");
    setSteps([""]);
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (lesson: Lesson) => {
    setEditing(lesson);
    setTitle(lesson.title);
    setDescription(lesson.description);
    setEmoji(lesson.emoji);
    setXp(lesson.xp);
    setColor(lesson.color);
    setMediaType(lesson.media_type);
    setMediaUrl(lesson.media_url || "");
    setSteps(lesson.steps?.length ? lesson.steps : [""]);
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `lessons/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("lesson-media").upload(path, file);

    if (!error) {
      const { data } = supabase.storage.from("lesson-media").getPublicUrl(path);
      setMediaUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    const filteredSteps = steps.filter((s) => s.trim());
    const lessonData = {
      title,
      description,
      emoji,
      xp,
      color,
      media_type: mediaType,
      media_url: mediaUrl,
      steps: filteredSteps,
      order_index: editing ? editing.order_index : lessons.length,
    };

    if (editing) {
      await supabase.from("lessons").update(lessonData).eq("id", editing.id);
    } else {
      await supabase.from("lessons").insert(lessonData);
    }

    resetForm();
    fetchLessons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
    await supabase.from("lessons").delete().eq("id", id);
    fetchLessons();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const MediaIcon = mediaType === "video" ? Video : mediaType === "pdf" ? FileText : Image;

  return (
    <div className="min-h-screen bg-surface-0 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-1 border-r border-border p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">🐱</span>
          <span className="font-syne font-extrabold text-lg text-text-high tracking-tight">
            DEVSTART
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="bg-surface-2 text-text-high rounded-2xl px-4 py-3 text-sm font-bold flex items-center gap-3">
            <FileText size={16} /> Aulas
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-text-mid text-sm font-medium hover:text-text-high transition-colors w-full"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-volt text-xs font-bold uppercase tracking-[0.12em]">
                PAINEL ADMIN
              </span>
              <h1 className="font-syne font-extrabold text-3xl text-text-high mt-1 tracking-tight">
                GERENCIAR AULAS
              </h1>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} /> NOVA AULA
            </Button>
          </div>

          {/* Form modal */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-1 rounded-3xl border border-border p-8 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-syne font-extrabold text-xl text-text-high">
                  {editing ? "EDITAR AULA" : "NOVA AULA"}
                </h2>
                <button onClick={resetForm} className="text-text-low hover:text-text-high">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                    TÍTULO
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-2 border-2 border-border rounded-2xl py-3 px-4 text-text-high text-sm font-medium focus:border-spark focus:outline-none transition-colors"
                    placeholder="Ex: Primeiros passos com Scratch"
                  />
                </div>

                {/* XP */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                    XP
                  </label>
                  <input
                    type="number"
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    className="w-full bg-surface-2 border-2 border-border rounded-2xl py-3 px-4 text-text-high text-sm font-medium focus:border-spark focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                    DESCRIÇÃO
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-2 border-2 border-border rounded-2xl py-3 px-4 text-text-high text-sm font-medium focus:border-spark focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Emoji */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                    EMOJI
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                          emoji === e
                            ? "bg-spark/20 ring-2 ring-spark"
                            : "bg-surface-2 hover:bg-surface-3"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                    COR
                  </label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-xl transition-all ${
                          color === c ? "ring-2 ring-text-high scale-110" : ""
                        } bg-${c}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Media type */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                    TIPO DE MÍDIA
                  </label>
                  <div className="flex gap-2">
                    {(["video", "pdf", "image"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setMediaType(t)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                          mediaType === t
                            ? "bg-spark/20 text-spark border-2 border-spark/30"
                            : "bg-surface-2 text-text-mid border-2 border-border"
                        }`}
                      >
                        {t === "video" && <Video size={14} />}
                        {t === "pdf" && <FileText size={14} />}
                        {t === "image" && <Image size={14} />}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                    UPLOAD DE MÍDIA
                  </label>
                  <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-spark/40 rounded-2xl cursor-pointer hover:bg-spark/5 transition-colors">
                    <Upload size={20} className="text-spark" />
                    <span className="text-sm text-text-mid font-medium">
                      {uploading ? "Enviando..." : "Arraste ou clique"}
                    </span>
                    <input
                      type="file"
                      accept="video/*,application/pdf,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {mediaUrl && (
                    <p className="text-xs text-neon mt-2 truncate">✓ {mediaUrl.split("/").pop()}</p>
                  )}
                </div>

                {/* Steps */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-low mb-2 block">
                    ETAPAS DA AULA
                  </label>
                  <div className="space-y-2">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <GripVertical size={14} className="text-text-low shrink-0" />
                        <input
                          value={step}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            newSteps[index] = e.target.value;
                            setSteps(newSteps);
                          }}
                          className="flex-1 bg-surface-2 border-2 border-border rounded-xl py-2 px-3 text-text-high text-sm focus:border-spark focus:outline-none transition-colors"
                          placeholder={`Etapa ${index + 1}`}
                        />
                        {steps.length > 1 && (
                          <button
                            onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                            className="text-text-low hover:text-spark"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setSteps([...steps, ""])}
                      className="text-xs font-bold text-spark hover:underline"
                    >
                      + Adicionar etapa
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSave}>
                  <Save size={16} /> {editing ? "SALVAR" : "CRIAR AULA"}
                </Button>
                <Button variant="secondary" onClick={resetForm}>
                  CANCELAR
                </Button>
              </div>
            </motion.div>
          )}

          {/* Lessons table */}
          {loading ? (
            <p className="text-text-mid">Carregando...</p>
          ) : lessons.length === 0 ? (
            <div className="text-center py-20 bg-surface-1 rounded-3xl border border-border">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-text-mid font-medium">Nenhuma aula cadastrada</p>
              <p className="text-text-low text-sm mt-1">
                Clique em "Nova Aula" para começar
              </p>
            </div>
          ) : (
            <div className="bg-surface-1 rounded-3xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">
                      #
                    </th>
                    <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">
                      AULA
                    </th>
                    <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">
                      XP
                    </th>
                    <th className="text-left p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">
                      MÍDIA
                    </th>
                    <th className="text-right p-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-low">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr key={lesson.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                      <td className="p-4 text-sm text-text-low font-mono tabular-nums">
                        {lesson.order_index + 1}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{lesson.emoji}</span>
                          <div>
                            <p className="font-syne font-bold text-sm text-text-high">{lesson.title}</p>
                            <p className="text-xs text-text-low truncate max-w-xs">
                              {lesson.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-volt font-bold tabular-nums">
                        {lesson.xp}
                      </td>
                      <td className="p-4 text-xs text-text-mid uppercase">
                        {lesson.media_type}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(lesson)}
                            className="p-2 rounded-xl bg-surface-2 text-text-mid hover:text-text-high hover:bg-surface-3 transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(lesson.id)}
                            className="p-2 rounded-xl bg-surface-2 text-text-mid hover:text-spark hover:bg-spark/10 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
