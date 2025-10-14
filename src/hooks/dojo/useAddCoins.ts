import { useState } from 'react';
import useGameStore from '@/store/gameStore';
import { getContractAddresses } from '@/config/cavosConfig';
import { useAegis } from '@cavos/aegis';
import { toast } from 'sonner';
import { network } from '@/config/cavosConfig';

/**
 * Hook to add virtual coins to a player's balance
 * Uses the game contract's increase_player_coin_balance method
 *
 * Usage:
 * ```ts
 * const { addCoins, loading, error } = useAddCoins();
 *
 * // After validating pool position was opened successfully:
 * const txHash = await addCoins(100); // Add 100 coins
 * ```
 */
export function useAddCoins() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { aegisAccount } = useAegis();
  const { aegis, addPendingTransaction, removePendingTransaction } = useGameStore();
  const contractAddresses = getContractAddresses();

  /**
   * Add coins to the player's balance
   *
   * @param amount - Amount of coins to add (will be converted to felt252)
   * @returns Transaction hash if successful
   * @throws Error if user is not authenticated or transaction fails
   */
  const addCoins = async (amount: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      // Verify user is authenticated
      if (!aegis.isAuthenticated || !aegis.wallet?.address) {
        throw new Error('User not authenticated. Please log in first.');
      }

      // Check if aegisAccount is available
      if (!aegisAccount) {
        throw new Error('Aegis account not initialized.');
      }

      console.log('💰 Adding coins to player:', {
        wallet: aegis.wallet.address,
        amount
      });

      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (!Number.isInteger(amount)) {
        throw new Error('Amount must be an integer');
      }

      // Execute transaction
      const result = await aegisAccount.execute(
        contractAddresses.game,
        'increase_player_coin_balance',
        [amount.toString()] // amount as felt252
      );

      const txHash = result?.transactionHash;

      if (!txHash || typeof txHash !== 'string') {
        throw new Error('No valid transaction hash returned.');
      }

      console.log('✅ Coins added successfully:', {
        amount,
        txHash
      });

      // Add to pending transactions
      addPendingTransaction(txHash);

      // Explorer URL
      const explorerUrl = network === 'SN_MAINNET'
        ? `https://voyager.online/tx/${txHash}`
        : `https://sepolia.voyager.online/tx/${txHash}`;

      toast.success(`Added ${amount} coins!`, {
        action: {
          label: 'View',
          onClick: () => window.open(explorerUrl, '_blank')
        }
      });

      // Remove from pending after delay
      setTimeout(() => removePendingTransaction(txHash), 30000);

      return txHash;

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add coins';
      setError(msg);
      console.error('❌ Failed to add coins:', err);
      toast.error('Failed to add coins', { description: msg });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addCoins,
    loading,
    error
  };
}
