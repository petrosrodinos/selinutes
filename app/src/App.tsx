import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Login, Home } from "./pages";
import { AuthGuard } from "./components/AuthGuard";
import { useAuthStore } from "./store/authStore";
import { Game } from "./pages/Game";
import { LandingPage } from "./pages/Landing";
import { RulesPage } from "./pages/Rules";

const queryClient = new QueryClient();

function App() {
  const RootRoute = () => {
    const userId = useAuthStore((state) => state.userId);
    if (userId) return <Navigate to="/home" replace />;
    return <Login />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/login" element={<RootRoute />} />
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
