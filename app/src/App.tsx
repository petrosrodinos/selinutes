import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Login, Register, Home, AdminPage } from "./pages";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import { ResetPassword } from "./pages/Auth/ResetPassword";
import { AuthGuard } from "./components/AuthGuard";
import { AdminGuard } from "./components/AdminGuard";
import { StoreAdminGuard } from "./components/StoreAdminGuard";
import { StorePage } from "./pages/Store/StorePage";
import { ProductPage } from "./pages/Store/ProductPage";
import { CheckoutPage } from "./pages/Checkout/CheckoutPage";
import { MyOrdersPage } from "./pages/Orders/MyOrdersPage";
import { StoreOverviewPage } from "./pages/StoreAdmin/StoreOverviewPage";
import { StoreProductsPage } from "./pages/StoreAdmin/StoreProductsPage";
import { STORE_ROUTES } from "./config/store/store.config";
import { useAuthStore } from "./store/authStore";
import { Game } from "./pages/Game";
import { LandingPage } from "./pages/Landing";
import { RulesPageSkeleton } from "./pages/Rules/RulesPageSkeleton";
import { GameRulesPageSkeleton } from "./pages/GameRules/GameRulesPageSkeleton";
const RulesPage = lazy(() =>
  import("./pages/Rules").then((m) => ({ default: m.RulesPage }))
);
const GameRulesPage = lazy(() =>
  import("./pages/GameRules").then((m) => ({ default: m.GameRulesPage }))
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
                fallback={<RulesPageSkeleton />}
              >
                <RulesPage />
              </Suspense>
            }
          />
          <Route
            path="/game-rules"
            element={
              <Suspense fallback={<GameRulesPageSkeleton />}>
                <GameRulesPage />
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
            path="/forgot-password"
            element={
              <AuthRoute>
                <ForgotPassword />
              </AuthRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthRoute>
                <ResetPassword />
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
            path="/admin"
            element={
              <AdminGuard>
                <AdminPage />
              </AdminGuard>
            }
          />
          <Route
            path={STORE_ROUTES.STORE}
            element={
              <AuthGuard>
                <StorePage />
              </AuthGuard>
            }
          />
          <Route
            path={STORE_ROUTES.PRODUCT(":productUuid")}
            element={
              <AuthGuard>
                <ProductPage />
              </AuthGuard>
            }
          />
          <Route
            path={STORE_ROUTES.CHECKOUT(":productUuid")}
            element={
              <AuthGuard>
                <CheckoutPage />
              </AuthGuard>
            }
          />
          <Route
            path={STORE_ROUTES.ORDERS}
            element={
              <AuthGuard>
                <MyOrdersPage />
              </AuthGuard>
            }
          />
          <Route
            path={STORE_ROUTES.ADMIN_ORDERS}
            element={
              <StoreAdminGuard>
                <StoreOverviewPage />
              </StoreAdminGuard>
            }
          />
          <Route
            path={STORE_ROUTES.ADMIN_PRODUCTS}
            element={
              <StoreAdminGuard>
                <StoreProductsPage />
              </StoreAdminGuard>
            }
          />
          <Route path="/admin/users" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}

export default App;
