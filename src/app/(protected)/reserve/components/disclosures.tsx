import { Typography } from '@/components/common/typography';
import { Sparkles } from 'lucide-react';
import React from 'react';

export const VaultDisclosures: React.FC = () => {
  return (
    <div className="w-full mt-6 max-md:max-w-full flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <Typography variant="h3" weight="medium">
          Disclosures
        </Typography>
        <div className="flex items-center gap-2">
          <div className="self-stretch my-auto">Learn more</div>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center justify-center w-full py-4 bg-card rounded-md border">
        <Typography className="text-muted-foreground">
          Curator has not submitted a Disclosure.
        </Typography>
      </div>
    </div>
  );
};
