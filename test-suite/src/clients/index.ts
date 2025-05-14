import { createClient } from 'postchain-client';
import { testEnv } from '../configs';

export async function getClient() {
  const nodeUrl = testEnv.NODE_URL;
  console.log('nodeUrl', nodeUrl);
  if (!nodeUrl) {
    throw new Error('NODE_URL environment variable is required');
  }
  let client;
  if (testEnv.network === 'local') {
    client = await createClient({
      nodeUrlPool: nodeUrl,
      blockchainRid: testEnv.BLOCKCHAIN_RID,
    });
  } else {
    const urls = nodeUrl
      .split(',')
      .map(url => url.trim())
      .filter(Boolean);
    console.log('urls', urls);
    client = await createClient({
      directoryNodeUrlPool: urls,
      blockchainRid: testEnv.BLOCKCHAIN_RID,
    });
  }

  return client;
}
