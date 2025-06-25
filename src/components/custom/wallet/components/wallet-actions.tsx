'use client';

import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';

import TransferForm from '../form/transfer-form';
import DepositForm from '../form/deposit-form';
import { ChromiaAccount } from './chromia-account';
import { TokenList } from './token-list';
import { TransactionHistory } from './transaction-history';
import { DialogClose } from '@/components/common/dialog';
import { Typography } from '@/components/common/typography';
import { cn } from '@/utils/tailwind';
import { useTokenBalance } from '@/hooks/contracts/queries/use-token-balance';
import { useTransferHistory } from '@/hooks/contracts/queries/use-tranfer-history';

interface WalletActionsProps {
  onClose?: () => void;
}

type WalletView = 'account' | 'transfer' | 'deposit' | 'viewAllAsset' | 'viewAllActivity';

function GlowingEffect() {
  return (
    <div className="absolute w-[120%] h-[20%] min-h-[150px] top-[-80px] left-1/2 -translate-x-1/2 bg-[#1fc3e8] rounded-[50%/50%] blur-[48.75px] opacity-60">
      <div className="absolute w-[90%] h-[85%] left-[5%] bg-[#1f6ce8] rounded-[50%/50%] blur-[20px] opacity-70">
        <div className="absolute w-[80%] h-[70%] top-[15%] left-[10%] bg-white rounded-[50%/50%] blur-[10px] opacity-50" />
      </div>
    </div>
  );
}

interface WalletHeaderProps {
  activeView: WalletView;
  onBack: () => void;
  assetCount?: number;
  activityCount?: number;
}

function WalletHeader({ activeView, onBack, assetCount, activityCount }: WalletHeaderProps) {
  let title = '';
  if (activeView === 'transfer') title = 'Transfer';
  else if (activeView === 'deposit') title = 'Deposit';
  else if (activeView === 'viewAllAsset')
    title = `Your Assets${assetCount !== undefined ? ` (${assetCount})` : ''}`;
  else if (activeView === 'viewAllActivity')
    title = `Your Activity${activityCount !== undefined ? ` (${activityCount})` : ''}`;
  else title = 'Wallet';

  return (
    <div className={cn('h-[60px] relative', activeView !== 'account' && 'border border-b bg-card')}>
      {activeView !== 'account' && (
        <div className="absolute top-4 left-6 z-10">
          <button onClick={onBack} className="cursor-pointer" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
      )}
      {activeView !== 'account' && (
        <Typography as="h4" className="text-xl absolute top-4 left-1/2 -translate-x-1/2">
          {title}
        </Typography>
      )}
      <DialogClose className="cursor-pointer absolute top-5 right-6 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X size={24} />
        <span className="sr-only">Close</span>
      </DialogClose>
    </div>
  );
}

function AccountView({
  onClose,
  onViewAllAsset,
  onViewAllActivity,
}: {
  onTransfer: () => void;
  onDeposit: () => void;
  onClose?: () => void;
  onViewAllAsset: () => void;
  onViewAllActivity: () => void;
}) {
  return (
    <div className="translate-x-0 opacity-100 transform transition-all duration-300 ease-in-out w-full h-[calc(90vh-60px)] flex flex-col overflow-y-auto pb-[120px]">
      {/* ChromiaAccount (auto height) */}
      <div className="px-6 pt-2">
        <ChromiaAccount onClose={onClose} />
      </div>
      {/* TokenList + TransactionHistory split remaining height */}
      <div className="flex-1 flex flex-col gap-10 w-full px-6 pb-2 pt-6">
        <TokenList compact onViewAll={onViewAllAsset} />
        <TransactionHistory compact onViewAll={onViewAllActivity} />
      </div>
    </div>
  );
}

function SlideView({
  isActive,
  children,
  direction = 'right',
}: {
  isActive: boolean;
  children: React.ReactNode;
  direction?: 'right' | 'left';
}) {
  // direction: right for account -> transfer/deposit, left for transfer/deposit -> account
  const base = 'absolute inset-0 opacity-0 pointer-events-none';
  const active = 'translate-x-0 opacity-100 pointer-events-auto';
  const inactive = direction === 'right' ? 'translate-x-full' : '-translate-x-full';
  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-in-out w-full h-[calc(90vh-60px)]',
        isActive ? active : `${base} ${inactive}`
      )}
    >
      {children}
    </div>
  );
}

function FullAssetView() {
  return (
    <div className="w-full h-[calc(90vh-60px)] px-6 pt-2 overflow-y-auto">
      <TokenList fullList />
    </div>
  );
}

function FullActivityView() {
  return (
    <div className="w-full h-[calc(90vh-60px)] px-6 pt-2 overflow-y-auto">
      <TransactionHistory fullList />
    </div>
  );
}

export function WalletActions({ onClose }: WalletActionsProps) {
  const [activeView, setActiveView] = useState<WalletView>('account');

  // Get asset and activity counts for header
  const { balances } = useTokenBalance();
  const { transfers } = useTransferHistory();

  const handleBack = () => setActiveView('account');
  const handleTransfer = () => setActiveView('transfer');
  const handleDeposit = () => setActiveView('deposit');
  const handleViewAllAsset = () => setActiveView('viewAllAsset');
  const handleViewAllActivity = () => setActiveView('viewAllActivity');

  return (
    <div className="relative overflow-hidden rounded-md w-full h-[90vh]">
      {activeView === 'account' && <GlowingEffect />}
      <WalletHeader
        activeView={activeView}
        onBack={handleBack}
        assetCount={balances?.length}
        activityCount={transfers?.length}
      />
      {/* Account Dashboard View */}
      {activeView === 'account' && (
        <AccountView
          onTransfer={handleTransfer}
          onDeposit={handleDeposit}
          onClose={onClose}
          onViewAllAsset={handleViewAllAsset}
          onViewAllActivity={handleViewAllActivity}
        />
      )}
      {/* Transfer Form View */}
      <SlideView isActive={activeView === 'transfer'} direction="left">
        <div className="relative w-full h-full space-y-4">
          <TransferForm onBack={handleBack} />
        </div>
      </SlideView>
      {/* Deposit Form View */}
      <SlideView isActive={activeView === 'deposit'} direction="left">
        <div className="relative w-full h-full space-y-4">
          <DepositForm onBack={handleBack} />
        </div>
      </SlideView>
      {/* Full Asset List View */}
      <SlideView isActive={activeView === 'viewAllAsset'} direction="right">
        <FullAssetView />
      </SlideView>
      {/* Full Activity List View */}
      <SlideView isActive={activeView === 'viewAllActivity'} direction="right">
        <FullActivityView />
      </SlideView>

      {/* {activeView === 'account' && (
        <DialogFooter className="absolute bottom-0 left-0 right-0 bg-[#1F1F1F] px-6 border-t border h-[70px]">
          <div className="w-full grid grid-cols-2 gap-3 py-4">
            <Button
              onClick={handleTransfer}
              className="w-full rounded-full py-5 font-medium text-base"
              variant="gradient"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transfer
            </Button>
            <Button
              onClick={handleDeposit}
              className="w-full rounded-full py-5 font-medium text-base"
              variant="outlineGradient"
            >
              <Wallet className="h-4 w-4 mr-2 text-embossed" />
              Deposit
            </Button>
          </div>
        </DialogFooter>
      )} */}
    </div>
  );
}
