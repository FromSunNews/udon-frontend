'use client';

import React, { useState } from 'react';
import { Typography } from '@/components/common/typography';
import Image from 'next/image';
import Link from 'next/link';
// import { EllipsisIcon } from 'lucide-react';

type HoverState = 'none' | 'simple' | 'optimized' | 'low-cost' | 'per-market-rates';

type ItemType = {
  id: HoverState;
  title: string;
  description: string;
  type: 'earn' | 'borrow';
};

const ITEMS: ItemType[] = [
  {
    id: 'simple',
    title: 'Simple',
    description: 'Deposit and start earning',
    type: 'earn',
  },
  {
    id: 'optimized',
    title: 'Optimized',
    description: 'Deposit and start earning',
    type: 'earn',
  },
  {
    id: 'low-cost',
    title: 'Low costs',
    description: 'Deposit and start earning',
    type: 'borrow',
  },
  {
    id: 'per-market-rates',
    title: 'Per market rates',
    description: 'Deposit and start earning',
    type: 'borrow',
  },
];

export const InfrastructureSection: React.FC = () => {
  const [hoverState, setHoverState] = useState<HoverState>('none');
  const [cardHover, setCardHover] = useState<'earn' | 'borrow' | null>(null);

  const getImagePath = (state: HoverState) => {
    const basePath = '/images/landing/infratructure/';
    return `${basePath}${state}.png`;
  };

  const renderItems = (type: 'earn' | 'borrow') => {
    return ITEMS.filter(item => item.type === type).map(item => (
      <div
        key={item.id}
        className={`p-4 rounded-xl transition-all duration-300 flex items-center gap-4 ${
          hoverState === item.id ? 'bg-black text-white' : ''
        }`}
        onMouseEnter={() => setHoverState(item.id)}
        onMouseLeave={() => setHoverState('none')}
      >
        {hoverState === item.id && (
          <div className="w-6 h-6 flex-shrink-0">
            <Image
              src="/images/landing/infratructure/lookup-icon.svg"
              alt="Lookup"
              width={24}
              height={24}
            />
          </div>
        )}
        <div>
          <Typography
            as="h4"
            className={`font-semibold ${hoverState === item.id ? 'text-white' : 'text-neutral-800'}`}
          >
            {item.title}
          </Typography>
          {/* <Typography className={hoverState === item.id ? 'text-white' : 'text-neutral-800'}>
            {item.description}
          </Typography> */}
        </div>
      </div>
    ));
  };

  return (
    <section className="w-full">
      <div className="relative min-h-screen px-6 md:px-20 py-16 md:py-28 flex flex-col items-center">
        <div className="absolute h-full w-full inset-0 z-0">
          <video
            src="/images/landing/infratructure/bg.webm"
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
          />
        </div>

        <div className="relative z-10">
          <Typography
            as="h2"
            className="text-[64px] font-normal leading-[69px] text-center relative max-md:max-w-full max-md:text-[40px] max-md:leading-[48px] max-md:mt-10"
          >
            Open infrastructure
            <br />
            for onchain loans
          </Typography>

          {/* Features Section */}
          <div className="relative mt-16 max-w-4xl shadow-[0px_0px_44.5px_0px_rgba(31,109,233,0.18)] backdrop-blur-[3px] bg-[radial-gradient(86.19%_68.08%_at_29.32%_106.38%,rgba(216,230,255,0.49)_0%,rgba(255,255,255,0.49)_100%)] w-full pl-[23px] rounded-3xl border-2 border-solid border-white max-md:max-w-full">
            {/* <div className="absolute top-[-180px] left-[-140px] bg-white/60 shadow-md p-6 rounded-xl w-[260px] z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#D86479] rounded-full" />
                  <div>
                    <Typography className="text-black">Deposit</Typography>
                    <Typography className="text-[#8AB7F6] text-xs">@ssssssssss</Typography>
                  </div>
                </div>
                <EllipsisIcon className="w-6 h-6" />
              </div>
              <Typography className="text-black mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua...
              </Typography>
            </div>

            <div className="absolute bottom-[-160px] right-[-180px] bg-white/60 shadow-md p-6 rounded-xl w-[220px] z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#D86479] rounded-full" />
                  <div>
                    <Typography className="text-black">Deposit</Typography>
                    <Typography className="text-[#8AB7F6] text-xs">@ssssssssss</Typography>
                  </div>
                </div>
                <EllipsisIcon className="w-6 h-6" />
              </div>
              <Typography className="text-black mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua...
              </Typography>
            </div> */}

            <div className="grid md:grid-cols-12 gap-8 relative">
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-[200px] w-[60vw] h-[200px] rounded-full bg-[#8ab7f669]/40 z-0 blur-[100px]" />
              {/* Left Column */}
              <div className="md:col-span-5 flex flex-col justify-center py-6 z-10">
                {/* Earn Card */}
                <div
                  className={`p-6 rounded-xl mt-6 transition-all duration-300 cursor-pointer ${
                    cardHover === 'earn' ? 'shadow-2xl bg-white/80' : ''
                  }`}
                  onMouseEnter={() => setCardHover('earn')}
                  onMouseLeave={() => setCardHover(null)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <Typography as="h3" className="text-xl font-semibold text-black">
                        Earn
                      </Typography>
                      <Typography className="text-neutral-800">
                        Generate yield on your crypto assets
                      </Typography>
                    </div>
                    <Link href="/dashboard" className="bg-[#1E1E1E] px-4 py-2 rounded-full">
                      <Typography className="text-white font-semibold">Earn</Typography>
                    </Link>
                  </div>
                  <div className="mt-6 space-y-6">{renderItems('earn')}</div>
                </div>

                {/* Borrow Card */}
                <div
                  className={`mt-6 p-6 rounded-xl transition-all duration-300 cursor-pointer ${
                    cardHover === 'borrow' ? 'shadow-2xl bg-white/80' : ''
                  }`}
                  onMouseEnter={() => setCardHover('borrow')}
                  onMouseLeave={() => setCardHover(null)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <Typography as="h3" className="text-xl font-semibold text-black">
                        Borrow
                      </Typography>
                      <Typography className="text-neutral-800">
                        Access liquidity without selling your assets
                      </Typography>
                    </div>
                    <Link href="/dashboard" className="bg-[#1E1E1E] px-4 py-2 rounded-full">
                      <Typography className="text-white font-semibold">Borrow</Typography>
                    </Link>
                  </div>
                  <div className="mt-6 space-y-6">{renderItems('borrow')}</div>
                </div>
              </div>

              {/* Right Column */}
              <div className="md:col-span-7 z-10">
                <div className="bg-gradient-to-b from-[#5CB4EA] to-[#4975C0] rounded-3xl p-8 h-full w-[500px] mx-auto">
                  <div className="relative w-full h-full">
                    <Image
                      src={getImagePath(hoverState)}
                      alt="Feature illustration"
                      fill
                      className="object-contain transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
