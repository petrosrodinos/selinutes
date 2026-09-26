import { useState, useCallback } from "react";
import { RulesNavIcon } from "../../../components/RulesNavIcon";
import { StoreNavMenu } from "../../../components/StoreNavMenu";
import { UserMenu } from "../../../components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { AppLogo } from "../../../components/AppLogo";
import { SettingsModal } from "./SettingsModal";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";

export const Navigation = () => {
  const navigate = useNavigate();
  const username = useAuthStore((state) => state.username);
  const userId = useAuthStore((state) => state.userId);
  const email = useAuthStore((state) => state.user?.email ?? null);
  const logout = useAuthStore((state) => state.logout);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

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
            <AppLogo size="md" className="sm:[&_span]:text-2xl" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <StoreNavMenu />
              <RulesNavIcon showLabel />
              <UserMenu onOpenSettings={handleOpenSettings} onLogout={handleLogoutClick} />
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
