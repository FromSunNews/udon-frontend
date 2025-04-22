'use client';

import React from 'react';
import Link from 'next/link';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { FlameIcon } from 'lucide-react';

import { Chr } from '@/components/chromia-ui-kit/icons';
import LinkButton from '@/components/chromia-ui-kit/link-button';
import { CardLoading } from '@/components/custom/card-loading';
import { Card, CardTitle } from '@/components/common/card';
import MintToken from '@/forms/mint-token';
import { useTokenBalance } from '@/hooks/use-token-balance';

export default function TokenPage() {
  const { balances, isLoading, refreshBalance } = useTokenBalance();
  const hasBalances = !!balances?.length;

  return (
    <div className="flex flex-1 items-center justify-center">
      {isLoading ? (
        <CardLoading />
      ) : !hasBalances ? (
        <Card className="w-full max-w-lg p-6">
          <CardTitle className="mb-4 text-center text-xl">Mint your own token</CardTitle>
          <MintToken
            onMinted={async () => {
              await refreshBalance();
            }}
          />
        </Card>
      ) : (
        <Card className="w-full max-w-lg space-y-6 overflow-visible px-10 pb-6">
          <Chr className="mx-auto -mt-10 h-20 w-20" />
          <div className="space-y-1">
            <h2 className="mb-1 text-center font-serif text-3xl font-bold text-white">
              {Intl.NumberFormat().format(balances[0].amount.value)}{' '}
              {balances[0].asset.symbol.toUpperCase()}
            </h2>
            <h3 className="text-center text-muted-foreground">{balances[0].asset.name}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-10">
            <Link href="/token/transfer" passHref legacyBehavior>
              <LinkButton variant="secondary">
                <PaperPlaneIcon />
                Transfer
              </LinkButton>
            </Link>
            <Link href="/token/burn" passHref legacyBehavior>
              <LinkButton variant="secondary">
                <FlameIcon />
                Burn
              </LinkButton>
            </Link>
          </div>
          <p className="rounded-xl bg-success/10 px-6 py-2 text-center text-xs text-success">
            You have successfully minted a token 🎉
          </p>
        </Card>
      )}
    </div>
  );
}
