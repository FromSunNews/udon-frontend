'use client';

import { ConnectKitButton, Avatar } from 'connectkit';
import { ChevronDown, UserIcon } from 'lucide-react';

import { Button } from '@/components/common/button';
import { WalletActions } from './components/wallet-actions';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { Dialog, DialogContent, DialogTrigger } from '@/components/common/dialog';
import { useRef } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ConnectedButtonProps {
  className?: string;
  address?: `0x${string}`;
  ensName?: string;
}

function ConnectedButton({ className, ensName }: ConnectedButtonProps) {
  const { account } = useChromiaAccount();
  const truncatedAddress = account?.id.toString('hex')
    ? `${account?.id.toString('hex').toUpperCase().slice(0, 6)}...${account?.id.toString('hex').toUpperCase().slice(-4)}`
    : '';

  return (
    <Button
      variant="outlineGradient"
      className={`group py-5 !gap-2 px-6 border hover:shadow-md ${className}`}
    >
      <div className="relative flex h-7 w-7 items-center justify-center">
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/20">
          <Avatar
            address={`${account?.id.toString('hex')}` as `0x${string}`}
            name={ensName || undefined}
            size={24}
          />
        </div>
      </div>
      <span className="text-base ">{ensName || truncatedAddress}</span>
      <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground/70 transition-all group-hover:text-primary" />
    </Button>
  );
}

export function ConnectWallet() {
  const { account } = useChromiaAccount();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleClose = () => {
    if (closeButtonRef.current) {
      closeButtonRef.current.click();
    }
  };

  if (!account?.id.toString('hex')) {
    return <></>;
  }

  return (
    <ConnectKitButton.Custom>
      {({ show, isConnected, isConnecting, ensName, address }) => {
        if (isConnected) {
          return (
            <Dialog>
              <DialogTrigger asChild>
                {!isMobile ? (
                  <div>
                    <ConnectedButton className="w-full" address={address} ensName={ensName} />
                  </div>
                ) : (
                  <Button
                    variant="outlineGradient"
                    className={`!h-9 !w-9 border p-0 m-0 rounded-md bg-white/20 hover:shadow-md`}
                  >
                    {/* User icon */}
                    <UserIcon className="h-6 w-6 text-submerged" />
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] p-0" showCloseButton={false}>
                {/* <DialogClose ref={closeButtonRef} className="hidden" /> */}
                <WalletActions onClose={handleClose} />
              </DialogContent>
            </Dialog>
          );
        }

        return (
          <Button
            variant="default"
            size="default"
            onClick={show}
            disabled={isConnecting}
            className="group relative min-w-44 overflow-hidden bg-gradient-to-r from-primary via-primary to-primary hover:shadow-lg hover:shadow-primary/20 disabled:opacity-70"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform group-hover:translate-x-full"></div>
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <span className="font-medium tracking-tight">Connecting...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 font-medium tracking-tight">
                Connect Wallet
              </span>
            )}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
