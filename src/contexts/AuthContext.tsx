import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type UserRole = "student" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role: UserRole | null }>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar a role de forma assíncrona
  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
      
      if (error) throw error;
      
      const userRole = (data?.role as UserRole) ?? "student";
      setRole(userRole);
      return userRole;
    } catch (error) {
      console.error("Erro ao buscar role:", error);
      setRole("student");
      return "student";
    }
  };

  useEffect(() => {
    // Função para inicializar a sessão no refresh (F5)
    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchRole(session.user.id);
      }
      
      setLoading(false); // Só libera o app após carregar a role
    };

    initializeAuth();

    // Escuta mudanças de estado (login/logout/token renovado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchRole(currentSession.user.id);
        } else {
          setRole(null);
        }
        
        // Se for um evento de logout ou login, garantimos que o loading pare
        if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true); // Inicia loading no login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      return { error: error as Error | null, role: null };
    }
    
    if (data.user) {
      const userRole = await fetchRole(data.user.id);
      setLoading(false);
      return { error: null, role: userRole };
    }
    
    setLoading(false);
    return { error: null, role: null };
  };

  const signUp = async (email: string, password: string, selectedRole: UserRole = "student") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    
    if (!error && data.user) {
      await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: selectedRole,
      });
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setRole(null);
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};