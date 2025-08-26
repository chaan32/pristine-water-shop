import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        approved:
          "border-transparent bg-status-answered text-status-answered-foreground hover:bg-status-answered/90 transition-smooth",
        pending:
          "border-transparent bg-status-pending text-status-pending-foreground hover:bg-status-pending/90 transition-smooth",
        answered:
          "border-transparent bg-status-answered text-status-answered-foreground hover:bg-status-answered/90 transition-smooth",
        paid:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth water-shadow",
        unpaid:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/90 transition-smooth",
        failed:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-smooth",
        shipped:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/90 transition-smooth clean-shadow",
        delivered:
          "border-transparent bg-status-answered text-status-answered-foreground hover:bg-status-answered/90 transition-smooth",
        cancelled:
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/90 transition-smooth",
        preparing:
          "border-transparent bg-accent-light text-foreground hover:bg-accent-light/90 transition-smooth",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
