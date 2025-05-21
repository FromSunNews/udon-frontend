import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/tailwind';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 relative',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/20',
        outline:
          'border border-primary bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-embossed shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        third: 'bg-muted text-muted-foreground hover:border-ring',
        disabled: 'bg-muted text-muted-foreground hover:border-ring !cursor-not-allowed',
        gradient:
          'bg-gradient-to-r from-[#52E5FF] hover:opacity-90 via-[#36B1FF] to-[#E4F5FF] text-black',
        outlineGradient: `
  relative bg-transparent text-[#36B1FF] 
  border border-transparent
  !border-none
  overflow-hidden
`,
        none: '',
      },
      size: {
        default: 'h-9 px-6 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
      rounded: {
        default: 'rounded-full',
        none: 'rounded-none',
      },
      cursor: {
        default: 'cursor-pointer',
        notAllowed: 'cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
      cursor: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animationHover?: boolean;
  badgeLabel?: string;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  badgeClassName?: string;
}

const badgePositionClasses = {
  'top-right': '-top-3 -right-2 translate-x-1/4',
  'top-left': '-top-3 -left-2 -translate-x-1/4',
  'bottom-right': '-bottom-3 -right-2 translate-x-1/4',
  'bottom-left': '-bottom-3 -left-2 -translate-x-1/4',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      badgeLabel,
      badgePosition = 'top-right',
      badgeClassName,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const positionClasses = badgePositionClasses[badgePosition];

    return (
      <div className="relative">
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            variant === 'outlineGradient' && 'overflow-hidden'
          )}
          ref={ref}
          {...props}
        >
          {variant === 'outlineGradient' && (
            <>
              <div
                aria-hidden
                className="
                  pointer-events-none absolute inset-0 z-0 rounded-[inherit] p-[1px]
                  bg-gradient-to-r from-[#52E5FF] via-[#36B1FF] to-[#E4F5FF]
                "
              />
              <div
                aria-hidden
                className="
                  pointer-events-none absolute inset-[1px] z-10 rounded-[inherit] bg-black
                "
              />
            </>
          )}
          <div
            className={
              variant === 'outlineGradient'
                ? 'flex flex-row justify-center items-center gap-3 relative z-20 bg-gradient-to-r from-[#52E5FF] hover:opacity-90 via-[#36B1FF] to-[#E4F5FF] bg-clip-text text-transparent'
                : 'flex flex-row w-full justify-center items-center gap-2'
            }
          >
            {children}
          </div>
        </Comp>

        {badgeLabel && (
          <div
            className={cn(
              'absolute z-10 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap',
              'bg-[#FEE7BE] text-black transform',
              positionClasses,
              badgeClassName
            )}
          >
            {badgeLabel}
          </div>
        )}
      </div>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
