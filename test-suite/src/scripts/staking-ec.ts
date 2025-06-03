import {
  Account,
  createConnection,
  createInMemoryEvmKeyStore,
  createKeyStoreInteractor,
  createSingleSigAuthDescriptorRegistration,
  op,
  PaginatedEntity,
  registerAccount,
  registrationStrategy,
} from '@chromia/ft4';
import chalk from 'chalk';
import { createClient, encryption } from 'postchain-client';

async function stakingEc() {
  try {
    // const CHR_ASSET_ID = '9EF73A786A66F435B3B40E72F5E9D85A4B09815997E087C809913E1E7EC686B4'; // tCHR asset on Chromia testnet
    const BLOCKCHAIN_RID = '090BCD47149FBB66F02489372E88A454E7A5645ADDE82125D40DF1EF0C76F874'; // Economy chain RID
    const TESTNET_URL = 'https://node0.testnet.chromia.com:7740'; // Chromia testnet URL

    const client = await createClient({
      nodeUrlPool: TESTNET_URL,
      blockchainRid: BLOCKCHAIN_RID,
    });

    const privKey = Buffer.from(
      '76134de6d764d74ab806b844c90d504f717e4e7f00616627898a83a8fe4fc28c',
      'hex'
    );
    const keyPair = encryption.makeKeyPair(privKey);

    console.log('keyPair', keyPair);

    const evmKeystore = createInMemoryEvmKeyStore(keyPair);

    const resultGetAccountBySigner = (await client.query('ft4.get_accounts_by_signer', {
      id: keyPair.pubKey,
      page_size: null,
      page_cursor: null,
    })) as unknown as PaginatedEntity<Account>;

    console.log('resultGetAccountBySigner', resultGetAccountBySigner);
    let sessionAccount;
    // if the account is not registered, register it
    if (resultGetAccountBySigner?.data.length === 0) {
      console.log('registering account');
      const connection = createConnection(client);

      const { session } = await registerAccount(
        connection.client,
        evmKeystore,
        registrationStrategy.open(
          createSingleSigAuthDescriptorRegistration(['A', 'T'], evmKeystore.id, null)
        )
      );
      console.log('session', session);
      sessionAccount = session;
    } else {
      const { getSession } = createKeyStoreInteractor(client, evmKeystore);
      console.log('getting session');
      sessionAccount = await getSession(resultGetAccountBySigner?.data[0]?.id);
      console.log('session', sessionAccount);
    }
    console.log(chalk.blue('🔄 Staking...'));
    await sessionAccount.call(op('staking_deposit_native', 1, keyPair.pubKey));
    console.log(chalk.green('✅ Staked'));
  } catch (error) {
    console.error(chalk.bold.red('❌❌❌ ERROR IN STAKING EC ❌❌❌'));
    console.error(chalk.red(error));
  }
}

stakingEc().catch(error => console.error(chalk.red('Unhandled error:'), error));
