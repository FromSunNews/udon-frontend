import { ensureBuffer } from '../helpers/buffer';
import { parseUnits } from 'ethers/lib/utils';

// hippo: A8A05014A795D77C4FA12FDF08776FD70799549530F27ABB3B3331FB4D0A2AC8
// nathan: 5D3D574FA59149FE64E7495907FA047A2AC80EA0524D66373D12770104A0B0FA

// Define constants for minting
// Users can modify these values before running the script
export const ASSET_CONFIG = {
  // The amount to mint in whole tokens (will be converted to RAY)
  MINT_AMOUNT: '1000',
  // Target user ID.
  // Edit target user id to mint
  TARGET_USER_ID: ensureBuffer('5D3D574FA59149FE64E7495907FA047A2AC80EA0524D66373D12770104A0B0FA'),
};

// Token definitions
export const TOKENS = [
  // {
  //   name: 'Bitcoin USD',
  //   symbol: 'BTCUSD',
  //   decimals: 8,
  //   icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1.png',
  //   price: parseUnits('60000', 18).toString(),
  // },
  // {
  //   name: 'Ethereum USD',
  //   symbol: 'ETHUSD',
  //   decimals: 18,
  //   icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png',
  //   price: parseUnits('2500', 18).toString(),
  // },
  {
    name: 'MyNeighborAlice',
    symbol: 'ALICEUSD',
    decimals: 6,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/8766.png',
    price: parseUnits('0.49', 18).toString(),
  },
  {
    name: 'DAR Open Network',
    symbol: 'DUSD',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/11374.png',
    price: parseUnits('0.45', 18).toString(),
  },
  {
    name: 'Chromia USD',
    symbol: 'CHRUSD',
    decimals: 6,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3978.png',
    price: parseUnits('0.22', 18).toString(),
  },
  {
    name: 'USDT',
    symbol: 'USDTUSD',
    decimals: 6,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/825.png',
    price: parseUnits('1', 18).toString(),
  },
  // {
  //   name: 'USDC',
  //   symbol: 'USDCUSD',
  //   decimals: 6,
  //   icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
  //   price: parseUnits('1', 18).toString(),
  // },
];
