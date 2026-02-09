import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Login, Register, Home } from "./pages";
import { AuthGuard } from "./components/AuthGuard";
import { useAuthStore } from "./store/authStore";
import { Game } from "./pages/Game";
import { LandingPage } from "./pages/Landing";
import { RulesPage } from "./pages/Rules";

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
          <Route path="/rules" element={<RulesPage />} />
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
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}

export default App;
