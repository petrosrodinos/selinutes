import { Check } from 'lucide-react'
import {
    FULFILLMENT_STATUS_HINTS,
    FULFILLMENT_STATUS_LABELS,
    FULFILLMENT_STATUS_ORDER,
    FULFILLMENT_STATUSES,
    type FulfillmentStatus,
} from '../config/store/store.config'

interface FulfillmentTrackerProps {
    status: FulfillmentStatus
    requiresVerification: boolean
}

export const FulfillmentTracker = ({ status, requiresVerification }: FulfillmentTrackerProps) => {
    const steps = FULFILLMENT_STATUS_ORDER.filter((step) => requiresVerification || step !== FULFILLMENT_STATUSES.PENDING_VERIFICATION)
    const currentIndex = steps.indexOf(status)

    return (
        <div className="space-y-3 rounded-lg border border-stone-700/60 bg-stone-900/40 p-4">
            <ol className="flex items-start">
                {steps.map((step, index) => {
                    const isDone = index < currentIndex || status === steps[steps.length - 1]
                    const isCurrent = index === currentIndex && !isDone
                    const isReached = index <= currentIndex
                    const isLast = index === steps.length - 1

                    return (
                        <li key={step} className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center" aria-current={index === currentIndex ? 'step' : undefined}>
                            <div className="flex w-full items-center">
                                <span className={`h-0.5 flex-1 ${index === 0 ? 'opacity-0' : index <= currentIndex ? 'bg-emerald-500/60' : 'bg-stone-700'}`} />
                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                                        isDone
                                            ? 'border-emerald-500 bg-emerald-500 text-stone-900'
                                            : isCurrent
                                              ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                                              : 'border-stone-700 text-stone-600'
                                    }`}
                                >
                                    {isDone ? <Check className="h-4 w-4" /> : index + 1}
                                </span>
                                <span className={`h-0.5 flex-1 ${isLast ? 'opacity-0' : index < currentIndex ? 'bg-emerald-500/60' : 'bg-stone-700'}`} />
                            </div>
                            <span className={`px-1 text-[11px] font-medium leading-tight sm:text-xs ${isReached ? 'text-stone-100' : 'text-stone-500'}`}>
                                {FULFILLMENT_STATUS_LABELS[step]}
                            </span>
                        </li>
                    )
                })}
            </ol>
            <p className="text-center text-xs text-stone-400">{FULFILLMENT_STATUS_HINTS[status]}</p>
        </div>
    )
}
