import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ConnectWallet } from '@/components/custom/wallet';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/tailwind';
import { SparklesIcon } from 'lucide-react';
import { ShineBorder } from '@/components/common/shine-border';
import { Typography } from '../common/typography';

// Testnet badge component
const TestnetBadge = () => {
  return (
    <div
      className={cn(
        'relative overflow-hidden inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium',
        'absolute right-[-54px] top-[-15px]',
        'bg-card/80'
      )}
    >
      <ShineBorder shineColor={['#36B1FF', '#E4F5FF']} duration={10} />
      <SparklesIcon className="w-3 h-3" />
      <Typography weight="medium" className="text-[8px] uppercase text-bold">
        Testnet
      </Typography>
    </div>
  );
};

export const Header: React.FC = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Call once to set initial state
    handleScroll();

    // Clean up event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[20] flex flex-row px-16 justify-between items-center py-4 transition-all duration-300',
        scrolled && 'bg-background/10 backdrop-blur-md shadow-sm'
      )}
    >
      <div className="w-[94px] h-[46px] relative cursor-pointer" onClick={() => router.push('/')}>
        <Image src="/logo/logo-shorttext.png" alt="Logo" fill className="object-contain" />
        <TestnetBadge />
      </div>
      <div className="z-[100]">
        <ConnectWallet />
      </div>
    </header>
  );
};
