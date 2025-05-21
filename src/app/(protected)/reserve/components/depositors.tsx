import React from 'react';
import { depositorsData, transactionHistoryData } from '../data/mock-data';
import { SortableTable, ColumnDef } from '@/components/common/sortable-table';
import { Typography } from '@/components/common/typography';

export const VaultDepositors: React.FC = () => {
  // Define column configuration for Depositors Distribution table
  const depositorColumns: ColumnDef<(typeof depositorsData)[0]>[] = [
    {
      header: 'User',
      accessorKey: 'user',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-400"></div>
          <span>{row.user}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="ml-1"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>
      ),
    },
    {
      header: 'Supply Amount',
      accessorKey: 'supply',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex">
            <div className="h-6 w-6 rounded-full bg-gray-200 -mr-1"></div>
            <div className="h-6 w-6 rounded-full bg-gray-500"></div>
          </div>
          <span>{row.supply}</span>
          <span className="ml-1 px-2 py-0.5 rounded-md bg-[#333] text-xs">{row.supplyValue}%</span>
        </div>
      ),
    },
    {
      header: '% of Deposits',
      accessorKey: 'percentOfDeposits',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-500 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
          </div>
          <span>{row.percentOfDeposits}%</span>
        </div>
      ),
    },
  ];

  // Define column configuration for Transaction History table
  const transactionColumns: ColumnDef<(typeof transactionHistoryData)[0]>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      enableSorting: true,
    },
    {
      header: 'Type',
      accessorKey: 'type',
      enableSorting: true,
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-400"></div>
          <span>{row.amount}</span>
          <span className="text-xs text-gray-400 ml-1">{row.amountUSD}</span>
        </div>
      ),
    },
    {
      header: 'User',
      accessorKey: 'user',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-400"></div>
          <span>{row.user}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="ml-1"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>
      ),
    },
    {
      header: 'Hash',
      accessorKey: 'hash',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center">
          <span>{row.hash}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="ml-1"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mt-6 max-md:max-w-full flex flex-col gap-6">
      {/* Depositors Section */}
      <div className="space-y-4">
        <Typography className="text-submerged">Distribution</Typography>
        <SortableTable data={depositorsData} columns={depositorColumns} pageSize={5} />
      </div>

      {/* Transactions History Section */}
      <div className="space-y-4">
        <Typography className="text-submerged">Transactions History</Typography>
        <SortableTable data={transactionHistoryData} columns={transactionColumns} pageSize={6} />
      </div>
    </div>
  );
};
