import { useState } from "react";
import { MessageSquarePlus, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";

const SuggestionButton = () => {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("suggestions").insert({
      user_id: user.id,
      message: message.trim(),
      author_email: user.email ?? "",
      author_role: role ?? "student",
    } as any);
    setSending(false);
    if (!error) {
      toast({ title: "Sugestão enviada!", description: "Obrigado pelo feedback! 🎉" });
      setMessage("");
      setOpen(false);
    } else {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-plasma text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform lip-plasma"
      >
        <MessageSquarePlus size={22} />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="fixed bottom-24 right-6 z-50 w-80 bg-surface-1 border border-border rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-syne font-extrabold text-sm text-text-high uppercase tracking-wider">
                  💡 Sugestão
                </h3>
                <button onClick={() => setOpen(false)} className="text-text-low hover:text-text-high">
                  <X size={18} />
                </button>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full bg-surface-2 border-2 border-border rounded-2xl py-3 px-4 text-text-high text-sm font-medium placeholder:text-text-low focus:border-plasma focus:outline-none transition-colors resize-none"
                placeholder="O que podemos melhorar?"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-text-low">{message.length}/500</span>
                <Button variant="plasma" size="sm" onClick={handleSend} disabled={sending || !message.trim()}>
                  <Send size={14} /> Enviar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SuggestionButton;
