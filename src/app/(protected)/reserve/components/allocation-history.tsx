// import React, { useState } from 'react';
// import { allocationHistoryChartData, allocationHistoryTableData } from '../data/mock-data';
// import { StackedAreaChart } from '../charts/stacked-area-chart';
// import { SortableTable, ColumnDef } from '@/components/common/sortable-table';
// import { Typography } from '@/components/common/typography';
// import { ChartFilters, ChartCard } from '../charts';
// import { cn } from '@/utils/tailwind';

// interface AllocationHistoryProps {
//   className?: string;
// }

// export const AllocationHistory: React.FC<AllocationHistoryProps> = ({ className }) => {
//   // Chart filter states
//   const [chartType, setChartType] = useState<'deposit' | 'borrow'>('deposit');
//   const [timePeriod, setTimePeriod] = useState<
//     'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
//   >('daily');

//   // Define table columns
//   const columns: ColumnDef<(typeof allocationHistoryTableData)[0]>[] = [
//     {
//       header: 'Timestamp',
//       accessorKey: 'timestamp',
//       enableSorting: true,
//     },
//     {
//       header: 'User',
//       accessorKey: 'user',
//       enableSorting: true,
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <div className="h-6 w-6 rounded-full bg-gray-400" />
//           <span>{row.user}</span>
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             className="ml-1"
//           >
//             <path d="M7 17L17 7" />
//             <path d="M7 7h10v10" />
//           </svg>
//         </div>
//       ),
//     },
//     {
//       header: 'Amount',
//       accessorKey: 'amount',
//       enableSorting: true,
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <div className="h-6 w-6 rounded-full bg-gray-400" />
//           <span>{row.amount}</span>
//           <span className="ml-1 px-2 py-0.5 rounded-md bg-[#333] text-xs">{row.amountValue}%</span>
//         </div>
//       ),
//     },
//     {
//       header: 'Market',
//       accessorKey: 'market',
//       enableSorting: true,
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <div className="flex">
//             <div className="h-6 w-6 rounded-full bg-white -mr-1" />
//             <div className="h-6 w-6 rounded-full bg-gray-500" />
//           </div>
//           <span>{row.market}</span>
//           <span className="ml-1 px-2 py-0.5 rounded-md bg-[#333] text-xs">{row.marketValue}%</span>
//         </div>
//       ),
//     },
//     {
//       header: 'Hash',
//       accessorKey: 'hash',
//       enableSorting: true,
//       cell: ({ row }) => (
//         <div className="flex items-center">
//           <span>{row.hash}</span>
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             className="ml-1"
//           >
//             <path d="M7 17L17 7" />
//             <path d="M7 7h10v10" />
//           </svg>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className={cn('w-full', className)}>
//       <div className="mb-6">
//         <Typography variant="h3" className="mb-4">
//           Allocation History
//         </Typography>

//         {/* Chart section */}
//         <div className="mb-8">
//           <ChartCard
//             title="Allocation Distribution"
//             value="4.55"
//             valueSuffix="%"
//             className="!pb-12"
//             filters={
//               <ChartFilters
//                 chartType={chartType}
//                 setChartType={setChartType}
//                 currency={currency}
//                 setCurrency={setCurrency}
//                 timePeriod={timePeriod}
//                 setTimePeriod={setTimePeriod}
//                 timeOptions={['1 week', '1 month', '3 months', '6 months', '1 year', 'All time']}
//               />
//             }
//           >
//             <StackedAreaChart data={allocationHistoryChartData} height={240} />
//           </ChartCard>
//         </div>

//         <SortableTable data={allocationHistoryTableData} columns={columns} pageSize={8} />
//       </div>
//     </div>
//   );
// };
