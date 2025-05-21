import React from 'react';
import { Typography } from '@/components/common/typography';
import Image from 'next/image';
import { Button } from '@/components/common/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const Header: React.FC = () => {
  const router = useRouter();
  return (
    <div className="fixed top-0 left-0 right-0 z-[20] flex flex-row px-16 justify-between items-center py-4 bg-white/0 backdrop-blur-md border-b border-border">
      <Link href="/" className="w-[210px] h-[30px] relative">
        <Image src="/logo/logo-fulltext-black.png" alt="Logo" fill />
      </Link>
      <Button
        variant="default"
        onClick={() => {
          router.push('/dashboard');
        }}
      >
        <Typography size="base" weight="medium">
          Launch App
        </Typography>
      </Button>
    </div>
  );
};
