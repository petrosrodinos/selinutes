import { Modal } from "../Modal";
import { POINTS_LABEL } from "../../constants/game";
import type { PlayerLevelMeta } from "../../constants/figureLevels";

interface PlayerLevelPreviewModalProps {
  levelMeta: PlayerLevelMeta | null;
  onClose: () => void;
  pointsRequired?: number;
}

export const PlayerLevelPreviewModal = ({
  levelMeta,
  onClose,
  pointsRequired,
}: PlayerLevelPreviewModalProps) => {
  if (!levelMeta) return null;

  const label = `${levelMeta.tierLabel} · ${levelMeta.figureTitle}`;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Level ${levelMeta.playerLevel} · ${levelMeta.tierLabel}`}
      size="xl"
      elevation="overlay"
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-stone-700/60 bg-stone-950/80 shadow-2xl">
          {levelMeta.imageUrl ? (
            <img
              src={levelMeta.imageUrl}
              alt={label}
              className="mx-auto w-full max-h-[65vh] object-contain"
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-stone-400">
              Image unavailable
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-semibold text-stone-100">{levelMeta.figureTitle}</p>
          {pointsRequired !== undefined ? (
            <p className="text-sm text-stone-400">
              {pointsRequired.toLocaleString()} {POINTS_LABEL} required
            </p>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
