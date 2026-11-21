import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'

export interface SelectOption<T extends string = string> {
    value: T
    label: string
    disabled?: boolean
}

interface SelectProps<T extends string = string> {
    value: T
    options: readonly SelectOption<T>[]
    onChange: (value: T) => void
    placeholder?: string
    ariaLabel?: string
    id?: string
    disabled?: boolean
    invalid?: boolean
    /** Shows a filter box at the top of the list, useful for long lists. */
    searchable?: boolean
    /** Extra classes for the trigger button (merged after the defaults). */
    className?: string
    /** Reserves room for a floating label rendered by the parent. */
    floatingLabel?: boolean
}

interface PopoverPosition {
    top: number
    left: number
    width: number
    maxHeight: number
    placement: 'bottom' | 'top'
}

const POPOVER_GAP = 6
const POPOVER_MAX_HEIGHT = 288
const VIEWPORT_MARGIN = 12

const computePosition = (trigger: HTMLElement): PopoverPosition => {
    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN
    const spaceAbove = rect.top - VIEWPORT_MARGIN
    const placeAbove = spaceBelow < 200 && spaceAbove > spaceBelow
    const available = placeAbove ? spaceAbove : spaceBelow
    const maxHeight = Math.max(120, Math.min(POPOVER_MAX_HEIGHT, available - POPOVER_GAP))

    return {
        top: placeAbove ? rect.top - POPOVER_GAP : rect.bottom + POPOVER_GAP,
        left: rect.left,
        width: rect.width,
        maxHeight,
        placement: placeAbove ? 'top' : 'bottom',
    }
}

export const Select = <T extends string = string>({
    value,
    options,
    onChange,
    placeholder = 'Select...',
    ariaLabel,
    id,
    disabled = false,
    invalid = false,
    searchable = false,
    className = '',
    floatingLabel = false,
}: SelectProps<T>) => {
    const generatedId = useId()
    const listboxId = `${generatedId}-listbox`
    const triggerRef = useRef<HTMLButtonElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const typeaheadRef = useRef({ text: '', timer: 0 })
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState<PopoverPosition | null>(null)
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)

    const selected = options.find((option) => option.value === value)

    const visibleOptions = useMemo(() => {
        const needle = query.trim().toLowerCase()
        return needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : options
    }, [options, query])

    const close = useCallback((returnFocus = true) => {
        setIsOpen(false)
        setQuery('')
        if (returnFocus) triggerRef.current?.focus()
    }, [])

    const open = () => {
        if (disabled || !triggerRef.current) return

        setPosition(computePosition(triggerRef.current))
        const selectedIndex = options.findIndex((option) => option.value === value)
        setActiveIndex(Math.max(0, selectedIndex))
        setIsOpen(true)
    }

    const commit = (option: SelectOption<T> | undefined) => {
        if (!option || option.disabled) return

        onChange(option.value)
        close()
    }

    useLayoutEffect(() => {
        if (!isOpen) return

        if (searchable) {
            searchRef.current?.focus({ preventScroll: true })
        }
    }, [isOpen, searchable])

    useEffect(() => {
        if (!isOpen) return

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node

            if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return

            close(false)
        }

        const handleReposition = (event: Event) => {
            if (event.type === 'scroll' && popoverRef.current?.contains(event.target as Node)) return
            if (!triggerRef.current) return

            setPosition(computePosition(triggerRef.current))
        }

        document.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('resize', handleReposition)
        window.addEventListener('scroll', handleReposition, true)

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('resize', handleReposition)
            window.removeEventListener('scroll', handleReposition, true)
        }
    }, [isOpen, close])

    useEffect(() => {
        if (!isOpen) return

        listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' })
    }, [isOpen, activeIndex, visibleOptions])

    const moveActive = (direction: 1 | -1) => {
        if (visibleOptions.length === 0) return

        let next = activeIndex

        for (let step = 0; step < visibleOptions.length; step += 1) {
            next = (next + direction + visibleOptions.length) % visibleOptions.length
            if (!visibleOptions[next].disabled) break
        }

        setActiveIndex(next)
    }

    const runTypeahead = (key: string) => {
        const state = typeaheadRef.current
        window.clearTimeout(state.timer)
        state.text += key.toLowerCase()
        state.timer = window.setTimeout(() => {
            state.text = ''
        }, 600)

        const start = state.text.length === 1 ? activeIndex + 1 : activeIndex
        const ordered = [...visibleOptions.keys()].map((index) => (index + start) % visibleOptions.length)
        const match = ordered.find((index) => visibleOptions[index].label.toLowerCase().startsWith(state.text) && !visibleOptions[index].disabled)

        if (match !== undefined) setActiveIndex(match)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (disabled) return

        if (!isOpen) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                event.preventDefault()
                open()
            }
            return
        }

        switch (event.key) {
            case 'Escape':
                event.preventDefault()
                event.nativeEvent.stopPropagation()
                close()
                break
            case 'Tab':
                close(false)
                break
            case 'ArrowDown':
                event.preventDefault()
                moveActive(1)
                break
            case 'ArrowUp':
                event.preventDefault()
                moveActive(-1)
                break
            case 'Home':
                if (!searchable) {
                    event.preventDefault()
                    setActiveIndex(0)
                }
                break
            case 'End':
                if (!searchable) {
                    event.preventDefault()
                    setActiveIndex(Math.max(0, visibleOptions.length - 1))
                }
                break
            case 'Enter':
                event.preventDefault()
                commit(visibleOptions[activeIndex])
                break
            case ' ':
                if (!searchable || query === '') {
                    event.preventDefault()
                    if (!searchable) commit(visibleOptions[activeIndex])
                }
                break
            default:
                if (!searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                    runTypeahead(event.key)
                }
        }
    }

    const handleToggle = () => {
        if (isOpen) close()
        else open()
    }

    const triggerClass = [
        'group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-stone-900/60 px-3 text-left text-sm text-stone-100 outline-none transition-colors',
        'focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-50',
        floatingLabel ? 'rounded-xl px-3.5 pb-2 pt-6' : 'py-2',
        invalid ? 'border-rose-500/70' : isOpen ? 'border-amber-500/70' : 'border-stone-700 hover:border-stone-500',
        className,
    ].join(' ')

    const activeOptionId = isOpen && visibleOptions[activeIndex] ? `${generatedId}-option-${activeIndex}` : undefined

    return (
        <>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                role="combobox"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? listboxId : undefined}
                aria-invalid={invalid || undefined}
                disabled={disabled}
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                className={triggerClass}
            >
                <span className={`min-w-0 flex-1 truncate ${selected ? '' : 'text-stone-500'}`}>{selected?.label ?? placeholder}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </button>

            {isOpen && position
                ? createPortal(
                      <div
                          ref={popoverRef}
                          style={{
                              position: 'fixed',
                              left: position.left,
                              width: position.width,
                              ...(position.placement === 'bottom'
                                  ? { top: position.top }
                                  : { bottom: window.innerHeight - position.top }),
                          }}
                          className={`z-[200] overflow-hidden rounded-xl border border-stone-700 bg-stone-900 shadow-2xl shadow-black/50 ring-1 ring-black/20 animate-select-pop ${position.placement === 'top' ? 'origin-bottom' : 'origin-top'}`}
                      >
                          {searchable ? (
                              <div className="flex items-center gap-2 border-b border-stone-800 px-3 py-2">
                                  <Search className="h-4 w-4 shrink-0 text-stone-500" />
                                  <input
                                      ref={searchRef}
                                      value={query}
                                      onChange={(event) => {
                                          setQuery(event.target.value)
                                          setActiveIndex(0)
                                      }}
                                      onKeyDown={handleKeyDown}
                                      placeholder="Search..."
                                      aria-label="Search options"
                                      aria-controls={listboxId}
                                      aria-activedescendant={activeOptionId}
                                      className="w-full bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
                                  />
                              </div>
                          ) : null}
                          <ul
                              ref={listRef}
                              id={listboxId}
                              role="listbox"
                              style={{ maxHeight: position.maxHeight - (searchable ? 44 : 0) }}
                              className="overflow-y-auto p-1 [scrollbar-color:theme(colors.stone.700)_transparent] [scrollbar-width:thin]"
                          >
                              {visibleOptions.length === 0 ? (
                                  <li className="px-3 py-6 text-center text-sm text-stone-500">No results</li>
                              ) : (
                                  visibleOptions.map((option, index) => {
                                      const isSelected = option.value === value
                                      const isActive = index === activeIndex

                                      return (
                                          <li
                                              key={option.value}
                                              id={`${generatedId}-option-${index}`}
                                              data-index={index}
                                              role="option"
                                              aria-selected={isSelected}
                                              aria-disabled={option.disabled || undefined}
                                              onPointerEnter={() => setActiveIndex(index)}
                                              onClick={() => commit(option)}
                                              className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                                                  option.disabled
                                                      ? 'cursor-not-allowed text-stone-600'
                                                      : isActive
                                                        ? 'bg-stone-800 text-stone-50'
                                                        : 'text-stone-300'
                                              } ${isSelected ? 'font-medium text-amber-300' : ''}`}
                                          >
                                              <span className="truncate">{option.label}</span>
                                              {isSelected ? <Check className="h-4 w-4 shrink-0 text-amber-400" /> : null}
                                          </li>
                                      )
                                  })
                              )}
                          </ul>
                      </div>,
                      document.body,
                  )
                : null}
        </>
    )
}
