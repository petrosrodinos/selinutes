import { Link } from 'react-router-dom'
import { environments } from '../../config/environments'

type AppLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  linkToHome?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
  xl: 'h-20 w-20',
} as const

const nameSizeClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
} as const

export const AppLogo = ({
  size = 'md',
  showName = true,
  linkToHome = true,
  className = '',
}: AppLogoProps) => {
  const content = (
    <>
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className={`${sizeClasses[size]} shrink-0 drop-shadow-[0_2px_8px_rgba(251,191,36,0.25)]`}
      />
      {showName ? (
        <span
          className={`${nameSizeClasses[size]} font-semibold tracking-tight bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent`}
        >
          {environments.APP_NAME}
        </span>
      ) : null}
    </>
  )

  const wrapperClass = `inline-flex items-center gap-2.5 ${className}`

  if (linkToHome) {
    return (
      <Link to="/" className={`${wrapperClass} transition-opacity hover:opacity-90`}>
        {content}
      </Link>
    )
  }

  return <div className={wrapperClass}>{content}</div>
}
