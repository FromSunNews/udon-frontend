'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography } from '@/components/common/typography';
import { Skeleton } from '@/components/common/skeleton';
import { ExternalLinkIcon, Sparkles } from 'lucide-react';
import { cn } from '@/utils/tailwind';

interface FaucetTestBadgeProps {
  isLoading?: boolean;
  className?: string;
}

export function FaucetTestBadge({ isLoading = false, className }: FaucetTestBadgeProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevent hydration issues
  }

  if (isLoading) {
    return (
      <div className={cn('inline-flex items-center h-8', className)}>
        <Skeleton className="w-40 h-8 rounded-full" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 py-1.5 px-3 rounded-full border transition-all duration-300',
        'bg-gradient-to-r from-background via-background to-background hover:from-primary/5 hover:to-primary/10',
        'border-border hover:border-primary/20 cursor-pointer',
        'hover:shadow-md hover:shadow-primary/5',
        isHovered && 'scale-[1.03]',
        className
      )}
      onClick={() => router.push('/faucet')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Sparkles
        className={cn(
          'w-4 h-4 transition-colors duration-300',
          isHovered ? 'text-primary' : 'text-submerged'
        )}
      />
      <Typography
        variant="small"
        weight="medium"
        className={cn(
          'transition-colors duration-300',
          isHovered ? 'text-foreground' : 'text-submerged'
        )}
      >
        Udon Faucet Testnet
      </Typography>
      <ExternalLinkIcon
        className={cn(
          'w-3.5 h-3.5 transition-all duration-300',
          isHovered ? 'text-primary transform translate-x-0.5 -translate-y-0.5' : 'text-submerged'
        )}
      />
    </div>
  );
}
