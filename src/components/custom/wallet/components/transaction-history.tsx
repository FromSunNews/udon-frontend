'use client';

import { ArrowUpRight, ArrowDownRight, HandCoins, Banknote, HelpCircle } from 'lucide-react';
import { useTransferHistory } from '@/hooks/contracts/queries/use-tranfer-history';
import { getTxLink } from '@/utils/get-tx-link';
import React from 'react';
import { cn } from '@/utils/tailwind';
import { formatRay } from '@/utils/wadraymath';
import CountUp from '@/components/common/count-up';

interface TransactionHistoryProps {
  compact?: boolean;
  fullList?: boolean;
  onViewAll?: () => void;
  className?: string;
}

function getTxTypeInfo(operationName: string) {
  const op = operationName.toLowerCase();
  if (op.includes('supply')) {
    return {
      label: 'Supply',
      icon: <Banknote className="h-7 w-7 text-red-500" />,
      color: 'text-red-500',
      amountColor: 'text-red-500',
    };
  }
  if (op.includes('withdraw')) {
    return {
      label: 'Withdraw',
      icon: <ArrowDownRight className="h-7 w-7 text-green-500" />,
      color: 'text-green-500',
      amountColor: 'text-green-500',
    };
  }
  if (op.includes('borrow')) {
    return {
      label: 'Borrow',
      icon: <HandCoins className="h-7 w-7 text-green-500" />,
      color: 'text-green-500',
      amountColor: 'text-green-500',
    };
  }
  if (op.includes('repay')) {
    return {
      label: 'Repay',
      icon: <Banknote className="h-7 w-7 text-red-500" />,
      color: 'text-red-500',
      amountColor: 'text-red-500',
    };
  }
  if (op.includes('transfer')) {
    return {
      label: 'Transfer',
      icon: <ArrowUpRight className="h-7 w-7 text-red-500" />,
      color: 'text-red-500',
      amountColor: 'text-red-500',
    };
  }
  return {
    label: op,
    icon: <HelpCircle className="h-7 w-7 text-gray-400" />,
    color: 'text-gray-400',
    amountColor: 'text-gray-400',
  };
}

export function TransactionHistory({
  compact = false,
  fullList = false,
  onViewAll,
  className,
}: TransactionHistoryProps) {
  const { transfers, isLoading } = useTransferHistory();
  const showCompact = compact && !fullList;
  const displayTransfers = showCompact ? (transfers || []).slice(0, 3) : transfers || [];
  const hasMore = showCompact && (transfers?.length || 0) > 1;

  // Function to truncate string (like hex address)
  const truncateHash = (hash: string, startChars = 6, endChars = 3) => {
    if (!hash) return '';
    if (hash.length <= startChars + endChars) return hash;
    return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
  };

  return (
    <div
      className={cn(
        'w-full flex flex-col h-auto rounded-2xl',
        !fullList && 'bg-card',
        !fullList && 'p-4',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        {!fullList && (
          <h3 className="text-md text-submerged font-semibold">
            Your Activity{transfers?.length ? ` (${transfers.length})` : ''}
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
        {isLoading && (
          <div className="absolute right-0 top-0">
            <div className="h-3 w-3 rounded-full border-2 border-primary/60 border-t-transparent animate-spin"></div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {displayTransfers && displayTransfers.length > 0 ? (
            <div className={cn('flex flex-col gap-4', fullList && 'pb-[120px]')}>
              {displayTransfers.map((transfer, index) => {
                console.log(transfer);
                const transactionHash = transfer?.transactionId?.toString('hex') || '';
                const txType = getTxTypeInfo(transfer.operationName || '');
                // Format amount using decimals
                const symbol = transfer.asset?.symbol ?? '';
                const value = formatRay(transfer.delta.value);
                const numericValue = Number(value);
                // Show sign for positive/negative
                const isPositive = numericValue > 0;
                return (
                  <>
                    {(index > 0 || !fullList) && (
                      <div className="flex items-center gap-2 h-[1px] w-full bg-border/50 rounded-full" />
                    )}
                    <div
                      key={index}
                      className="relative py-1 flex items-center justify-between shadow-md "
                    >
                      {/* Icon */}
                      <div
                        className={`flex items-center justify-center rounded-full ${txType.color} min-w-[44px] min-h-[44px]`}
                      >
                        {txType.icon}
                      </div>
                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${txType.color}`}>
                            {txType.label}
                          </span>
                        </div>
                        <div className="flex row items-center gap-2 mt-1">
                          <span className="text-sm text-white/80 font-medium">
                            {truncateHash(transactionHash.toUpperCase())}
                          </span>
                          <a
                            href={getTxLink(transactionHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 -top-1 hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="inline h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6m5-3h3m0 0v3m0-3L10 14"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                      {/* Amount */}
                      <span className={`text-base font-bold ml-2 ${txType.amountColor}`}>
                        {isPositive ? '+' : '- '}
                        <CountUp
                          value={Math.abs(numericValue)}
                          decimals={6}
                          suffix={` ${symbol}`}
                          className={txType.amountColor}
                        />
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
