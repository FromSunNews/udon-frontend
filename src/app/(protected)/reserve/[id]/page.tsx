'use client';

import React from 'react';
import { Typography } from '@/components/common/typography';
import {
  SidePanel,
  VaultAllocation,
  VaultHeader,
  VaultOverview,
  VaultPerformance,
  VaultRisk,
  VaultDisclosures,
  VaultDepositors,
} from '../components';

export default function VaultPage() {
  return (
    <div className="fcol items-center py-12 px-4 md:px-10 lg:pt-[140px] lg:pb-[100px] lg:px-[40px]">
      <div className="w-full">
        <div className="grid grid-cols-12 gap-5">
          <main className="col-span-12 md:col-span-8">
            <div className="grow">
              <VaultHeader />

              {/* Overview Section */}
              <section className="w-full mt-8 md:mt-10">
                <Typography variant="h3" weight="medium" className="mb-4">
                  Overview
                </Typography>
                <VaultOverview />
              </section>

              {/* Performance Section */}
              <section className="w-full mt-8 md:mt-10">
                <Typography variant="h3" weight="medium" className="mb-4">
                  Performance
                </Typography>
                <VaultPerformance />
              </section>

              {/* Risk Section */}
              <section className="w-full mt-8 md:mt-10">
                <Typography variant="h3" weight="medium" className="mb-4">
                  Risk
                </Typography>
                <VaultRisk />
              </section>

              {/* Disclosures Section */}
              <section className="w-full mt-8 md:mt-10">
                <VaultDisclosures />
              </section>

              {/* Allocation History Section */}
              <section className="w-full mt-8 md:mt-10">
                <Typography variant="h3" weight="medium" className="mb-4">
                  Allocation History
                </Typography>
                <VaultAllocation />
              </section>

              {/* Depositors Section */}
              <section className="w-full mt-8 md:mt-10">
                <Typography variant="h3" weight="medium" className="mb-4">
                  Depositors
                </Typography>
                <VaultDepositors />
              </section>
            </div>
          </main>

          <aside className="col-span-12 md:col-span-4 md:sticky md:pt-48">
            <SidePanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
