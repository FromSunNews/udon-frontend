import React, { useCallback, useEffect, useState } from 'react';

// Import Chromia FT4 functionality for account management and authentication
import {
  createSingleSigAuthDescriptorRegistration,
  registerAccount,
  registrationStrategy,
} from '@chromia/ft4';
// Import Chromia React hooks and utilities
import {
  createChromiaHooks,
  useEvmKeyStore,
  useFtAccounts,
  usePostchainClient,
} from '@chromia/react';
import { IClient } from 'postchain-client';
import { useAccount } from 'wagmi';
import { publicClientConfig } from '@/configs/client';

// Import the public client configuration

// Initialize Chromia hooks with default blockchain configuration
const { useChromiaQuery, useChromiaImmutableQuery } = createChromiaHooks({
  defaultClientConfig: publicClientConfig,
});

export { useChromiaImmutableQuery, useChromiaQuery };

/**
 * Custom hook for managing Chromia account creation and checking account status.
 * @param onAccountCreated - Optional callback to trigger after account creation.
 * @param onError - Optional callback to trigger when an error occurs.
 * @returns Object containing account management functions and current account status.
 */
export const useChromiaAccount = ({
  onAccountCreated,
  onError,
}: {
  onAccountCreated?: () => void;
  onError?: () => void;
} = {}) => {
  const [isLoading, setIsLoading] = useState(true); // Tracks if account creation is in progress
  const [tried, setTried] = useState(false); // Tracks if account creation has been attempted

  const { address: ethAddress, isConnected } = useAccount();
  const { data: client, isLoading: isLoadingClient } = usePostchainClient({
    config: publicClientConfig,
  }); // Initialize Postchain client
  const { data: keyStore } = useEvmKeyStore(); // Get the Ethereum key store for authentication
  const {
    mutate,
    data: ftAccounts,
    isLoading: isLoadingFtAccounts,
  } = useFtAccounts({
    clientConfig: publicClientConfig,
  }); // Manage FT4 accounts

  React.useEffect(() => {
    if (isLoadingClient || isLoadingFtAccounts) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isLoadingClient, isLoadingFtAccounts]);

  // Reset Chromia account khi disconnect hoặc khi đổi ví (Ethereum address thay đổi)
  useEffect(() => {
    console.log('isConnected', isConnected);
    console.log('ethAddress', ethAddress);
    console.log('keyStore', keyStore);
    if (isConnected) {
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, ethAddress, keyStore]);

  /**
   * Creates a new Chromia account with transfer capabilities.
   * Registers the account on the blockchain after authentication.
   */
  const createAccount = useCallback(async () => {
    console.log('createAccount');
    try {
      setIsLoading(true); // Set loading state to true during the account creation process

      // Ensure necessary data (Ethereum address, key store, client) is available before proceeding
      if (!ethAddress || !keyStore || !client) {
        onError?.();
        return;
      }
      console.log('ethAddress', ethAddress);
      console.log('keyStore', keyStore);
      console.log('client', client);
      console.log('passing check ethAddress, keyStore, client');

      // Create the authentication descriptor for account and transfer permissions
      const authDescriptor = createSingleSigAuthDescriptorRegistration(
        ['A', 'T'],
        keyStore.id,
        null
      );

      // Register the account with the Chromia blockchain
      await registerAccount(
        client as IClient,
        keyStore,
        registrationStrategy.open(authDescriptor) // Open the registration strategy with the auth descriptor
      );

      // Refresh the list of FT4 accounts after registration
      await mutate();
      console.log('Refresh the list of FT4 accounts after registration with mutate()');
      // Execute the optional callback if provided
      onAccountCreated?.();
      console.log('createAccount success');
    } catch (error) {
      console.error(error); // Log any error that occurs during account creation
      // Call onError when
      onError?.();
    } finally {
      setIsLoading(false); // Set loading state to false when done
      setTried(true); // Mark that account creation was attempted
    }
  }, [client, ethAddress, keyStore, mutate, onAccountCreated, onError]);

  // Return an interface with account management functions and status
  return {
    createAccount, // Function to create a new account
    isLoading, // Indicates if the account creation process is in progress
    tried, // Indicates if the user has tried creating an account
    account: ftAccounts?.[0], // The first account in the list (if available)
    hasAccount: !!ftAccounts?.length, // Boolean indicating whether the user has an account
    client,
    keyStore,
  };
};
