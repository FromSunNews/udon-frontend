import { registerAccountOpen, registerAccountOpenEVM } from '../common/operations/accounts';
import {
  Account,
  createInMemoryEvmKeyStore,
  createInMemoryFtKeyStore,
  createKeyStoreInteractor,
  PaginatedEntity,
} from '@chromia/ft4';
import { IClient, KeyPair } from 'postchain-client';

export async function getSession(client: IClient, kp: KeyPair) {
  const store = createInMemoryFtKeyStore(kp);

  const { getSession, getAccounts } = createKeyStoreInteractor(client, store);
  const accounts = await getAccounts();
  console.log('accounts', accounts);
  const myAccount = accounts[0];
  console.log('myAccount', myAccount);
  return await getSession(myAccount.id);
}

export async function getSessionOrRegister(client: IClient, kp: KeyPair) {
  const resultGetAccountBySigner = (await client.query('ft4.get_accounts_by_signer', {
    id: kp.pubKey,
    page_size: null,
    page_cursor: null,
  })) as unknown as PaginatedEntity<Account>;

  console.log('resultGetAccountBySigner', resultGetAccountBySigner);

  // if the account is not registered, register it
  if (resultGetAccountBySigner?.data.length === 0) {
    console.log('registering account');
    return await registerAccountOpen(client, kp);
  } else {
    const store = createInMemoryFtKeyStore(kp);
    const { getSession } = createKeyStoreInteractor(client, store);
    console.log('getting session');
    return await getSession(resultGetAccountBySigner?.data[0]?.id);
  }
}

export async function getSessionOrRegisterEVM(client: IClient, kp: KeyPair) {
  const resultGetAccountBySigner = (await client.query('ft4.get_accounts_by_signer', {
    id: kp.pubKey,
    page_size: null,
    page_cursor: null,
  })) as unknown as PaginatedEntity<Account>;

  console.log('resultGetAccountBySigner', resultGetAccountBySigner);

  // if the account is not registered, register it
  if (resultGetAccountBySigner?.data.length === 0) {
    console.log('registering account');
    return await registerAccountOpenEVM(client, kp);
  } else {
    const store = createInMemoryEvmKeyStore(kp);
    const { getSession } = createKeyStoreInteractor(client, store);
    console.log('getting session');
    return await getSession(resultGetAccountBySigner?.data[0]?.id);
  }
}
