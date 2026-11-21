import type { ChangeEvent } from 'react'
import { Select, type SelectOption } from '../../components/ui/Select'
import type { ShippingAddress } from '../../features/store/interfaces/store.interface'
import { SHIPPING_COUNTRY_CODES, formatCountry, type ShippingFieldErrors } from '../../utils/store.utils'

const BASE_FIELD_CLASS =
    'peer w-full rounded-xl border bg-stone-900/60 px-3.5 pb-2 pt-6 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-600 focus:bg-stone-900'

const getFieldClass = (hasError: boolean): string =>
    `${BASE_FIELD_CLASS} ${hasError ? 'border-rose-500/70 focus:border-rose-400' : 'border-stone-700 focus:border-amber-500/70'}`

const LABEL_CLASS =
    'pointer-events-none absolute left-3.5 top-2 text-[11px] font-medium uppercase tracking-wide text-stone-500 transition-colors peer-focus:text-amber-400'

type TextField = Exclude<keyof ShippingAddress, 'country'>

interface ShippingFormProps {
    address: ShippingAddress
    errors: ShippingFieldErrors
    onChange: (address: ShippingAddress) => void
}

interface FieldProps {
    label: string
    placeholder: string
    field: TextField
    address: ShippingAddress
    errors: ShippingFieldErrors
    onChange: (address: ShippingAddress) => void
    autoComplete: string
    type?: string
    inputMode?: 'text' | 'tel' | 'numeric'
    className?: string
}

const FieldError = ({ message }: { message?: string }) =>
    message ? (
        <p role="alert" className="mt-1 px-1 text-xs text-rose-300">
            {message}
        </p>
    ) : null

const Field = ({ label, placeholder, field, address, errors, onChange, autoComplete, type = 'text', inputMode, className = '' }: FieldProps) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange({ ...address, [field]: event.target.value })
    }

    return (
        <div className={className}>
            <div className="relative">
                <input
                    type={type}
                    inputMode={inputMode}
                    value={address[field] ?? ''}
                    onChange={handleChange}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    aria-invalid={errors[field] ? true : undefined}
                    className={getFieldClass(Boolean(errors[field]))}
                />
                <span className={LABEL_CLASS}>{label}</span>
            </div>
            <FieldError message={errors[field]} />
        </div>
    )
}

const COUNTRY_OPTIONS: SelectOption[] = SHIPPING_COUNTRY_CODES.map((code) => ({ value: code, label: formatCountry(code) })).sort((a, b) =>
    a.label.localeCompare(b.label),
)

export const ShippingForm = ({ address, errors, onChange }: ShippingFormProps) => {
    const handleCountryChange = (country: string) => {
        onChange({ ...address, country })
    }

    const shared = { address, errors, onChange }

    return (
        <div className="grid grid-cols-6 gap-3">
            <div className="col-span-6">
                <div className="relative">
                    <Select
                        value={address.country}
                        options={COUNTRY_OPTIONS}
                        onChange={handleCountryChange}
                        ariaLabel="Country / Region"
                        invalid={Boolean(errors.country)}
                        searchable
                        floatingLabel
                    />
                    <span className="pointer-events-none absolute left-3.5 top-2 text-[11px] font-medium uppercase tracking-wide text-stone-500">
                        Country / Region
                    </span>
                </div>
                <FieldError message={errors.country} />
            </div>
            <Field {...shared} label="Full name" placeholder="e.g. Maria Papadopoulou" field="full_name" autoComplete="name" className="col-span-6 sm:col-span-3" />
            <Field {...shared} label="Phone" placeholder="e.g. +357 99 123456" field="phone" autoComplete="tel" type="tel" inputMode="tel" className="col-span-6 sm:col-span-3" />
            <Field {...shared} label="Address" placeholder="Street name and number" field="line1" autoComplete="address-line1" className="col-span-6" />
            <Field {...shared} label="Apartment, suite (optional)" placeholder="Apartment, floor, building" field="line2" autoComplete="address-line2" className="col-span-6" />
            <Field {...shared} label="City" placeholder="e.g. Limassol" field="city" autoComplete="address-level2" className="col-span-6 sm:col-span-2" />
            <Field {...shared} label="State / Province (optional)" placeholder="e.g. Limassol District" field="state" autoComplete="address-level1" className="col-span-6 sm:col-span-2" />
            <Field {...shared} label="Postal code" placeholder="e.g. 3025" field="postal_code" autoComplete="postal-code" className="col-span-6 sm:col-span-2" />
        </div>
    )
}
