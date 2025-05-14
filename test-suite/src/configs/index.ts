import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

export type Network = 'local' | 'testnet' | 'mainnet';

interface TestEnv {
  NODE_URL: string;
  BLOCKCHAIN_RID: string;
  network: Network;
}

export const testEnv: TestEnv = {
  NODE_URL: process.env.NODE_URL || '',
  BLOCKCHAIN_RID: process.env.BLOCKCHAIN_RID || '',
  network: process.env.NETWORK || 'local',
} as TestEnv;

export async function getTestAccounts(): Promise<string[]> {
  // 1. create accounts
  const accounts: string[] = [];
  return accounts;
}

export async function initializeTestSuit() {}
