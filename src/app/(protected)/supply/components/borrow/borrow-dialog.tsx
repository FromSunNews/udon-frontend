'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { useAssetPrice } from '@/hooks/contracts/queries/use-asset-price';
import { useBorrow } from '@/hooks/contracts/operations/use-borrow';
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

const borrowFormSchema = z.object({
  amount: z.string().min(1, 'Amount is required!'),
});

type BorrowFormValues = z.infer<typeof borrowFormSchema>;

export interface BorrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: {
    id: Buffer<ArrayBufferLike>;
    symbol: string;
    name: string;
    iconUrl: string;
    available: string;
    maxAmount: number;
    apy: string;
    price?: number;
    decimals: number;
  };
  availableToBorrow?: string;
  healthFactor?: number;
  mutateAssets: () => void;
}

// Create a debounced fetch function with lodash
const debouncedFn = debounce((callback: () => void) => {
  callback();
}, 1000);

export const BorrowDialog: React.FC<BorrowDialogProps> = ({
  open,
  onOpenChange,
  asset,
  availableToBorrow = '1.0',
  healthFactor = 4.91,
  mutateAssets,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(asset.price);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [isRefetchEnabled, setIsRefetchEnabled] = useState(false);

  const form = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowFormSchema),
    defaultValues: {
      amount: '',
    },
  });

  // Use the asset price hook with TanStack Query
  const {
    data: priceData,
    isLoading: isPriceFetching,
    refetch: fetchPrice,
  } = useAssetPrice(asset.id, isRefetchEnabled);

  // Use the borrow hook
  const borrow = useBorrow({
    onSuccess: (result, params) => {
      console.log('Borrow success:', { result, params });
      mutateAssets();
    },
    onError: (error, params) => {
      console.error('Borrow error:', { error, params });
    },
  });

  // Handle price fetch with lodash debounce
  const handleFetchPrice = useCallback(() => {
    debouncedFn(() => {
      setIsRefetchEnabled(true);
      fetchPrice();
    });
  }, [fetchPrice]);

  // Update price when data is fetched
  useEffect(() => {
    if (priceData !== null && priceData !== undefined) {
      setCurrentPrice(priceData.price);
      // Disable refetching to prevent unnecessary calls
      setIsRefetchEnabled(false);
    }
  }, [priceData]);

  // Initialize with asset price
  useEffect(() => {
    setCurrentPrice(asset.price);
  }, [asset.price]);

  // Watch for input changes and fetch price
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('amount', value);
    setInputAmount(value);

    if (value && parseFloat(value) > 0) {
      handleFetchPrice();
    }
  };

  const handleMaxAmount = () => {
    form.setValue('amount', availableToBorrow);
    setInputAmount(availableToBorrow);
    handleFetchPrice();
  };

  const onSubmit = async (data: BorrowFormValues) => {
    setIsSubmitting(true);

    try {
      // Use the borrow hook
      const borrowResult = await borrow({
        assetId: asset.id,
        amount: data.amount,
        decimals: asset.decimals,
        interestRateMode: 2, // Variable rate
      });

      console.log('Borrow submitted:', {
        amount: data.amount,
        result: borrowResult,
      });

      if (borrowResult.success) {
        toast.success(`Successfully borrowed ${data.amount} ${asset.symbol}`);
        // Close dialog after successful operation
        onOpenChange(false);
      } else {
        toast.error(`Failed to borrow: ${borrowResult.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting borrow:', error);
      toast.error('Failed to submit borrow transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate USD amount based on current price if available
  const usdAmount = inputAmount
    ? `$${(parseFloat(inputAmount || '0') * (currentPrice || 0)).toFixed(2)}`
    : '$0';

  // Calculate new health factor after borrowing (simplified estimation)
  const newHealthFactor = Math.max(0, healthFactor - parseFloat(inputAmount || '0') * 0.2).toFixed(
    2
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <TooltipProvider delayDuration={300}>
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-semibold">Borrow {asset.symbol}</DialogTitle>
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
                      className="p-0 text-xl font-medium placeholder:text-submerged focus-visible:ring-tranparent focus-visible:outline-none focus-visible:ring-0"
                      inputMode="decimal"
                      onChange={handleAmountChange}
                    />
                    <div className="flex items-center gap-2 absolute right-3 top-1/2 -translate-y-1/2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={asset.iconUrl} alt={asset.symbol} />
                        <AvatarFallback>{asset.symbol.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-row items-center gap-1">
                        <span className="font-medium text-lg">{asset.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-base">
                    {isPriceFetching ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <Typography>{usdAmount}</Typography>
                    )}
                    <div
                      className="flex flex-row items-center gap-1 text-primary cursor-pointer"
                      onClick={handleMaxAmount}
                    >
                      <Typography>Available: {availableToBorrow}</Typography>
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
                    className={
                      parseFloat(newHealthFactor) >= 1.5
                        ? 'text-green-500'
                        : parseFloat(newHealthFactor) >= 1.0
                          ? 'text-amber-500'
                          : 'text-red-500'
                    }
                  >
                    {healthFactor.toFixed(2)} → {newHealthFactor}
                  </Typography>
                </div>

                <div className="text-sm text-muted-foreground">
                  <Typography>Liquidation at &lt;1.0</Typography>
                </div>

                <div className="flex justify-between items-center">
                  <Typography className="flex items-center gap-1">
                    Interest Rate (variable)
                  </Typography>
                  <Typography weight="medium">5.3%</Typography>
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
                  Borrow {asset.symbol}
                </Button>
              )}
            </div>
          </form>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};
