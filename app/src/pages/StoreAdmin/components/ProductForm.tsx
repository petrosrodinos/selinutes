import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { ConfirmationDialog } from '../../../components/ConfirmationDialog'
import {
    PRODUCT_TYPE_OPTIONS,
    STORE_IMAGE_MIME_TYPES,
    STORE_MIN_ONLINE_PRICE_CENTS,
    STORE_MINOR_UNITS_PER_CURRENCY_UNIT,
    PRODUCT_TYPES,
    type ProductType,
} from '../../../config/store/store.config'
import { useAppConfig } from '../../../features/store'
import type {
    Product,
    ProductFile,
    UpdateProductPayload,
} from '../../../features/store/interfaces/store.interface'
import {
    formatCents,
    formatFileSize,
    formatPriceInput,
    centsToPoints,
    formatPoints,
    getProductPayloadError,
    parsePriceInput,
} from '../../../utils/store.utils'

const FIELD_CLASS =
    'w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50'

type PendingRemoval =
    | { kind: 'cover' }
    | { kind: 'new-file'; index: number; name: string }
    | { kind: 'existing-file'; uuid: string; name: string }

interface ProductFormProps {
    product?: Product
    isSaving: boolean
    onCancel: () => void
    onSubmit: (payload: UpdateProductPayload) => Promise<void>
}

const isProductType = (value: string): value is ProductType =>
    PRODUCT_TYPE_OPTIONS.some((option) => option.value === value)

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
    previewUrl?: string
    onRemove: (fileUuid: string) => void
}

const ExistingFileRow = ({ file, previewUrl, onRemove }: ExistingFileRowProps) => {
    const handleClick = () => {
        onRemove(file.uuid)
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

export const ProductForm = ({ product, isSaving, onCancel, onSubmit }: ProductFormProps) => {
    const isEditing = product !== undefined
    const [name, setName] = useState(product?.name ?? '')
    const [description, setDescription] = useState(product?.description ?? '')
    const [type, setType] = useState<ProductType>(product?.type ?? PRODUCT_TYPES.DIGITAL)
    const [priceInput, setPriceInput] = useState(product ? formatPriceInput(product.price) : '')
    const [maxPercentInput, setMaxPercentInput] = useState(String(product?.max_discount_percent ?? 0))
    const [quantityInput, setQuantityInput] = useState(String(product?.quantity ?? 1))
    const [existingFiles, setExistingFiles] = useState<ProductFile[]>(product?.files ?? [])
    const [files, setFiles] = useState<File[]>([])
    const [image, setImage] = useState<File | null>(null)
    const [removeImage, setRemoveImage] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null)

    const galleryUrls = useMemo(() => new Map((product?.gallery ?? []).map((image) => [image.uuid, image.url])), [product])
    const { data: appConfig } = useAppConfig()
    const priceCents = parsePriceInput(priceInput)
    const maxPercent = Number(maxPercentInput)
    const pointsRate = appConfig?.points_per_currency_unit
    const isPercentValid = Number.isInteger(maxPercent) && maxPercent >= 0 && maxPercent <= 100
    const maxDiscountCents = isPercentValid ? Math.floor((priceCents * maxPercent) / 100) : 0
    const pointsPreview =
        maxDiscountCents > 0 && pointsRate !== undefined
            ? `${maxPercent === 100 ? 'Can be bought entirely with points' : `Buyers can pay up to ${formatCents(maxDiscountCents)} with points`} (about ${formatPoints(centsToPoints(maxDiscountCents, pointsRate))} at ${pointsRate.toLocaleString()} points = ${formatCents(STORE_MINOR_UNITS_PER_CURRENCY_UNIT)})`
            : null

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

    const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPriceInput(event.target.value)
    }

    const handleMaxPercentChange = (event: ChangeEvent<HTMLInputElement>) => {
        setMaxPercentInput(event.target.value)
    }

    const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
        setQuantityInput(event.target.value)
    }

    const handleFilesChange =(event: ChangeEvent<HTMLInputElement>) => {
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

    const removeCover = () => {
        if (image) {
            setImage(null)
            return
        }

        setRemoveImage(product?.image_url != null)
    }

    const removeNewFile = (index: number) => {
        setFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index))
    }

    const removeExistingFile = (fileUuid: string) => {
        setExistingFiles((previous) => previous.filter((file) => file.uuid !== fileUuid))
    }

    const handleRemoveImage = () => {
        setPendingRemoval({ kind: 'cover' })
    }

    const handleRemoveFile = (index: number) => {
        setPendingRemoval({ kind: 'new-file', index, name: files[index]?.name ?? 'this file' })
    }

    const handleRemoveExistingFile = (fileUuid: string) => {
        const file = existingFiles.find((existing) => existing.uuid === fileUuid)
        setPendingRemoval({ kind: 'existing-file', uuid: fileUuid, name: file?.name ?? 'this file' })
    }

    const handleCancelRemoval = () => {
        setPendingRemoval(null)
    }

    const handleConfirmRemoval = () => {
        if (!pendingRemoval) return

        if (pendingRemoval.kind === 'cover') removeCover()
        else if (pendingRemoval.kind === 'new-file') removeNewFile(pendingRemoval.index)
        else removeExistingFile(pendingRemoval.uuid)

        setPendingRemoval(null)
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const keptFileUuids = new Set(existingFiles.map((file) => file.uuid))
        const payload: UpdateProductPayload = {
            name: name.trim(),
            description: description.trim(),
            type,
            price: priceCents,
            max_discount_percent: maxPercent,
            quantity: Number(quantityInput),
            image,
            files,
            remove_image: removeImage,
            remove_file_uuids: (product?.files ?? []).filter((file) => !keptFileUuids.has(file.uuid)).map((file) => file.uuid),
        }

        const validationError = getProductPayloadError(payload, existingFiles.length)
        setError(validationError)

        if (validationError) return

        await onSubmit(payload)
    }

    return (
        <>
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
                    <span className="text-xs font-medium text-stone-400">Price (EUR)</span>
                    <input
                        type="number"
                        required
                        min={STORE_MIN_ONLINE_PRICE_CENTS / STORE_MINOR_UNITS_PER_CURRENCY_UNIT}
                        step={0.01}
                        value={priceInput}
                        onChange={handlePriceChange}
                        className={FIELD_CLASS}
                    />
                </label>
                <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-stone-400">Max discount with points (%)</span>
                    <input
                        type="number"
                        required
                        min={0}
                        max={100}
                        step={1}
                        value={maxPercentInput}
                        onChange={handleMaxPercentChange}
                        className={FIELD_CLASS}
                    />
                    <span className="block text-xs text-stone-500">
                        {pointsPreview ?? '0 = points cannot be used, 100 = can be bought entirely with points.'}
                    </span>
                </label>
                <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-stone-400">Quantity</span>
                    <input
                        type="number"
                        required
                        min={1}
                        step={1}
                        value={quantityInput}
                        onChange={handleQuantityChange}
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
                <span className="text-xs font-medium text-stone-400">Files</span>
                {existingFiles.length > 0 ? (
                    <ul className="space-y-1.5">
                        {existingFiles.map((file) => (
                            <ExistingFileRow
                                key={file.uuid}
                                file={file}
                                previewUrl={galleryUrls.get(file.uuid)}
                                onRemove={handleRemoveExistingFile}
                            />
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

        <ConfirmationDialog
            isOpen={pendingRemoval !== null}
            onClose={handleCancelRemoval}
            onConfirm={handleConfirmRemoval}
            title={pendingRemoval?.kind === 'cover' ? 'Remove cover image' : 'Remove file'}
            message={
                pendingRemoval?.kind === 'cover'
                    ? 'Remove the cover image? It is deleted when you save the product.'
                    : `Remove "${pendingRemoval?.name ?? ''}"? It is deleted when you save the product.`
            }
            confirmText="Remove"
            elevated
        />
        </>
    )
}
