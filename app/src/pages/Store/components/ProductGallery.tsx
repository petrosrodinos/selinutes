import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { ImageLightbox } from './ImageLightbox'
import type { ProductGalleryImage } from '../../../features/store/interfaces/store.interface'

interface ProductGalleryProps {
    name: string
    coverUrl: string | null
    gallery: ProductGalleryImage[]
}

interface GalleryImage {
    key: string
    url: string
}

interface GalleryThumbnailProps {
    image: GalleryImage
    name: string
    index: number
    isSelected: boolean
    onSelect: (key: string) => void
}

const GalleryThumbnail = ({ image, name, index, isSelected, onSelect }: GalleryThumbnailProps) => {
    const handleClick = () => {
        onSelect(image.key)
    }

    const tiltClass = index % 2 === 0 ? '-rotate-3' : 'rotate-3'
    const stateClass = isSelected
        ? 'scale-110 rotate-0 border-amber-400'
        : `${tiltClass} border-stone-600 opacity-80 hover:rotate-0 hover:scale-105 hover:border-amber-300 hover:opacity-100`

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={`Show picture ${index + 1} of ${name}`}
            aria-pressed={isSelected}
            className={`block cursor-pointer overflow-hidden rounded-xl border-2 bg-stone-900 transition-all duration-200 ${stateClass}`}
        >
            <img src={image.url} alt="" loading="lazy" className="h-16 w-24 object-cover" />
        </button>
    )
}

export const ProductGallery = ({ name, coverUrl, gallery }: ProductGalleryProps) => {
    const images: GalleryImage[] = [
        ...(coverUrl ? [{ key: 'cover', url: coverUrl }] : []),
        ...gallery.map((image) => ({ key: image.uuid, url: image.url })),
    ]
    const [selectedKey, setSelectedKey] = useState<string | null>(null)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const selected = images.find((image) => image.key === selectedKey) ?? images[0]

    if (!selected) {
        return (
            <div className="flex aspect-[4/3] w-full -rotate-1 flex-col items-center justify-center gap-3 rounded-3xl border-4 border-dashed border-amber-500/30 bg-stone-800/60 text-amber-300/70">
                <Sparkles className="h-12 w-12" />
                <p className="text-sm font-medium">No pictures yet</p>
            </div>
        )
    }

    const selectedIndex = images.indexOf(selected)

    const handleOpenLightbox = () => {
        setIsLightboxOpen(true)
    }

    const handleCloseLightbox = () => {
        setIsLightboxOpen(false)
    }

    const handleLightboxIndexChange = (index: number) => {
        setSelectedKey(images[index].key)
    }

    return (
        <div className="space-y-10">
            <button
                type="button"
                onClick={handleOpenLightbox}
                aria-label={`View ${name} full size`}
                className="block w-full -rotate-1 cursor-zoom-in overflow-hidden rounded-3xl border-4 border-amber-400/70 bg-stone-900 shadow-[0_12px_0_0_rgba(251,191,36,0.15),0_24px_48px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:rotate-0"
            >
                <img src={selected.url} alt={name} className="aspect-[4/3] w-full object-cover" />
            </button>

            {isLightboxOpen ? (
                <ImageLightbox
                    images={images}
                    index={selectedIndex}
                    name={name}
                    onIndexChange={handleLightboxIndexChange}
                    onClose={handleCloseLightbox}
                />
            ) : null}

            {images.length > 1 ? (
                <ul className="flex flex-wrap gap-3 px-1">
                    {images.map((image, index) => (
                        <li key={image.key}>
                            <GalleryThumbnail
                                image={image}
                                name={name}
                                index={index}
                                isSelected={image.key === selected.key}
                                onSelect={setSelectedKey}
                            />
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    )
}
