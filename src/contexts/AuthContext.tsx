import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigError } from "@/lib/supabase";

type AppRole = "admin" | "professor" | "student" | null;

type AuthResult = {
  error: AuthError | Error | null;
  role?: AppRole;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: AppRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, role?: Exclude<AppRole, null>) => Promise<AuthResult>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ROLE: Exclude<AppRole, null> = "student";
const ROLE_PRIORITY: Exclude<AppRole, null>[] = ["admin", "professor", "student"];

const normalizeRole = (value: unknown): AppRole =>
  value === "admin" || value === "professor" || value === "student" ? value : null;

const resolveHighestRole = (values: unknown[]): AppRole => {
  const normalized = values
    .map(normalizeRole)
    .filter((value): value is Exclude<AppRole, null> => value !== null);

  for (const role of ROLE_PRIORITY) {
    if (normalized.includes(role)) {
      return role;
    }
  }

  return DEFAULT_ROLE;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);
  const authRequestRef = useRef(0);

  const fetchRole = useCallback(async (userId: string): Promise<AppRole> => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .returns<Array<{ role: string }>>();

    if (error) {
      console.error("Erro ao buscar role do usuario:", error);
      return DEFAULT_ROLE;
    }

    return resolveHighestRole((data ?? []).map((item) => item.role));
  }, []);

  const applySession = useCallback(
    async (nextSession: Session | null) => {
      const currentRequestId = ++authRequestRef.current;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const nextRole = await fetchRole(nextSession.user.id);

      if (authRequestRef.current !== currentRequestId) {
        return;
      }

      setRole(nextRole);
      setLoading(false);
    },
    [fetchRole],
  );

  useEffect(() => {
    let isActive = true;

    if (supabaseConfigError) {
      console.error(supabaseConfigError.message);
      setLoading(false);
      return;
    }

    const bootstrapAuth = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao restaurar sessao:", error);
        }

        if (isActive) {
          await applySession(currentSession);
        }
      } catch (error) {
        console.error("Falha inesperada ao iniciar autenticacao:", error);
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return;
      }

      void applySession(nextSession);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (supabaseConfigError) {
        return { error: supabaseConfigError };
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      const nextRole = data.user ? await fetchRole(data.user.id) : null;

      return {
        error: null,
        role: nextRole,
      };
    },
    [fetchRole],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      nextRole: Exclude<AppRole, null> = DEFAULT_ROLE,
    ): Promise<AuthResult> => {
      if (supabaseConfigError) {
        return { error: supabaseConfigError };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: normalizeRole(nextRole) ?? DEFAULT_ROLE,
        } as never);

        if (roleError) {
          console.error("Erro ao salvar role do usuario:", roleError);
          return { error: roleError };
        }
      }

      return {
        error: null,
        role: normalizeRole(nextRole),
      };
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      authRequestRef.current += 1;
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
    }

    return { error };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      role,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [loading, role, session, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
