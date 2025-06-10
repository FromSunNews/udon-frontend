'use client';

import React from 'react';
import { Typography } from '@/components/common/typography';
import { useReserveData } from '@/hooks/contracts/queries/use-reserve-data';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/common/skeleton';
import {
  SidePanel,
  VaultHeader,
  VaultOverview,
  // VaultAllocation,
  // VaultPerformance,
  // VaultRisk,
  // VaultDisclosures,
  // VaultDepositors,
} from '../components';
import { UserReserveData } from '../../dashboard/types';

export default function VaultPage() {
  const params = useParams();

  const { reserve, isLoading, error } = useReserveData(params.id as string);

  if (isLoading) {
    return (
      <div className="fcol items-center py-12 px-4 md:px-10 lg:pt-[140px] lg:pb-[100px] lg:px-[40px]">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-5">
            {/* Left column - Main content */}
            <main className="col-span-12 md:col-span-8 rounded-3xl">
              <div className="flex flex-col space-y-6">
                {/* Top long bar */}
                <div className="w-full">
                  <Skeleton className="h-20 w-full rounded-2xl bg-primary/10 border border-primary/10" />
                </div>

                {/* Four boxes in a row */}
                <div className="grid grid-cols-4 gap-3">
                  <Skeleton className="h-16 w-full rounded-2xl bg-primary/10 border border-primary/10" />
                  <Skeleton className="h-16 w-full rounded-2xl bg-primary/10 border border-primary/10" />
                  <Skeleton className="h-16 w-full rounded-2xl bg-primary/10 border border-primary/10" />
                  <Skeleton className="h-16 w-full rounded-2xl bg-primary/10 border border-primary/10" />
                </div>

                {/* Two medium boxes in a row */}
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full rounded-2xl bg-primary/10 border border-primary/10" />
                  <Skeleton className="h-16 w-full rounded-2xl bg-primary/10 border border-primary/10" />
                </div>

                {/* Large box at bottom */}
                <Skeleton className="h-[300px] w-full rounded-2xl bg-primary/10 border border-primary/10" />
                <Skeleton className="h-[300px] w-full rounded-2xl bg-primary/10 border border-primary/10" />
              </div>
            </main>

            {/* Right column - Side panel */}
            <aside className="col-span-12 md:col-span-4 rounded-3xl">
              <div className="flex flex-col space-y-6">
                {/* Top box */}
                <Skeleton className="h-[250px] w-full rounded-2xl bg-primary/10 border border-primary/10" />

                {/* Bottom box */}
                <Skeleton className="h-[250px] w-full rounded-2xl bg-primary/10 border border-primary/10" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Typography variant="h3" className="text-destructive">
          Error loading reserve data
        </Typography>
      </div>
    );
  }

  if (!reserve) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Typography variant="h3" className="text-destructive">
          Reserve not found
        </Typography>
      </div>
    );
  }

  return (
    <div className="fcol items-center py-12 px-4 md:px-10 lg:pt-[140px] lg:pb-[100px] lg:px-[40px]">
      <div className="w-full">
        <div className="grid grid-cols-12 gap-5">
          <main className="col-span-12 md:col-span-8">
            <div className="grow">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <>
                  <VaultHeader reserve={reserve as UserReserveData} />

                  {/* Overview Section */}
                  <section className="w-full mt-8 md:mt-10">
                    <Typography variant="h3" weight="medium" className="mb-4">
                      Overview
                    </Typography>
                    <VaultOverview reserve={reserve} />
                  </section>
                </>
              )}

              {/* Performance Section */}
              {/* <section className="w-full mt-8 md:mt-10">
                <Typography variant="h3" weight="medium" className="mb-4">
                  Performance
                </Typography>
                <VaultPerformance />
              </section> */}

              {/* Risk Section */}
              {/* <section className="w-full mt-8 md:mt-10">
                <Typography variant="h3" weight="medium" className="mb-4">
                  Risk
                </Typography>
                <VaultRisk />
              </section> */}

              {/* Disclosures Section */}
              {/* <section className="w-full mt-8 md:mt-10">
                <VaultDisclosures />
              </section> */}

              {/* Allocation History Section */}
              {/* <section className="w-full mt-8 md:mt-10">
                <Typography variant="h3" weight="medium" className="mb-4">
                  Allocation History
                </Typography>
                <VaultAllocation />
              </section> */}

              {/* Depositors Section */}
              {/* <section className="w-full mt-8 md:mt-10">
                <Typography variant="h3" weight="medium" className="mb-4">
                  Depositors
                </Typography>
                <VaultDepositors />
              </section> */}
            </div>
          </main>

          <aside className="col-span-12 md:col-span-4 md:sticky md:pt-36">
            {isLoading ? <Skeleton className="h-64 w-full" /> : <SidePanel reserve={reserve} />}
          </aside>
        </div>
      </div>
    </div>
  );
}
