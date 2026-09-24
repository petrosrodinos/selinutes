import { useState, type ChangeEvent, type FormEvent } from 'react'
import { STORE_MAX_POINTS_PER_CURRENCY_UNIT, STORE_MINOR_UNITS_PER_CURRENCY_UNIT } from '../../../config/store/store.config'
import { useAppConfig, useUpdateAppConfig } from '../../../features/store'
import { formatCents, formatPoints } from '../../../utils/store.utils'

const FIELD_CLASS =
    'w-40 rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50'

interface PointsRateFormProps {
    currentRate: number
}

const PointsRateForm = ({ currentRate }: PointsRateFormProps) => {
    const [rateInput, setRateInput] = useState(String(currentRate))
    const updateMutation = useUpdateAppConfig()

    const parsedRate = Number(rateInput)
    const isValid =
        Number.isInteger(parsedRate) && parsedRate >= 1 && parsedRate <= STORE_MAX_POINTS_PER_CURRENCY_UNIT
    const isUnchanged = parsedRate === currentRate

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setRateInput(event.target.value)
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!isValid || isUnchanged) return

        updateMutation.mutate({ points_per_currency_unit: parsedRate })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Points per {formatCents(STORE_MINOR_UNITS_PER_CURRENCY_UNIT)}</span>
                <input
                    type="number"
                    min={1}
                    max={STORE_MAX_POINTS_PER_CURRENCY_UNIT}
                    step={1}
                    required
                    value={rateInput}
                    onChange={handleChange}
                    className={FIELD_CLASS}
                />
            </label>
            <button
                type="submit"
                disabled={!isValid || isUnchanged || updateMutation.isPending}
                className="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-stone-900 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {updateMutation.isPending ? 'Saving...' : 'Save rate'}
            </button>
            <p className="basis-full text-xs text-stone-500">
                {isValid
                    ? `${formatPoints(parsedRate)} = ${formatCents(STORE_MINOR_UNITS_PER_CURRENCY_UNIT)}. `
                    : 'Enter a whole number of at least 1. '}
                Applies immediately to what points are worth as a discount on every product.
            </p>
        </form>
    )
}

export const PointsRateCard = () => {
    const { data, isLoading, isError } = useAppConfig()

    return (
        <section className="space-y-3 rounded-xl border border-stone-700 bg-stone-800/70 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300">Points rate</h2>
            {isLoading ? <div className="h-16 animate-pulse rounded-lg bg-stone-900/50" /> : null}
            {isError ? <p className="text-sm text-red-300">Failed to load the points rate.</p> : null}
            {data ? <PointsRateForm key={data.points_per_currency_unit} currentRate={data.points_per_currency_unit} /> : null}
        </section>
    )
}
