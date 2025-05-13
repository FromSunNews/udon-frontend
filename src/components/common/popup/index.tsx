'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import walletAnim from '@public/anim/wallet.json';
import notfoundAnim from '@public/anim/notfound.json';
import successAnim from '@public/anim/success.json';
import failAnim from '@public/anim/fail.json';
import { Button } from '../button';

// Dynamically import Lottie Player with SSR disabled
const LottiePlayer = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <div className="w-32 h-32 bg-neutral-800 rounded-full animate-pulse" />,
});

/**
 * Popup variants
 */
export type PopupVariant = 'wallet' | 'notfound' | 'success' | 'fail';

/**
 * Props for Popup component
 */
export interface PopupProps {
  variant: PopupVariant;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

const animationMap: Record<PopupVariant, unknown> = {
  wallet: walletAnim,
  notfound: notfoundAnim,
  success: successAnim,
  fail: failAnim,
};

/**
 * Popup component with Lottie animation and customizable content.
 */
export const Popup: React.FC<PopupProps> = ({
  variant,
  title,
  description,
  buttonText,
  onButtonClick,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-[#232323] rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-neutral-800 relative">
        <h2 className="text-white text-xl font-semibold mb-4 text-center">{title}</h2>
        <div className="w-32 h-32 flex items-center justify-center mb-6">
          {isMounted && (
            <LottiePlayer
              autoplay
              loop={variant === 'wallet' || variant === 'notfound'}
              animationData={animationMap[variant]}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
        <p className="text-gray-400 text-center mb-8 text-base">{description}</p>
        <div className="self-stretch">
          <Button variant="gradient" className="w-full py-3 text-base" onClick={onButtonClick}>
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
