// get tx link from tx hash
import { env } from '@/utils/env';

export const getTxLink = (txHash: string) => {
  // example: https://explorer.chromia.com/testnet/1A0F8951E73D53B142809D73AF8297746461204BAF6569F3DF2748F2ADA620FA/transaction/FD93D8E5430B718AF37550013C1C65948FB4A03FD1C11800C3AF6FEE5B526E33
  return `https://explorer.chromia.com/${env.network}/${env.brid}/transaction/${txHash}`;
};

export const getAssetLink = (assetId: string) => {
  // example: https://explorer.chromia.com/testnet/4493FCBF4118AA3BC9FF08351B4EC632D6C821CE82F68ED9DE439D8AA0421BFD/asset/FCAFD748A2048A02028BB6FD5EB6E63F5CC2A823EB4F7A7972A4C9D2ED35A7D3
  return `https://explorer.chromia.com/${env.network}/${env.brid}/asset/${assetId}`;
};
