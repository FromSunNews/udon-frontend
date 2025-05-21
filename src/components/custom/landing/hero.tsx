import { ChevronRight } from 'lucide-react';
import React from 'react';
import { StatCard } from './stat-card';
import { Button } from '@/components/common/button';
import { Typography } from '@/components/common/typography';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Video */}
      <div className="absolute w-full max-w-[300px] md:max-w-[750px] aspect-square right-[0px] top-6 opacity-30 md:opacity-100">
        <video
          src="/images/landing/hero/cube-rotate.webm"
          autoPlay
          loop
          muted
          playsInline
          className="object-contain w-full h-full"
        />
      </div>

      <div className="container mx-auto h-full flex flex-col justify-center pt-[20vh]">
        {/* Main Content Section */}
        <div className="relative flex flex-col justify-center">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Left Column - Content */}
            <div className="col-span-1 md:col-span-3 space-y-6 px-4 md:px-0">
              <div className="space-y-2">
                <Typography
                  as="h1"
                  weight="semibold"
                  className="text-5xl md:text-15xl leading-tight text-center md:text-left"
                >
                  Unlocking Liquidity
                </Typography>
                <Typography className="text-3xl md:text-10xl max-w-2xl text-center md:text-left">
                  Money Markets and Leverage on Chromia
                </Typography>
                <Typography
                  weight="medium"
                  className="text-lg md:text-2xl pt-2 text-center md:text-left"
                >
                  Udon Finance is your secure, efficient, and flexible solution for lending and
                  leverage.
                </Typography>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row items-center gap-3 pb-8 md:pb-16">
                {/* Earn Button */}
                <Button
                  className="flex flex-row !w-[120px] md:w-auto"
                  onClick={() => {
                    router.push('/dashboard');
                  }}
                >
                  <Typography size="base" weight="normal">
                    Earn
                  </Typography>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Borrow Button */}
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => {
                    router.push('/dashboard');
                  }}
                >
                  <Typography size="base" weight="normal">
                    Borrow
                  </Typography>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Leveraged Yield Button */}
                <Button
                  badgeLabel="Coming Soon"
                  badgePosition="top-right"
                  badgeClassName="rotate-12 top-[-5px] right-[-10px]"
                  variant="disabled"
                  className="w-full md:w-auto"
                >
                  <Typography size="base" weight="normal">
                    Leveraged Yield
                  </Typography>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Column */}
            <div className="hidden md:block md:col-span-2" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-9 px-4 md:px-0">
            <StatCard
              value="4,232,090,563"
              label="Total Deposits"
              iconUrl="/images/landing/hero/coin-stack.webm"
              isVideo={true}
            />
            <StatCard
              value="4,232,090,563"
              label="Total Borrows"
              iconUrl="/images/landing/hero/saving-piggy.webm"
              isVideo={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
