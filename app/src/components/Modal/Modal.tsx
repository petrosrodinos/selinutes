import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalSize = 'md' | 'xl'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: ModalSize
}

const modalSizeClasses: Record<ModalSize, string> = {
  md: 'max-w-md',
  xl: 'max-w-4xl',
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-stone-800 rounded-xl border border-stone-700 w-full ${modalSizeClasses[size]} max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-stone-800 border-b border-stone-700 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between z-10">
          <h2 className="text-base sm:text-lg font-semibold text-amber-200">{title}</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors text-xl sm:text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-3 sm:p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
