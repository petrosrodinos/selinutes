import type { ShippingAddress } from '../features/store/interfaces/store.interface'
import { formatCountry } from '../utils/store.utils'

interface ShippingAddressBlockProps {
    address: ShippingAddress
}

export const ShippingAddressBlock = ({ address }: ShippingAddressBlockProps) => {
    const regionLine = [address.postal_code, address.city].filter(Boolean).join(' ')

    return (
        <address className="space-y-0.5 not-italic">
            <p className="font-medium">{address.full_name}</p>
            <p>{address.line1}</p>
            {address.line2 ? <p>{address.line2}</p> : null}
            <p>{regionLine}</p>
            {address.state ? <p>{address.state}</p> : null}
            <p>{formatCountry(address.country)}</p>
            <p className="pt-1 text-stone-400">Phone: {address.phone}</p>
        </address>
    )
}
