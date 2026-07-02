import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumb({ items }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 h-10 px-6 text-xs text-muted border-b border-border bg-surface flex-shrink-0">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight size={12} className="text-muted/30 flex-shrink-0" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </Fragment>
      ))}
    </div>
  )
}
