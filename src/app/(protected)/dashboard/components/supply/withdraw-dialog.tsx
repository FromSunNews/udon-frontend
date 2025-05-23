'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CircleX, Info } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { useAssetPrice } from '@/hooks/contracts/queries/use-asset-price';
import { useWithdraw } from '@/hooks/contracts/operations/use-withdraw';
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
import { UserReserveData } from '../../types';
import CountUp from '@/components/common/count-up';

const withdrawFormSchema = z.object({
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

type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;

export interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserve: UserReserveData;
  healthFactor?: number;
  mutateAssets: () => void;
}

// Create a debounced fetch function with lodash
const debouncedFn = debounce((callback: () => void) => {
  callback();
}, 1000);

export const WithdrawDialog: React.FC<WithdrawDialogProps> = ({
  open,
  onOpenChange,
  reserve,
  healthFactor = 1.0,
  mutateAssets,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(reserve.price);
  const [isRefetchEnabled, setIsRefetchEnabled] = useState(false);
  const [isUserWithdrawMax, setIsUserWithdrawMax] = useState(false);
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawFormSchema),
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

  // Use the withdraw hook
  const withdraw = useWithdraw({
    onSuccess: (result, params) => {
      console.log('Withdraw success:', { result, params });
      mutateAssets();
    },
    onError: (error, params) => {
      console.error('Withdraw error:', { error, params });
    },
  });

  // Handle price fetch with lodash debounce
  const handleFetchPrice = useCallback(() => {
    debouncedFn(() => {
      // Don't allow value > supply balance
      const valueWithBalance =
        Number(form.watch('amount')) > Number(reserve.currentATokenBalance)
          ? reserve.currentATokenBalance
          : form.watch('amount');
      const needToChangeValue = valueWithBalance !== form.watch('amount');
      if (needToChangeValue) {
        form.setValue('amount', valueWithBalance.toString());
      }
      setIsRefetchEnabled(true);
      fetchPrice();
    });
  }, [fetchPrice, form, reserve.currentATokenBalance]);

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
      return;
    }

    form.setValue('amount', value);

    if (value && parseFloat(value) > 0) {
      handleFetchPrice();
    }
  };

  const handleMaxAmount = () => {
    // Use supply balance as the max amount
    form.setValue('amount', reserve.currentATokenBalance.toString());
    setIsUserWithdrawMax(true);
    handleFetchPrice();
  };

  const onSubmit = async (data: WithdrawFormValues) => {
    try {
      const amount = Number(data.amount);

      // Final validation checks before submission
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid positive number');
        return;
      }

      const balance = Number(reserve.currentATokenBalance);
      if (amount > balance) {
        toast.error(
          `Amount exceeds your supply balance of ${reserve.currentATokenBalance} ${reserve.symbol}`
        );
        return;
      }

      setIsSubmitting(true);

      // Use the withdraw hook
      const withdrawResult = await withdraw({
        assetId: reserve.assetId,
        amount: data.amount,
        decimals: reserve.decimals,
        isUserWithdrawMax,
      });

      console.log('Withdraw submitted:', {
        amount: data.amount,
        result: withdrawResult,
      });

      if (withdrawResult.success) {
        toast.success(`Successfully withdrew ${data.amount} ${reserve.symbol}`);
        // Close dialog after successful operation
        onOpenChange(false);
      } else {
        toast.error(`Failed to withdraw: ${withdrawResult.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting withdraw:', error);
      toast.error('Failed to submit withdraw transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <TooltipProvider delayDuration={300}>
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-semibold">
                Withdraw {reserve.symbol}
              </DialogTitle>
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
                      max={reserve.currentATokenBalance}
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
                          }}
                          className="hover:opacity-70"
                        >
                          <CircleX className="h-6 w-6 text-embossed" />
                        </Button>
                      )}
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={reserve.iconUrl} alt={reserve.symbol} />
                        <AvatarFallback>{reserve.symbol.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-row items-center gap-1">
                        <span className="font-medium text-lg">{reserve.symbol}</span>
                      </div>
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
                      />
                    )}
                    <div
                      className="flex flex-row items-center gap-1 text-primary cursor-pointer"
                      onClick={handleMaxAmount}
                    >
                      <Typography>Supply balance</Typography>
                      <CountUp
                        value={reserve.currentATokenBalance}
                        className="font-bold"
                        decimals={6}
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
                  <Typography className="flex items-center gap-1">Remaining supply</Typography>
                  <Typography weight="medium">
                    <CountUp
                      value={reserve.currentATokenBalance - Number(form.watch('amount'))}
                      suffix={` ${reserve.symbol}`}
                      decimals={6}
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
                  <Typography
                    weight="medium"
                    className={healthFactor >= 1.0 ? 'text-amber-500' : 'text-red-500'}
                  >
                    <CountUp value={healthFactor} decimals={2} />
                  </Typography>
                </div>

                {/* <div className="text-sm text-muted-foreground">
                  <Typography>Liquidation at &lt;1.0</Typography>
                </div> */}

                <div className="flex justify-between items-center">
                  <Typography className="flex items-center gap-1">Withdraw amount</Typography>
                  <div className="font-medium text-base">
                    <CountUp
                      value={Number(form.watch('amount'))}
                      suffix={` ${reserve.symbol}`}
                      decimals={6}
                    />
                    ~{' '}
                    {isPriceFetching ? (
                      <Skeleton className="inline-block h-5 w-20" />
                    ) : (
                      <CountUp
                        value={(currentPrice || 0) * Number(form.watch('amount'))}
                        prefix="$"
                        className="text-base"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {isSubmitting ? (
                <Button disabled className="w-full bg-muted text-muted-foreground text-lg py-6">
                  Processing...
                </Button>
              ) : !form.watch('amount') || parseFloat(form.watch('amount')) === 0 ? (
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
                  Withdraw {reserve.symbol}
                </Button>
              )}
            </div>
          </form>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};
