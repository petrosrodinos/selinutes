import type { PlayerLevelMeta } from "../../constants/figureLevels";

type PlayerLevelBadgeSize = "sm" | "md";

interface PlayerLevelBadgeProps {
  levelMeta: PlayerLevelMeta;
  size?: PlayerLevelBadgeSize;
  showLevelNumber?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses: Record<PlayerLevelBadgeSize, string> = {
  sm: "w-10 h-10 rounded-xl ring-1",
  md: "w-16 h-16 rounded-2xl ring-2",
};

const levelNumberClasses: Record<PlayerLevelBadgeSize, string> = {
  sm: "text-[10px] px-1 py-0.5 bottom-0.5 right-0.5",
  md: "text-xs px-1.5 py-0.5 bottom-1 right-1",
};

const interactiveClasses =
  "cursor-pointer transition-all duration-200 hover:scale-105 hover:ring-amber-300 hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-110 active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

export const PlayerLevelBadge = ({
  levelMeta,
  size = "md",
  showLevelNumber = true,
  className = "",
  onClick,
}: PlayerLevelBadgeProps) => {
  const label = `${levelMeta.tierLabel} ${levelMeta.figureTitle}`;
  const sharedClasses = `group relative overflow-hidden bg-stone-900 ring-amber-400/50 shadow-lg flex-shrink-0 ${sizeClasses[size]} ${onClick ? interactiveClasses : ""} ${className}`;

  const content = (
    <>
      {levelMeta.imageUrl ? (
        <img
          src={levelMeta.imageUrl}
          alt={label}
          className={`h-full w-full object-cover ${onClick ? "transition-transform duration-200 group-hover:scale-110" : ""}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-stone-800 font-bold text-stone-300">
          {levelMeta.playerLevel}
        </div>
      )}
      {showLevelNumber && levelMeta.imageUrl ? (
        <span
          className={`absolute rounded-md bg-stone-950/75 font-bold text-white ${levelNumberClasses[size]}`}
        >
          {levelMeta.playerLevel}
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={sharedClasses} aria-label={`Expand level ${levelMeta.playerLevel}: ${label}`}>
        {content}
      </button>
    );
  }

  return <div className={sharedClasses}>{content}</div>;
};
