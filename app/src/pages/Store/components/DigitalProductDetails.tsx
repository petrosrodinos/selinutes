import type { ProductDetailsProps } from './store-card.types'

export const DigitalProductDetails = ({ product }: ProductDetailsProps) =>
    product.description ? <p className="line-clamp-3 text-sm text-stone-300">{product.description}</p> : null
