'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CircleX, Info, ChevronDown } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { useAssetPrice } from '@/hooks/contracts/queries/use-asset-price';
import { useRepay } from '@/hooks/contracts/operations/use-repay';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/dialog';
import { Button } from '@/components/common/button';
import { Typography } from '@/components/common/typography';
import { Input } from '@/components/common/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import { Skeleton } from '@/components/common/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import { UserReserveData } from '../../types';
import CountUp from '@/components/common/count-up';

const repayFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required!')
    .refine(
      val => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      {
        message: 'Please enter a valid positive number',
      }
    ),
});

type RepayFormValues = z.infer<typeof repayFormSchema>;

export interface RepayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserve: UserReserveData;
  debtBalance?: string;
  walletBalance?: string;
  healthFactor?: number;
  mutateAssets: () => void;
}

// Create a debounced fetch function with lodash
const debouncedFn = debounce((callback: () => void) => {
  callback();
}, 1000);

export const RepayDialog: React.FC<RepayDialogProps> = ({
  open,
  onOpenChange,
  reserve,
  debtBalance = '0.001',
  walletBalance = '0.0021429',
  healthFactor = 4.91,
  mutateAssets,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(reserve.price);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [isRefetchEnabled, setIsRefetchEnabled] = useState(false);
  const [repaySource, setRepaySource] = useState<'wallet' | 'collateral'>('wallet');

  const form = useForm<RepayFormValues>({
    resolver: zodResolver(repayFormSchema),
    defaultValues: {
      amount: '',
    },
  });

  // Use the asset price hook with TanStack Query
  const {
    data: priceData,
    isLoading: isPriceFetching,
    refetch: fetchPrice,
  } = useAssetPrice(reserve.assetId, isRefetchEnabled);

  // Use the repay hook
  const repay = useRepay({
    onSuccess: (result, params) => {
      console.log('Repay success:', { result, params });
      mutateAssets();
    },
    onError: (error, params) => {
      console.error('Repay error:', { error, params });
    },
  });

  // Handle price fetch with lodash debounce
  const handleFetchPrice = useCallback(() => {
    debouncedFn(() => {
      // Don't allow value > max amount based on source
      const maxAmount = repaySource === 'wallet' ? walletBalance : debtBalance;
      const valueWithBalance =
        Number(form.watch('amount')) > Number(maxAmount) ? maxAmount : form.watch('amount');
      const needToChangeValue = valueWithBalance !== form.watch('amount');
      if (needToChangeValue) {
        form.setValue('amount', valueWithBalance.toString());
        setInputAmount(valueWithBalance.toString());
      }
      setIsRefetchEnabled(true);
      fetchPrice();
    });
  }, [fetchPrice, form, walletBalance, debtBalance, repaySource]);

  // Update price when data is fetched
  useEffect(() => {
    if (priceData !== null && priceData !== undefined) {
      setCurrentPrice(priceData);
      // Disable refetching to prevent unnecessary calls
      setIsRefetchEnabled(false);
    }
  }, [priceData]);

  // Initialize with asset price
  useEffect(() => {
    setCurrentPrice(reserve.price);
  }, [reserve.price]);

  // Watch for input changes and fetch price
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow numbers and a single decimal point
    const regex = /^$|^[0-9]+\.?[0-9]*$/;
    if (!regex.test(value)) {
      // if don't pass set input with 0
      form.setValue('amount', '0');
      setInputAmount('0');
      return;
    }

    form.setValue('amount', value);
    setInputAmount(value);

    if (value && parseFloat(value) > 0) {
      handleFetchPrice();
    }
  };

  const handleMaxAmount = () => {
    // Use the appropriate maximum based on the repayment source
    const maxAmount = repaySource === 'wallet' ? walletBalance : debtBalance;
    form.setValue('amount', maxAmount);
    setInputAmount(maxAmount);
    handleFetchPrice();
  };

  const onSubmit = async (data: RepayFormValues) => {
    try {
      const amount = Number(data.amount);

      // Final validation checks before submission
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid positive number');
        return;
      }

      // Check if amount exceeds max based on source
      const maxAmount = repaySource === 'wallet' ? walletBalance : debtBalance;
      if (amount > Number(maxAmount)) {
        toast.error(
          `Amount exceeds your ${repaySource === 'wallet' ? 'wallet' : 'debt'} balance of ${maxAmount} ${reserve.symbol}`
        );
        return;
      }

      setIsSubmitting(true);

      // Use the repay hook
      const repayResult = await repay({
        assetId: reserve.assetId,
        amount: data.amount,
        decimals: reserve.decimals,
        useWalletBalance: repaySource === 'wallet',
      });

      console.log('Repay submitted:', {
        amount: data.amount,
        source: repaySource,
        result: repayResult,
      });

      if (repayResult.success) {
        toast.success(`Successfully repaid ${data.amount} ${reserve.symbol}`);
        // Close dialog after successful operation
        onOpenChange(false);
      } else {
        toast.error(`Failed to repay: ${repayResult.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting repay:', error);
      toast.error('Failed to submit repay transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate remaining debt after repayment
  const remainingDebt = Math.max(
    0,
    parseFloat(debtBalance) - parseFloat(inputAmount || '0')
  ).toFixed(7);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <TooltipProvider delayDuration={300}>
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-semibold">Repay {reserve.symbol}</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Typography className="flex items-center gap-1">Amount</Typography>
                </div>

                <div className="border px-3 py-2 rounded-lg">
                  <div className="relative">
                    <Input
                      {...form.register('amount')}
                      autoComplete="off"
                      placeholder="0.00"
                      className="p-0 text-xl font-medium placeholder:text-submerged focus-visible:ring-tranparent focus-visible:outline-none focus-visible:ring-0 w-[60%]"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      min={0.0}
                      max={repaySource === 'wallet' ? walletBalance : debtBalance}
                      step="any"
                      onChange={handleAmountChange}
                    />
                    <div className="flex items-center gap-2 absolute right-0 top-1/2 -translate-y-1/2">
                      {/* clear icon */}
                      {form.watch('amount') && (
                        <Button
                          variant="none"
                          size="icon"
                          onClick={() => {
                            form.setValue('amount', '');
                            setInputAmount('');
                          }}
                          className="hover:opacity-70"
                        >
                          <CircleX className="h-6 w-6 text-embossed" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="flex items-center gap-1.5 px-2 py-1">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={reserve.iconUrl} alt={reserve.symbol} />
                              <AvatarFallback>{reserve.symbol.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-row items-center gap-1">
                              <span className="font-medium text-lg">{reserve.symbol}</span>
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[180px]">
                          <DropdownMenuItem onClick={() => setRepaySource('wallet')}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={reserve.iconUrl} alt={reserve.symbol} />
                                <AvatarFallback>{reserve.symbol.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{reserve.symbol}</span>
                                <span className="text-xs text-muted-foreground">
                                  Wallet balance
                                </span>
                              </div>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRepaySource('collateral')}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={reserve.iconUrl} alt={`a${reserve.symbol}`} />
                                <AvatarFallback>a{reserve.symbol.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">a{reserve.symbol}</span>
                                <span className="text-xs text-muted-foreground">Collateral</span>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-base">
                    {isPriceFetching ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <CountUp
                        value={(currentPrice || 0) * Number(form.watch('amount'))}
                        prefix="$"
                        className="text-base"
                        animateOnlyOnce={true}
                      />
                    )}
                    <div
                      className="flex flex-row items-center gap-1 text-primary cursor-pointer"
                      onClick={handleMaxAmount}
                    >
                      <Typography>
                        {repaySource === 'wallet' ? `Wallet balance` : `Debt balance`}
                      </Typography>
                      <CountUp
                        value={
                          repaySource === 'wallet' ? Number(walletBalance) : Number(debtBalance)
                        }
                        className="font-bold"
                        animateOnlyOnce={true}
                      />
                      <Typography className="font-bold text-primary">MAX</Typography>
                    </div>
                  </div>
                </div>

                {form.formState.errors.amount && (
                  <Typography className="text-destructive">
                    {form.formState.errors.amount.message}
                  </Typography>
                )}
              </div>

              <div className="space-y-4">
                <Typography weight="semibold" className="text-lg">
                  Transaction overview
                </Typography>

                <div className="flex justify-between items-center">
                  <Typography className="flex items-center gap-1">Remaining debt</Typography>
                  <div className="flex items-center">
                    <Typography weight="medium">
                      <CountUp
                        value={Number(remainingDebt)}
                        suffix={` ${reserve.symbol}`}
                        animateOnlyOnce={true}
                      />
                    </Typography>
                  </div>
                </div>
                <div className="flex justify-between items-center text-muted-foreground text-sm">
                  <div></div>
                  <Typography>
                    <CountUp
                      value={parseFloat(remainingDebt) * (currentPrice || 0)}
                      prefix="$"
                      animateOnlyOnce={true}
                    />
                  </Typography>
                </div>

                <div className="flex justify-between items-center">
                  <Typography className="flex items-center gap-1">
                    Health factor
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Liquidation occurs when health factor is below 1.0</p>
                      </TooltipContent>
                    </Tooltip>
                  </Typography>
                  <Typography weight="medium" className="text-green-500">
                    <CountUp value={healthFactor} decimals={2} animateOnlyOnce={true} />
                  </Typography>
                </div>

                <div className="text-sm text-muted-foreground">
                  <Typography>Liquidation at &lt;1.0</Typography>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {isSubmitting ? (
                <Button disabled className="w-full bg-muted text-muted-foreground text-lg py-6">
                  Processing...
                </Button>
              ) : !inputAmount || parseFloat(inputAmount) === 0 ? (
                <Button disabled className="w-full text-lg py-6">
                  Enter an amount
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  type="submit"
                  className="w-full text-lg py-6"
                  disabled={!form.watch('amount')}
                >
                  Repay {reserve.symbol}
                </Button>
              )}
            </div>
          </form>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};
