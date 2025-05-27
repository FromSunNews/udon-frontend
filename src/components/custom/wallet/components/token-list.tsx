'use client';

import { Balance } from '@chromia/ft4';
import { useTokenBalance } from '@/hooks/contracts/queries/use-token-balance';
import { useTokenPrices } from '@/hooks/contracts/queries/use-token-prices';
import Image from 'next/image';
import React from 'react';
import { cn } from '@/utils/tailwind';
import CountUp from '@/components/common/count-up';
import { normalizeBN } from '@/utils/bignumber';

// Extend the Balance type with additional properties

interface TokenListProps {
  compact?: boolean;
  fullList?: boolean;
  onViewAll?: () => void;
  className?: string;
}

export function TokenList({
  compact = false,
  fullList = false,
  onViewAll,
  className,
}: TokenListProps) {
  const { balances, isLoading: isLoadingBalances } = useTokenBalance();
  // Use the new hook to get token prices
  const { prices, isLoading: isLoadingPrices } = useTokenPrices(balances);

  const showCompact = compact && !fullList;
  const displayBalances = showCompact ? balances.slice(0, 3) : balances;
  const hasMore = showCompact && balances.length > 1;

  // Helper function to calculate USD value
  const calculateUsdValue = (balance: Balance) => {
    const tokenBalance = Number(
      normalizeBN(balance.amount.value.toString(), balance.asset.decimals)
    );
    const price = prices[balance.asset.symbol] || 0;
    return tokenBalance * price;
  };

  return (
    <div
      className={cn(
        'w-full flex flex-col rounded-2xl',
        !fullList && 'bg-card',
        !fullList && 'p-4',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        {!fullList && (
          <h3 className="text-md text-submerged font-semibold">
            Your Assets{balances.length ? ` (${balances.length})` : ''}
          </h3>
        )}
        {showCompact && hasMore && (
          <button
            className="text-base text-embossed font-medium hover:underline focus:outline-none hover:text-primary cursor-pointer"
            onClick={onViewAll}
          >
            View all
          </button>
        )}
      </div>

      <div className="relative flex-1 flex flex-col">
        {(isLoadingBalances || isLoadingPrices) && (
          <div className="absolute right-0 top-0">
            <div className="h-3 w-3 rounded-full border-2 border-primary/60 border-t-transparent animate-spin"></div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {displayBalances.length > 0 ? (
            <div className={cn('flex flex-col gap-4', fullList && 'pb-[120px]')}>
              {displayBalances.map((balance, index) => {
                const tokenBalance = balance as unknown as Balance;
                const usdValue = calculateUsdValue(tokenBalance);
                const formattedBalance = Number(
                  normalizeBN(tokenBalance.amount.value.toString(), tokenBalance.asset.decimals)
                );

                console.log(
                  'tokenBalance.amount.value.toString() ' + tokenBalance.amount.value.toString()
                );
                console.log('tokenBalance.asset.decimals ' + tokenBalance.asset.decimals);
                console.log('formattedBalance ' + tokenBalance.asset.name, formattedBalance);

                return (
                  <>
                    {(index > 0 || !fullList) && (
                      <div className="flex items-center gap-2 h-[1px] w-full bg-border/50 rounded-full" />
                    )}
                    <div
                      key={index}
                      className="relative py-1 flex items-center justify-between shadow-md "
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          <Image
                            src={tokenBalance.asset.iconUrl}
                            alt={tokenBalance.asset.symbol}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-semibold text-embossed">
                            {tokenBalance.asset.name}
                          </span>
                          <span className="text-base text-embossed font-bold">
                            <CountUp value={formattedBalance} decimals={6} />
                          </span>
                          <span className="text-sm text-embossed font-medium">
                            {tokenBalance.asset.symbol.replace(/USD$/, '')}
                          </span>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-500">
                        {isLoadingPrices ? (
                          <span className="inline-block w-16 h-6 bg-secondary/30 rounded-md animate-pulse"></span>
                        ) : (
                          <CountUp
                            value={usdValue}
                            prefix="$"
                            decimals={2}
                            className="text-base text-green-500"
                          />
                        )}
                      </span>
                    </div>
                  </>
                );
              })}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/30 via-secondary/50 to-secondary/30 p-4 shadow-sm backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
              <div className="relative text-center">
                <p className="text-sm text-muted-foreground">Nothing found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
