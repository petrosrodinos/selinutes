import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const navbarClassName =
  "rounded-lg border border-stone-600/50 bg-stone-700/60 p-2 transition-all duration-200 hover:bg-stone-600/60 sm:p-2.5";

const ghostClassName =
  "rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-800/90 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60";

const ghostCompactClassName =
  "inline-flex shrink-0 touch-manipulation select-none items-center justify-center rounded-xl p-2 text-stone-400 transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-stone-800/90 hover:text-amber-300 motion-safe:active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 h-9 min-w-9";

type RulesNavIconProps = {
  onClick?: () => void;
  variant?: "navbar" | "ghost";
  compact?: boolean;
};

export const RulesNavIcon = ({ onClick, variant = "navbar", compact = false }: RulesNavIconProps) => {
  const className = variant === "ghost" ? (compact ? ghostCompactClassName : ghostClassName) : navbarClassName;
  const iconClassName = variant === "ghost"
    ? compact
      ? "h-4 w-4"
      : "h-5 w-5"
    : "h-4 w-4 text-amber-400 sm:h-5 sm:w-5";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-label="Rules">
        <BookOpen className={iconClassName} strokeWidth={variant === "ghost" ? (compact ? 2.25 : 2) : undefined} />
      </button>
    );
  }

  return (
    <Link to="/rules" className={className} aria-label="Rules">
      <BookOpen className={iconClassName} />
    </Link>
  );
};
