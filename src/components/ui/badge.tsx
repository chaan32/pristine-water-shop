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
          "border-transparent bg-green-500 text-white hover:bg-green-600",
        pending:
          "border-transparent bg-status-pending text-status-pending-foreground hover:bg-status-pending/90",
        answered:
          "border-transparent bg-status-answered text-status-answered-foreground hover:bg-status-answered/90",
        paid:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/90",
        failed:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        shipped:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        delivered:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/90",
        cancelled:
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/90",
        preparing:
          "border-transparent bg-status-pending text-status-pending-foreground hover:bg-status-pending/90",
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
