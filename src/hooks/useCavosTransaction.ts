import { useState } from 'react';
import { useAegis } from '@cavos/aegis';
import useGameStore from '@/store/gameStore';
import { toast } from 'sonner';

/**
 * Hook for executing transactions on Dojo contracts using Aegis SDK
 * Integrates with the game store for transaction tracking
 */

export interface TransactionCall {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

export interface UseCavosTransactionReturn {
  executeTransaction: (calls: TransactionCall | TransactionCall[]) => Promise<string>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCavosTransaction(): UseCavosTransactionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { aegisAccount } = useAegis();
  const { addPendingTransaction, removePendingTransaction } = useGameStore();

  /**
   * Execute a transaction or batch of transactions
   */
  const executeTransaction = async (
    calls: TransactionCall | TransactionCall[]
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Verify Aegis SDK is initialized
      if (!aegisAccount) {
        throw new Error('Aegis SDK not initialized. Please connect your wallet first.');
      }

      // Verify wallet is connected
      const walletAddress = aegisAccount.address;
      if (!walletAddress) {
        throw new Error('No wallet connected. Please connect your wallet to continue.');
      }

      console.log('📝 Executing transaction:', {
        walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        callsCount: Array.isArray(calls) ? calls.length : 1,
        calls: Array.isArray(calls)
          ? calls.map(c => ({ entrypoint: c.entrypoint, dataLength: c.calldata.length }))
          : { entrypoint: calls.entrypoint, dataLength: calls.calldata.length }
      });

      // Normalize to array
      const callsArray = Array.isArray(calls) ? calls : [calls];

      // Execute transaction using Aegis SDK
      const result = await aegisAccount.execute(callsArray);

      // Handle errors in response
      if (result?.error) {
        throw new Error(`Transaction failed: ${result.error}`);
      }

      // Extract transaction hash
      const txHash = result?.transaction_hash || result?.txHash || result;

      if (!txHash || typeof txHash !== 'string') {
        throw new Error('No valid transaction hash returned from the transaction.');
      }

      console.log('✅ Transaction successful:', {
        txHash: `${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
        explorerUrl: `https://sepolia.voyager.online/tx/${txHash}`
      });

      // Add to pending transactions for tracking
      addPendingTransaction(txHash);

      // Show success toast
      toast.success('Transaction submitted!', {
        description: `View on explorer`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://sepolia.voyager.online/tx/${txHash}`, '_blank')
        }
      });

      // Remove from pending after a delay (transaction should be confirmed by then)
      setTimeout(() => {
        removePendingTransaction(txHash);
      }, 30000); // 30 seconds

      return txHash;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed unexpectedly';
      setError(errorMsg);

      console.error('❌ Transaction error:', {
        message: errorMsg,
        error: err
      });

      // Show error toast
      toast.error('Transaction failed', {
        description: errorMsg
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    executeTransaction,
    loading,
    error,
    clearError
  };
}
