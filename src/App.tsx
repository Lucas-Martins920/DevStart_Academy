import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LessonPlayer from "./pages/LessonPlayer";
import Admin from "./pages/Admin";
import AdminStudents from "./pages/AdminStudents";
import AdminStats from "./pages/AdminStats";
import AdminSuggestions from "./pages/AdminSuggestions";
import CreateTeacher from "./pages/CreateTeacher";
import Missions from "./pages/Missions";
import Ranking from "./pages/Ranking";
import Achievements from "./pages/Achievements";
import StudentProfile from "./pages/StudentProfile";
import StudentLayout from "./components/StudentLayout";
import AdminLayout from "./components/AdminLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string | string[] }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-text-mid font-medium">Carregando...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(role ?? "")) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect = () => {
  const { role, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-text-mid font-medium">Carregando...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role === "admin" || role === "professor") return <Navigate to="/admin" replace />;
  return <StudentLayout><Dashboard /></StudentLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Student routes */}
            <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
            <Route path="/missions" element={<ProtectedRoute><StudentLayout><Missions /></StudentLayout></ProtectedRoute>} />
            <Route path="/ranking" element={<ProtectedRoute><StudentLayout><Ranking /></StudentLayout></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><StudentLayout><Achievements /></StudentLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><StudentLayout><StudentProfile /></StudentLayout></ProtectedRoute>} />
            <Route path="/lesson/:id" element={<ProtectedRoute><LessonPlayer /></ProtectedRoute>} />

            {/* Admin/Professor routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={["admin", "professor"]}>
                <AdminLayout><Admin /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute requiredRole={["admin", "professor"]}>
                <AdminLayout><AdminStudents /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/stats" element={
              <ProtectedRoute requiredRole={["admin", "professor"]}>
                <AdminLayout><AdminStats /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/suggestions" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><AdminSuggestions /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/create-teacher" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout><CreateTeacher /></AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
