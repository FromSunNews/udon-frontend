import { Button } from '@/components/common/button';
import { Typography } from '@/components/common/typography';
import { MoveRight } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserReserveData } from '@/app/(protected)/dashboard/types';
import CountUp from '@/components/common/count-up';

// Define the schema using Zod
const depositSchema = z.object({
  amount: z
    .string()
    .min(1, { message: 'Amount is required' })
    .refine(
      val => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Amount must be a positive number' }
    ),
});

// Infer the type from the schema
type DepositFormData = z.infer<typeof depositSchema>;

interface SidePanelProps {
  reserve?: UserReserveData;
}

export const SidePanel: React.FC<SidePanelProps> = ({ reserve }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: '',
    },
  });

  const onSubmit = (data: DepositFormData) => {
    alert(`Deposit: ${data.amount}`);
  };

  return (
    <div className="w-full mt-8 md:mt-0 md:sticky md:top-[100px] md:self-start">
      <div className="w-full">
        <div className="bg-card border rounded-xl p-5 border-border">
          <div className="fcol gap-4">
            <div className="w-full">
              <Typography className="text-submerged mb-1">
                My position ({reserve?.symbol || 'Asset'})
              </Typography>
              <div className="frow-icenter gap-2 whitespace-nowrap">
                <Typography className="text-submerged text-lg">0.00</Typography>
                <MoveRight className="w-4 h-4 text-submerged" />
                <Typography weight="medium" className="text-lg">
                  {reserve ? (
                    <CountUp value={reserve.currentATokenBalance} decimals={2} />
                  ) : (
                    'Loading...'
                  )}
                </Typography>
              </div>
            </div>

            <div>
              <Typography className="text-submerged mb-1">Earn APY</Typography>
              <Typography weight="medium" className="text-lg">
                {reserve ? (
                  <CountUp value={reserve.supplyAPY} decimals={2} suffix="%" />
                ) : (
                  'Loading...'
                )}
              </Typography>
            </div>

            <div>
              <Typography className="text-submerged mb-1">
                Projected Earnings/Month ({reserve?.symbol || 'Asset'})
              </Typography>
              <Typography weight="medium" className="text-lg">
                {reserve && reserve.currentATokenBalance > 0 ? (
                  <CountUp
                    value={(reserve.currentATokenBalance * reserve.supplyAPY) / 100 / 12}
                    decimals={2}
                  />
                ) : (
                  '0.00'
                )}
              </Typography>
            </div>

            <div>
              <Typography className="text-submerged mb-1">
                Projected Earnings/Year ({reserve?.symbol || 'Asset'})
              </Typography>
              <Typography weight="medium" className="text-lg">
                {reserve && reserve.currentATokenBalance > 0 ? (
                  <CountUp
                    value={(reserve.currentATokenBalance * reserve.supplyAPY) / 100}
                    decimals={2}
                  />
                ) : (
                  '0.00'
                )}
              </Typography>
            </div>

            <div>
              <Typography className="text-submerged mb-1">
                Wallet Balance ({reserve?.symbol || 'Asset'})
              </Typography>
              <div className="frow-icenter gap-2 whitespace-nowrap">
                <Typography className="text-submerged">0.00</Typography>
                <MoveRight className="w-4 h-4 text-submerged" />
                <Typography weight="medium" className="text-lg">
                  {reserve ? <CountUp value={reserve.balance} decimals={2} /> : 'Loading...'}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-card border border-primary/30 rounded-xl p-5 mt-4">
            <div className="fcol gap-2">
              <Typography size="sm" className="text-submerged mb-1">
                Deposit (USDC)
              </Typography>
              <input
                type="text"
                {...register('amount')}
                className="bg-transparent text-foreground w-full focus:outline-none text-3xl"
                placeholder="0.00"
              />
              {errors.amount ? (
                <Typography className=" text-sm text-destructive mt-1">
                  {errors.amount.message}
                </Typography>
              ) : (
                <Typography className="text-submerged">$0</Typography>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" variant="default" size="lg">
            Finalize
          </Button>
        </form>
      </div>
    </div>
  );
};
