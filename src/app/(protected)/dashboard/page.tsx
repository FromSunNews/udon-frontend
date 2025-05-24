'use client';

import { Typography } from '@/components/common/typography';
import { StatCard } from './components/stat-card';
import { SupplyTable } from './components/supply';
import { BorrowTable } from './components/borrow';
import { SupplyPositionTable } from './components/supply/position';
import { BorrowPositionTable } from './components/borrow/position';
import { useCompletedAssets } from '@/hooks/contracts/queries/use-completed-assets';

export default function DashboardPage() {
  // Use the enhanced custom hook to get all data
  const {
    assets: processedAssets,
    supplyPositions,
    borrowPositions,
    totalDeposit,
    totalBorrow,
    isLoading,
    refresh: refetchAssets,
    yourSupplyBalancePosition,
    yourSupplyCollateralPosition,
    yourSupplyAPYPosition,
    yourBorrowBalancePosition,
    yourBorrowPowerUsagePosition,
    yourBorrowAPYPosition,
    enableBorrow,
    availableLiquidityTokens,
  } = useCompletedAssets();

  return (
    <main className="px-8 py-[180px]">
      <section className="flex flex-col items-center gap-2 sm:gap-2.5">
        <div
          dangerouslySetInnerHTML={{
            __html: `<svg id="384:1283" width="152" height="36" viewBox="0 0 152 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="title-icon w-32 h-8 sm:w-40 sm:h-10" style="max-width: 152px"> <circle cx="18" cy="18" r="17.5" stroke="currentColor"></circle> <circle cx="47" cy="18" r="17.5" stroke="currentColor"></circle> <circle cx="76" cy="18" r="17.5" stroke="currentColor"></circle> <circle cx="105" cy="18" r="17.5" stroke="currentColor"></circle> <circle cx="134" cy="18" r="17.5" stroke="currentColor"></circle> </svg>`,
          }}
          className="mb-2 text-foreground"
        />
        <Typography
          variant="h2"
          weight="normal"
          align="center"
          className="text-2xl sm:text-3xl md:text-[40px] font-light"
        >
          Streamline your
        </Typography>
        <Typography
          variant="h2"
          weight="normal"
          align="center"
          className="text-2xl sm:text-3xl md:text-[40px] font-light"
        >
          crypto investment on Chromia
        </Typography>
      </section>

      <section className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-6 sm:mt-10">
        <StatCard
          value={totalDeposit}
          label="Total Deposit"
          iconUrl="/images/supply/coin-stack.gif"
          isLoading={isLoading}
        />
        <StatCard
          value={totalBorrow}
          label="Total Borrows"
          iconUrl="/images/supply/saving-piggy.gif"
          isLoading={isLoading}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-6 sm:mt-10 p-4 border border-solid rounded-3xl border-border">
        <SupplyPositionTable
          yourSupplyBalancePosition={yourSupplyBalancePosition}
          yourSupplyCollateralPosition={yourSupplyCollateralPosition}
          yourSupplyAPYPosition={yourSupplyAPYPosition}
          positions={supplyPositions}
          isLoading={isLoading}
          mutateAssets={refetchAssets}
        />
        <BorrowPositionTable
          yourBorrowBalancePosition={yourBorrowBalancePosition}
          yourBorrowPowerUsagePosition={yourBorrowPowerUsagePosition}
          yourBorrowAPYPosition={yourBorrowAPYPosition}
          positions={borrowPositions}
          isLoading={isLoading}
          mutateAssets={refetchAssets}
          enableBorrow={enableBorrow}
          availableLiquidityTokens={availableLiquidityTokens}
        />
        <SupplyTable
          title="Assets to supply"
          reserves={processedAssets}
          isLoading={isLoading}
          mutateAssets={refetchAssets}
        />
        <BorrowTable
          title="Assets to borrow"
          reserves={processedAssets}
          isLoading={isLoading}
          mutateAssets={refetchAssets}
          enableBorrow={enableBorrow}
          availableLiquidityTokens={availableLiquidityTokens}
        />
      </section>
    </main>
  );
}
