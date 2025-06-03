'use client';

import { Typography } from '@/components/common/typography';
import { StatCard } from './components/stat-card';
import { SupplyTable } from './components/supply';
import { BorrowTable } from './components/borrow';
import { SupplyPositionTable } from './components/supply/position';
import { BorrowPositionTable } from './components/borrow/position';
import { useCompletedAssets } from '@/hooks/contracts/queries/use-completed-assets';
import { useStatsSupplyDeposit } from '@/hooks/contracts/queries/use-stats-supply-deposit';
import { useAccountData } from '@/hooks/contracts/queries/use-account-data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { MobilePositionTabs } from './components/mobile/mobile-position-tabs';
import { MobileAssetTabs } from './components/mobile/mobile-asset-tabs';

export default function DashboardPage() {
  // Use the enhanced custom hook to get all data
  const {
    assets: processedAssets,
    supplyPositions,
    borrowPositions,
    isLoading: isLoadingAssets,
    refresh: refetchAssets,
    yourSupplyBalancePosition,
    yourSupplyCollateralPosition,
    yourSupplyAPYPosition,
    yourBorrowBalancePosition,
    yourBorrowPowerUsagePosition,
    yourBorrowAPYPosition,
    enableBorrow,
  } = useCompletedAssets();

  const {
    totalValueDeposited,
    totalValueBorrowed,
    isLoading: isStatSupplyDepositFetching,
    refetch: refetchStatsSupplyDeposit,
  } = useStatsSupplyDeposit();

  const {
    data: accountData,
    isLoading: isAccountDataFetching,
    refetch: refetchAccountData,
  } = useAccountData();

  // Check if the current device is mobile
  const isMobile = useMediaQuery('(max-width: 768px)');

  const isLoadingTable = isLoadingAssets || isAccountDataFetching;

  const handleFetchData = () => {
    refetchAssets();
    refetchAccountData();
    refetchStatsSupplyDeposit();
  };

  return (
    <main className="px-4 sm:px-8 py-[100px] sm:py-[180px]">
      <section className="flex flex-col items-center gap-2 sm:gap-2.5 mb-10 sm:mb-0">
        <div
          dangerouslySetInnerHTML={{
            __html: `<svg id="384:1283" width="152" height="36" viewBox="0 0 152 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="title-icon w-40 h-10" style="max-width: 152px"> <circle cx="18" cy="18" r="17.5" stroke="currentColor"></circle> <circle cx="47" cy="18" r="17.5" stroke="currentColor"></circle> <circle cx="76" cy="18" r="17.5" stroke="currentColor"></circle> <circle cx="105" cy="18" r="17.5" stroke="currentColor"></circle> <circle cx="134" cy="18" r="17.5" stroke="currentColor"></circle> </svg>`,
          }}
          className="mb-2 text-foreground"
        />
        <Typography
          variant="h2"
          weight="normal"
          align="center"
          className="text-4xl sm:text-4xl md:text-[40px] font-light"
        >
          Streamline your
        </Typography>
        <Typography
          variant="h2"
          weight="normal"
          align="center"
          className="text-4xl sm:text-4xl md:text-[40px] font-light"
        >
          crypto investment on Chromia
        </Typography>
      </section>

      <section className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-6 sm:mt-10">
        <StatCard
          value={totalValueDeposited}
          label="Total Deposit"
          iconUrl="/images/supply/coin-stack.svg"
          isLoading={isStatSupplyDepositFetching}
          videoUrl="/images/supply/coin-stack.gif"
        />
        <StatCard
          value={totalValueBorrowed}
          label="Total Borrows"
          iconUrl="/images/supply/saving-piggy.svg"
          isLoading={isStatSupplyDepositFetching}
          videoUrl="/images/supply/saving-piggy.gif"
        />
      </section>

      {isMobile ? (
        <section className="flex flex-col gap-6 mt-6">
          <MobilePositionTabs
            supplyPositions={supplyPositions}
            borrowPositions={borrowPositions}
            isLoading={isLoadingTable}
            mutateAssets={refetchAssets}
            yourSupplyBalancePosition={yourSupplyBalancePosition}
            yourSupplyCollateralPosition={yourSupplyCollateralPosition}
            yourSupplyAPYPosition={yourSupplyAPYPosition}
            yourBorrowBalancePosition={yourBorrowBalancePosition}
            yourBorrowPowerUsagePosition={yourBorrowPowerUsagePosition}
            yourBorrowAPYPosition={yourBorrowAPYPosition}
            enableBorrow={enableBorrow}
            accountData={accountData}
          />

          <MobileAssetTabs
            processedAssets={processedAssets}
            isLoading={isLoadingTable}
            mutateAssets={refetchAssets}
            enableBorrow={enableBorrow}
            accountData={accountData}
          />
        </section>
      ) : (
        <section className="grid xl:grid-cols-2 gap-4 sm:gap-5 mt-6 sm:mt-10 p-4 border border-solid rounded-3xl border-border">
          <SupplyPositionTable
            yourSupplyBalancePosition={yourSupplyBalancePosition}
            yourSupplyCollateralPosition={yourSupplyCollateralPosition}
            yourSupplyAPYPosition={yourSupplyAPYPosition}
            positions={supplyPositions}
            isLoading={isLoadingTable}
            mutateAssets={handleFetchData}
            accountData={accountData}
          />
          <BorrowPositionTable
            yourBorrowBalancePosition={yourBorrowBalancePosition}
            yourBorrowPowerUsagePosition={yourBorrowPowerUsagePosition}
            yourBorrowAPYPosition={yourBorrowAPYPosition}
            positions={borrowPositions}
            isLoading={isLoadingTable}
            mutateAssets={handleFetchData}
            enableBorrow={enableBorrow}
            accountData={accountData}
          />
          <SupplyTable
            title="Assets to supply"
            reserves={processedAssets}
            isLoading={isLoadingTable}
            mutateAssets={handleFetchData}
            accountData={accountData}
          />
          <BorrowTable
            title="Assets to borrow"
            reserves={processedAssets}
            isLoading={isLoadingTable}
            mutateAssets={handleFetchData}
            enableBorrow={enableBorrow}
            accountData={accountData}
          />
        </section>
      )}
    </main>
  );
}
