import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Login, Register, Home, UsersOverview } from "./pages";
import { AuthGuard } from "./components/AuthGuard";
import { AdminGuard } from "./components/AdminGuard";
import { useAuthStore } from "./store/authStore";
import { Game } from "./pages/Game";
import { LandingPage } from "./pages/Landing";
const RulesPage = lazy(() =>
  import("./pages/Rules").then((m) => ({ default: m.RulesPage }))
);

const queryClient = new QueryClient();

function App() {
  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const user_uuid = useAuthStore((state) => state.user_uuid);
    if (user_uuid) return <Navigate to="/home" replace />;
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/rules"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen bg-stone-950 text-stone-400 flex items-center justify-center text-sm">
                    Loading…
                  </div>
                }
              >
                <RulesPage />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />
          <Route
            path="/home"
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            }
          />
          <Route
            path="/game"
            element={
              <AuthGuard>
                <Game />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminGuard>
                <UsersOverview />
              </AdminGuard>
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}

export default App;
