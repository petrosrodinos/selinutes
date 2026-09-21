import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface LightboxImage {
    key: string
    url: string
}

interface ImageLightboxProps {
    images: LightboxImage[]
    index: number
    name: string
    onIndexChange: (index: number) => void
    onClose: () => void
}

const NAV_BUTTON_CLASS =
    'absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-stone-900/70 p-3 text-stone-100 transition-colors hover:bg-amber-500 hover:text-stone-900'

export const ImageLightbox = ({ images, index, name, onIndexChange, onClose }: ImageLightboxProps) => {
    const count = images.length
    const image = images[index]

    const goPrevious = () => {
        onIndexChange((index - 1 + count) % count)
    }

    const goNext = () => {
        onIndexChange((index + 1) % count)
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
            if (event.key === 'ArrowLeft') onIndexChange((index - 1 + count) % count)
            if (event.key === 'ArrowRight') onIndexChange((index + 1) % count)
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [index, count, onIndexChange, onClose])

    if (!image) return null

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} pictures`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Close gallery"
                className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-stone-900/70 p-2.5 text-stone-100 transition-colors hover:bg-amber-500 hover:text-stone-900"
            >
                <X className="h-6 w-6" />
            </button>

            {count > 1 ? (
                <>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation()
                            goPrevious()
                        }}
                        aria-label="Previous picture"
                        className={`${NAV_BUTTON_CLASS} left-4`}
                    >
                        <ChevronLeft className="h-7 w-7" />
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation()
                            goNext()
                        }}
                        aria-label="Next picture"
                        className={`${NAV_BUTTON_CLASS} right-4`}
                    >
                        <ChevronRight className="h-7 w-7" />
                    </button>
                </>
            ) : null}

            <img
                src={image.url}
                alt={name}
                onClick={(event) => event.stopPropagation()}
                className="max-h-[90vh] max-w-full rounded-2xl border-4 border-amber-400/70 object-contain shadow-2xl"
            />

            {count > 1 ? (
                <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-stone-900/70 px-4 py-1 text-sm font-semibold text-stone-100">
                    {index + 1} / {count}
                </p>
            ) : null}
        </div>,
        document.body,
    )
}
