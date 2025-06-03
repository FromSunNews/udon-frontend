import { createClient, encryption } from 'postchain-client';
import {
  Account,
  // createAmount,
  createConnection,
  createInMemoryEvmKeyStore,
  createKeyStoreInteractor,
  op,
  Session,
  // TransferHistoryType,
} from '@chromia/ft4';
import chalk from 'chalk';

async function stakingEc() {
  try {
    // const CHR_ASSET_ID = '9ef73a786a66f435b3b40e72f5e9d85a4b09815997e087c809913e1e7ec686b4'; // tCHR asset on Chromia testnet
    const BLOCKCHAIN_RID = '090BCD47149FBB66F02489372E88A454E7A5645ADDE82125D40DF1EF0C76F874'; // Economy chain RID
    const TESTNET_URL = 'https://node0.testnet.chromia.com:7740'; // Chromia testnet URL

    const client = await createClient({
      nodeUrlPool: TESTNET_URL,
      blockchainRid: BLOCKCHAIN_RID,
    });

    const connection = createConnection(client);
    // Access an account by its ID:
    const accountId = 'e6bdec98482aa1837d28e71dae487905809bae2b6f35b827016249c84566fcd3';

    const myAccount: Account | null = await connection.getAccountById(accountId);

    if (myAccount == null) throw 'Account not found';

    const balances = await myAccount.getBalances();

    for (const balance of balances.data) {
      console.log(
        'balance',
        balance.asset.symbol,
        balance.amount,
        balance.asset.id.toString('hex')
      );
    }

    const privKey = Buffer.from(
      'cafdec1a5756bbb148aeb65e86878bcbacbb90607507beb58665fd99409a4299',
      'hex'
    );
    const keyPair = encryption.makeKeyPair(privKey);

    const keystoreEVM = createInMemoryEvmKeyStore(keyPair);

    const { getSession } = createKeyStoreInteractor(client, keystoreEVM);

    // Access a read-write account:
    const session: Session = await getSession(accountId);

    // const { data: first10Entries } = await myAccount.getTransferHistory(
    //   10, // Maximum number of entries to fetch (default and cap: 200).
    //   { transferHistoryType: TransferHistoryType.Received } // Filter for received transactions.
    // );

    // console.log('first10Entries', first10Entries[0]);

    console.log(chalk.blue('🔄 Staking...'));
    await session.call(op('staking_deposit_native', 100_000, null));
    console.log(chalk.green('✅ Staked'));
  } catch (error) {
    console.error(chalk.bold.red('❌❌❌ ERROR IN STAKING EC ❌❌❌'));
    console.error(chalk.red(error));
  }
}

stakingEc().catch(error => console.error(chalk.red('Unhandled error:'), error));
