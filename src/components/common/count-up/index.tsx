'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Typography } from '../typography';

const CountUpLib = dynamic(() => import('react-countup'), {
  ssr: false,
});

interface CountUpProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color?: any;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variant?: any;
  abbreviate?: boolean;
  animateOnlyOnce?: boolean;
}

// Helper function to format numbers with K, M, B abbreviations and trim trailing zeros
const formatWithAbbreviation = (num: number, decimals: number = 2): string => {
  let formatted: string;
  let suffix = '';

  if (num >= 1_000_000_000) {
    formatted = (num / 1_000_000_000).toFixed(decimals);
    suffix = 'B';
  } else if (num >= 1_000_000) {
    formatted = (num / 1_000_000).toFixed(decimals);
    suffix = 'M';
  } else if (num >= 1_000) {
    formatted = (num / 1_000).toFixed(decimals);
    suffix = 'K';
  } else {
    // For numbers less than 1000, ensure decimal places are preserved
    formatted = num.toFixed(decimals);
  }

  // Trim trailing zeros after decimal point, then add suffix
  return formatted.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') + suffix;
};

export default function CountUp({
  value,
  suffix = '',
  prefix = '',
  duration = 1,
  decimals = 2,
  color,
  className = '',
  variant = 'default',
  abbreviate = true,
  animateOnlyOnce = true,
}: CountUpProps) {
  const [isClient, setIsClient] = useState(false);
  const hasAnimatedRef = useRef(false);
  const previousValueRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    return () => {
      // Reset animation state when component unmounts
      hasAnimatedRef.current = false;
    };
  }, []);

  // Track value changes for comparison
  useEffect(() => {
    previousValueRef.current = value;
  }, [value]);

  // Determine if we should animate
  const shouldAnimate = !hasAnimatedRef.current || !animateOnlyOnce;

  // Mark as animated after first render
  useEffect(() => {
    if (isClient && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
    }
  }, [isClient]);

  // Function to format and trim trailing zeros
  const formatNumber = (num: number): string => {
    if (abbreviate) {
      return formatWithAbbreviation(num, decimals);
    } else {
      // Format to fixed decimals and trim trailing zeros
      return num
        .toFixed(decimals)
        .replace(/(\.\d*?)0+$/, '$1')
        .replace(/\.$/, '');
    }
  };

  if (!isClient) {
    return (
      <Typography variant={variant} color={color} className={className}>
        {prefix}
        {formatNumber(value)}
        {suffix}
      </Typography>
    );
  }

  // If we shouldn't animate, just show the formatted value
  if (!shouldAnimate) {
    return (
      <Typography variant={variant} color={color} className={className}>
        {prefix}
        {formatNumber(value)}
        {suffix}
      </Typography>
    );
  }

  return (
    <Typography variant={variant} color={color} className={className}>
      <CountUpLib
        end={value}
        duration={duration}
        decimals={decimals}
        formattingFn={(n: number) => {
          let formattedNumber;

          if (abbreviate) {
            formattedNumber = formatWithAbbreviation(n, decimals);
          } else {
            // Format with the specified decimals, then trim trailing zeros
            formattedNumber = n
              .toFixed(decimals)
              .replace(/(\.\d*?)0+$/, '$1')
              .replace(/\.$/, '');
          }

          return `${prefix}${formattedNumber}${suffix}`;
        }}
      />
    </Typography>
  );
}
