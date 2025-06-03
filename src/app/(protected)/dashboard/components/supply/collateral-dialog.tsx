'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { useCollateral } from '@/hooks/contracts/operations/use-collateral';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/dialog';
import { Button } from '@/components/common/button';
import { Typography } from '@/components/common/typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/common/alert';
import { toast } from 'sonner';
import { UserReserveData, UserAccountData } from '../../types';
import { calculateHFAfterCallUsageAsCollateral } from '@/utils/hf';
import { normalize, normalizeBN, valueToBigNumber } from '@/utils/bignumber';

interface CollateralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserve: UserReserveData;
  accountData: UserAccountData;
  mutateAssets: () => void;
}

export const CollateralDialog: React.FC<CollateralDialogProps> = ({
  open,
  onOpenChange,
  reserve,
  accountData,
  mutateAssets,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedHealthFactor, setCalculatedHealthFactor] = useState<number>(-1);

  const collateral = useCollateral({
    onSuccess: () => {
      mutateAssets();
      onOpenChange(false);
    },
  });

  // Calculate health factor after changing collateral status
  const calculateHealthFactor = useCallback(() => {
    if (accountData.healthFactor === -1) {
      setCalculatedHealthFactor(-1);
      return;
    }

    // Get the asset value in base currency
    const assetCollateralValue = valueToBigNumber(
      normalize(reserve.price.toString(), 18)
    ).multipliedBy(valueToBigNumber(reserve.currentATokenBalance));

    const hf = calculateHFAfterCallUsageAsCollateral(
      valueToBigNumber(accountData.totalCollateralBase.toString()),
      assetCollateralValue,
      valueToBigNumber((Number(accountData.currentLiquidationThreshold) / 100).toString()),
      valueToBigNumber(reserve.liquidationThreshold.toString()),
      valueToBigNumber(accountData.totalDebtBase.toString()),
      valueToBigNumber(accountData.healthFactor.toString()),
      reserve.usageAsCollateralEnabled
    );

    console.log('hf after collateral change', hf.toString());
    setCalculatedHealthFactor(Number(hf));
  }, [accountData, reserve]);

  // Calculate health factor when dialog opens
  useEffect(() => {
    if (open) {
      calculateHealthFactor();
    }
  }, [open, calculateHealthFactor]);

  // Logic: If disabling and newHealthFactor < 1, block action
  const willCauseLiquidation = calculatedHealthFactor < 1;

  const currentHealthFactor =
    accountData.healthFactor === -1
      ? -1
      : normalizeBN(valueToBigNumber(accountData.healthFactor.toString()), 18);

  const handleAction = async () => {
    setIsSubmitting(true);

    try {
      const collateralResult = await collateral({
        assetId: reserve.assetId,
        useAsCollateral: !reserve.usageAsCollateralEnabled,
      });

      console.log('collateralResult submitted:', {
        result: collateralResult,
      });

      if (collateralResult.success) {
        toast.success(
          `Successfully ${reserve.usageAsCollateralEnabled ? 'disable' : 'enable'} usage as collateral of ${reserve.symbol} `
        );
        // Close dialog after successful operation
        onOpenChange(false);
      } else {
        toast.error(
          `Failed to set usage as collateral: ${collateralResult.error?.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error submitting supply:', error);
      toast.error('Failed to submit supply transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Review tx {reserve.symbol}</DialogTitle>
        </DialogHeader>
        {/* Alert */}
        <Alert variant="warning">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base">Attention</AlertTitle>
          <AlertDescription className="text-sm">
            Disabling this asset as collateral affects your borrowing power and Health Factor.
          </AlertDescription>
        </Alert>
        <div className="mb-4">
          <Typography className="mb-2 text-muted-foreground">Transaction overview</Typography>
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Typography className="text-muted-foreground">Supply balance</Typography>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reserve.iconUrl} alt={reserve.symbol} />
                  <AvatarFallback>{reserve.symbol.charAt(0)}</AvatarFallback>
                </Avatar>
                <Typography weight="medium">
                  {reserve.currentATokenBalance} {reserve.symbol}
                </Typography>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Typography className="text-muted-foreground">Health factor</Typography>
              <Typography weight="medium">
                <span
                  className={
                    calculatedHealthFactor < Number(currentHealthFactor)
                      ? calculatedHealthFactor < 1
                        ? 'text-red-500'
                        : 'text-amber-500'
                      : 'text-green-500'
                  }
                >
                  {currentHealthFactor === -1 ? '∞' : Number(currentHealthFactor).toFixed(2)} →{' '}
                  {calculatedHealthFactor === -1 ? '∞' : calculatedHealthFactor.toFixed(2)}
                </span>
              </Typography>
            </div>
            <div className="text-xs text-muted-foreground">Liquidation at &lt;1.0</div>
          </div>
        </div>
        {willCauseLiquidation && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-base">Liquidation</AlertTitle>
            <AlertDescription className="text-sm">
              You can not switch usage as collateral mode for this currency, because it will cause
              collateral call.
            </AlertDescription>
          </Alert>
        )}
        <div className="mt-4">
          <Button
            variant="gradient"
            className="w-full text-lg py-6"
            disabled={isSubmitting || willCauseLiquidation}
            onClick={handleAction}
          >
            {reserve.usageAsCollateralEnabled
              ? `Disable ${reserve.symbol} as collateral`
              : `Enable ${reserve.symbol} as collateral`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
