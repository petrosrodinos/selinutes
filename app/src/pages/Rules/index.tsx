import { Navbar } from "../../components/Navbar";
import { PoweredByFooter } from "../../components/PoweredByFooter";
import { GameRulesContent } from "./components/GameRulesContent";

export const RulesPage = () => {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(180,83,9,0.08),transparent)] pointer-events-none" />

      <Navbar showBackButton />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-20">
        <GameRulesContent />
      </main>

      <PoweredByFooter />
    </div>
  );
};
