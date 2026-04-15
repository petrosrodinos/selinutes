import { Modal } from "../../../../components/Modal";

interface LeaveGameConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isOnline: boolean;
}

export const LeaveGameConfirmModal = ({ isOpen, onClose, onConfirm, isOnline }: LeaveGameConfirmModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Leave Game">
    <div className="space-y-4">
      <p className="text-stone-300">
        {isOnline
          ? "Are you sure you want to leave this game? You will forfeit the match."
          : "Are you sure you want to leave? Your current game progress will be lost."}
      </p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-stone-700 px-4 py-2 text-stone-200 transition-colors hover:bg-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-rose-600 px-4 py-2 text-white transition-colors hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80"
        >
          Leave Game
        </button>
      </div>
    </div>
  </Modal>
);
