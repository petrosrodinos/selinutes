import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { X } from 'lucide-react'
import {
    PAYMENT_METHOD_OPTIONS,
    PAYMENT_METHODS,
    PRODUCT_TYPE_OPTIONS,
    STORE_IMAGE_MIME_TYPES,
    STORE_MAX_GALLERY_IMAGES,
    PRODUCT_TYPES,
    type PaymentMethod,
    type ProductType,
} from '../../../config/store/store.config'
import type {
    Product,
    ProductFile,
    ProductGalleryImage,
    UpdateProductPayload,
} from '../../../features/store/interfaces/store.interface'
import { formatFileSize, formatPriceInput, getProductPayloadError, parsePriceInput } from '../../../utils/store.utils'

const FIELD_CLASS =
    'w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50'

interface ProductFormProps {
    product?: Product
    isSaving: boolean
    onCancel: () => void
    onSubmit: (payload: UpdateProductPayload) => Promise<void>
}

const isProductType = (value: string): value is ProductType =>
    PRODUCT_TYPE_OPTIONS.some((option) => option.value === value)

const isPaymentMethod = (value: string): value is PaymentMethod =>
    PAYMENT_METHOD_OPTIONS.some((option) => option.value === value)

const isImageFile = (file: File): boolean => file.type.startsWith('image/')

const useObjectUrl = (file: File): string | null => {
    const url = useMemo(() => (isImageFile(file) ? URL.createObjectURL(file) : null), [file])

    useEffect(() => {
        if (!url) return

        return () => {
            URL.revokeObjectURL(url)
        }
    }, [url])

    return url
}

interface GalleryThumbProps {
    src: string
    label: string
    isNew?: boolean
    onRemove: () => void
}

const GalleryThumb = ({ src, label, isNew = false, onRemove }: GalleryThumbProps) => (
    <li className="relative aspect-square overflow-hidden rounded-lg border border-stone-700 bg-stone-900/60">
        <img src={src} alt={label} className="h-full w-full object-cover" />
        {isNew ? (
            <span className="absolute bottom-1 left-1 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-semibold text-stone-900">
                New
            </span>
        ) : null}
        <button
            type="button"
            onClick={onRemove}
            className="absolute right-1 top-1 cursor-pointer rounded-full bg-stone-900/80 p-1 text-stone-200 transition-colors hover:bg-stone-900"
            aria-label={`Remove ${label}`}
        >
            <X className="h-4 w-4" />
        </button>
    </li>
)

interface NewGalleryThumbProps {
    file: File
    index: number
    onRemove: (index: number) => void
}

const NewGalleryThumb = ({ file, index, onRemove }: NewGalleryThumbProps) => {
    const url = useObjectUrl(file)

    const handleRemove = () => {
        onRemove(index)
    }

    if (!url) return null

    return <GalleryThumb src={url} label={file.name} isNew onRemove={handleRemove} />
}

interface ExistingGalleryThumbProps {
    image: ProductGalleryImage
    index: number
    onRemove: (imageUuid: string) => void
}

const ExistingGalleryThumb = ({ image, index, onRemove }: ExistingGalleryThumbProps) => {
    const handleRemove = () => {
        onRemove(image.uuid)
    }

    return <GalleryThumb src={image.url} label={`Gallery image ${index + 1}`} onRemove={handleRemove} />
}

interface SelectedFileRowProps {
    file: File
    index: number
    onRemove: (index: number) => void
}

const SelectedFileRow = ({ file, index, onRemove }: SelectedFileRowProps) => {
    const previewUrl = useObjectUrl(file)

    const handleClick = () => {
        onRemove(index)
    }

    return (
        <li className="flex items-center gap-2 rounded-lg border border-stone-700/60 bg-stone-900/40 px-3 py-1.5 text-sm">
            {previewUrl ? <img src={previewUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" /> : null}
            <span className="min-w-0 flex-1 truncate text-stone-200">{file.name}</span>
            <span className="shrink-0 text-xs text-stone-500">{formatFileSize(file.size)}</span>
            <button
                type="button"
                onClick={handleClick}
                className="cursor-pointer rounded p-1 text-stone-400 transition-colors hover:bg-stone-700 hover:text-stone-100"
                aria-label={`Remove ${file.name}`}
            >
                <X className="h-4 w-4" />
            </button>
        </li>
    )
}

interface ExistingFileRowProps {
    file: ProductFile
    onRemove: (fileUuid: string) => void
}

const ExistingFileRow = ({ file, onRemove }: ExistingFileRowProps) => {
    const handleClick = () => {
        onRemove(file.uuid)
    }

    return (
        <li className="flex items-center gap-2 rounded-lg border border-stone-700/60 bg-stone-900/40 px-3 py-1.5 text-sm">
            <span className="min-w-0 flex-1 truncate text-stone-200">{file.name}</span>
            <span className="shrink-0 text-xs text-stone-500">{formatFileSize(file.size)}</span>
            <button
                type="button"
                onClick={handleClick}
                className="cursor-pointer rounded p-1 text-stone-400 transition-colors hover:bg-stone-700 hover:text-stone-100"
                aria-label={`Remove ${file.name}`}
            >
                <X className="h-4 w-4" />
            </button>
        </li>
    )
}

export const ProductForm = ({ product, isSaving, onCancel, onSubmit }: ProductFormProps) => {
    const isEditing = product !== undefined
    const [name, setName] = useState(product?.name ?? '')
    const [description, setDescription] = useState(product?.description ?? '')
    const [type, setType] = useState<ProductType>(product?.type ?? PRODUCT_TYPES.DIGITAL)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(product?.payment_method ?? PAYMENT_METHODS.POINTS)
    const [priceInput, setPriceInput] = useState(product ? formatPriceInput(product.payment_method, product.price) : '')
    const [existingFiles, setExistingFiles] = useState<ProductFile[]>(product?.files ?? [])
    const [files, setFiles] = useState<File[]>([])
    const [existingGallery, setExistingGallery] = useState<ProductGalleryImage[]>(product?.gallery ?? [])
    const [gallery, setGallery] = useState<File[]>([])
    const [image, setImage] = useState<File | null>(null)
    const [removeImage, setRemoveImage] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isPointsPayment = paymentMethod === PAYMENT_METHODS.POINTS
    const priceLabel = isPointsPayment ? 'Price (points)' : 'Price (USD)'
    const priceStep = isPointsPayment ? 1 : 0.01

    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
    }

    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value)
    }

    const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        if (isProductType(event.target.value)) {
            setType(event.target.value)
        }
    }

    const handlePaymentMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
        if (isPaymentMethod(event.target.value)) {
            setPaymentMethod(event.target.value)
            setPriceInput('')
        }
    }

    const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPriceInput(event.target.value)
    }

    const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files ?? [])
        setFiles((previous) => [...previous, ...selected])
        event.target.value = ''
    }

    const newImagePreview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image])
    const imagePreview = newImagePreview ?? (removeImage ? null : (product?.image_url ?? null))

    useEffect(() => {
        if (!newImagePreview) return

        return () => {
            URL.revokeObjectURL(newImagePreview)
        }
    }, [newImagePreview])

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        setImage(event.target.files?.[0] ?? null)
        event.target.value = ''
    }

    const handleRemoveImage = () => {
        if (image) {
            setImage(null)
            return
        }

        setRemoveImage(product?.image_url != null)
    }

    const handleGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files ?? [])
        setGallery((previous) => [...previous, ...selected])
        event.target.value = ''
    }

    const handleRemoveGalleryImage = (index: number) => {
        setGallery((previous) => previous.filter((_, imageIndex) => imageIndex !== index))
    }

    const handleRemoveExistingGalleryImage = (imageUuid: string) => {
        setExistingGallery((previous) => previous.filter((image) => image.uuid !== imageUuid))
    }

    const handleRemoveFile = (index: number) => {
        setFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index))
    }

    const handleRemoveExistingFile = (fileUuid: string) => {
        setExistingFiles((previous) => previous.filter((file) => file.uuid !== fileUuid))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const keptFileUuids = new Set(existingFiles.map((file) => file.uuid))
        const keptGalleryUuids = new Set(existingGallery.map((galleryImage) => galleryImage.uuid))
        const payload: UpdateProductPayload = {
            name: name.trim(),
            description: description.trim(),
            type,
            payment_method: paymentMethod,
            price: parsePriceInput(paymentMethod, priceInput),
            image,
            gallery,
            files,
            remove_image: removeImage,
            remove_gallery_uuids: (product?.gallery ?? [])
                .filter((galleryImage) => !keptGalleryUuids.has(galleryImage.uuid))
                .map((galleryImage) => galleryImage.uuid),
            remove_file_uuids: (product?.files ?? []).filter((file) => !keptFileUuids.has(file.uuid)).map((file) => file.uuid),
        }

        const validationError = getProductPayloadError(payload, existingFiles.length, existingGallery.length)
        setError(validationError)

        if (validationError) return

        await onSubmit(payload)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-stone-400">Name</span>
                    <input type="text" required value={name} onChange={handleNameChange} className={FIELD_CLASS} />
                </label>
                <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-stone-400">Description</span>
                    <textarea rows={3} value={description} onChange={handleDescriptionChange} className={FIELD_CLASS} />
                </label>
                <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-stone-400">Product type</span>
                    <select value={type} onChange={handleTypeChange} className={FIELD_CLASS}>
                        {PRODUCT_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-stone-400">Payment method</span>
                    <select value={paymentMethod} onChange={handlePaymentMethodChange} className={FIELD_CLASS}>
                        {PAYMENT_METHOD_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-stone-400">{priceLabel}</span>
                    <input
                        type="number"
                        required
                        min={priceStep}
                        step={priceStep}
                        value={priceInput}
                        onChange={handlePriceChange}
                        className={FIELD_CLASS}
                    />
                </label>
            </div>

            <div className="space-y-2">
                <span className="text-xs font-medium text-stone-400">Cover image</span>
                {imagePreview ? (
                    <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-stone-700">
                        <img src={imagePreview} alt="Cover preview" className="aspect-video w-full object-cover" />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute right-2 top-2 cursor-pointer rounded-full bg-stone-900/80 p-1 text-stone-200 transition-colors hover:bg-stone-900"
                            aria-label="Remove cover image"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : null}
                <input
                    type="file"
                    accept={STORE_IMAGE_MIME_TYPES.join(',')}
                    onChange={handleImageChange}
                    className="block w-full cursor-pointer text-sm text-stone-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-stone-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-100 hover:file:bg-stone-600"
                />
            </div>

            <div className="space-y-2">
                <span className="text-xs font-medium text-stone-400">
                    Gallery images ({existingGallery.length + gallery.length}/{STORE_MAX_GALLERY_IMAGES})
                </span>
                {existingGallery.length > 0 || gallery.length > 0 ? (
                    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {existingGallery.map((image, index) => (
                            <ExistingGalleryThumb
                                key={image.uuid}
                                image={image}
                                index={index}
                                onRemove={handleRemoveExistingGalleryImage}
                            />
                        ))}
                        {gallery.map((file, index) => (
                            <NewGalleryThumb
                                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                                file={file}
                                index={index}
                                onRemove={handleRemoveGalleryImage}
                            />
                        ))}
                    </ul>
                ) : null}
                <input
                    type="file"
                    multiple
                    accept={STORE_IMAGE_MIME_TYPES.join(',')}
                    onChange={handleGalleryChange}
                    className="block w-full cursor-pointer text-sm text-stone-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-stone-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-100 hover:file:bg-stone-600"
                />
            </div>

            <div className="space-y-2">
                <span className="text-xs font-medium text-stone-400">Files</span>
                {existingFiles.length > 0 ? (
                    <ul className="space-y-1.5">
                        {existingFiles.map((file) => (
                            <ExistingFileRow key={file.uuid} file={file} onRemove={handleRemoveExistingFile} />
                        ))}
                    </ul>
                ) : null}
                <input
                    type="file"
                    multiple
                    onChange={handleFilesChange}
                    className="block w-full cursor-pointer text-sm text-stone-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-stone-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-100 hover:file:bg-stone-600"
                />
                {files.length > 0 ? (
                    <ul className="space-y-1.5">
                        {files.map((file, index) => (
                            <SelectedFileRow
                                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                                file={file}
                                index={index}
                                onRemove={handleRemoveFile}
                            />
                        ))}
                    </ul>
                ) : null}
            </div>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <div className="flex justify-end gap-3 border-t border-stone-700 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="cursor-pointer rounded-lg border border-stone-700 px-4 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-stone-900 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving ? 'Uploading...' : isEditing ? 'Save changes' : 'Create product'}
                </button>
            </div>
        </form>
    )
}
