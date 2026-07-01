import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-accent text-text-inverted hover:bg-accent-hover shadow-sm hover:shadow-md hover:shadow-black/10 active:scale-[0.97]',
  primary: 'bg-accent text-text-inverted hover:bg-accent-hover shadow-sm hover:shadow-md hover:shadow-black/10 active:scale-[0.97]',
  secondary: 'border border-border text-accent hover:bg-accent/5 hover:border-accent/30',
  ghost: 'text-muted hover:text-text-primary hover:bg-surface-hover',
  destructive: 'bg-error text-text-inverted hover:bg-error/90',
  link: 'text-accent underline-offset-4 hover:underline',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2.5',
  icon: 'h-9 w-9',
}

const Button = forwardRef(({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, variants, sizes }
