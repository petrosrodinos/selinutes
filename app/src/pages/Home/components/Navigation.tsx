import { useState, useCallback } from "react";
import { Settings, LogOut, BookOpen, Shield, FileText } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { environments } from "../../../config/environments";
import { SettingsModal } from "./SettingsModal";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";

export const Navigation = () => {
  const navigate = useNavigate();
  const username = useAuthStore((state) => state.username);
  const userId = useAuthStore((state) => state.userId);
  const email = useAuthStore((state) => state.user?.email ?? null);
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.user?.role);
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(role ?? "");
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <>
      <nav className="bg-stone-800/60 backdrop-blur-sm border-b border-stone-700/50 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent transition-opacity hover:opacity-90 sm:text-2xl">
              {environments.APP_NAME}
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isAdmin ? (
                <>
                  <Link to="/admin" className="rounded-lg border border-stone-600/50 bg-stone-700/60 p-2 transition-all duration-200 hover:bg-stone-600/60 sm:p-2.5" aria-label="Admin dashboard">
                    <Shield className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
                  </Link>
                  <Link to="/game-rules" className="rounded-lg border border-stone-600/50 bg-stone-700/60 p-2 transition-all duration-200 hover:bg-stone-600/60 sm:p-2.5" aria-label="Game rules documentation">
                    <FileText className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
                  </Link>
                </>
              ) : null}
              <Link to="/rules" className="rounded-lg border border-stone-600/50 bg-stone-700/60 p-2 transition-all duration-200 hover:bg-stone-600/60 sm:p-2.5" aria-label="Rules">
                <BookOpen className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
              </Link>
              <button type="button" onClick={() => setShowSettings(true)} className="rounded-lg border border-stone-600/50 bg-stone-700/60 p-2 transition-all duration-200 hover:bg-stone-600/60 sm:p-2.5">
                <Settings className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
              </button>
              <button type="button" onClick={handleLogoutClick} className="rounded-lg border border-stone-600/50 bg-stone-700/60 p-2 transition-all duration-200 hover:bg-stone-600/60 sm:p-2.5" aria-label="Sign out">
                <LogOut className="h-4 w-4 text-stone-400 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        username={username}
        email={email}
        userId={userId}
      />

      <ConfirmationDialog isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={handleLogoutConfirm} title="Confirm Logout" message="Are you sure you want to sign out? Any ongoing games will be lost." confirmText="Sign Out" cancelText="Cancel" />
    </>
  );
};
