import { useCavosTransaction } from '../useCavosTransaction';
import useGameStore from '@/store/gameStore';
import { worldAddress } from '@/config/cavosConfig';

/**
 * Hook to add virtual coins to a player's balance
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
  const { executeTransaction, loading, error } = useCavosTransaction();
  const { aegis } = useGameStore();

  /**
   * Add coins to the player's balance
   *
   * @param amount - Amount of coins to add (will be converted to felt252)
   * @returns Transaction hash if successful
   * @throws Error if user is not authenticated or transaction fails
   */
  const addCoins = async (amount: number): Promise<string | null> => {
    try {
      // Verify user is authenticated
      if (!aegis.isAuthenticated || !aegis.wallet?.address) {
        throw new Error('User not authenticated. Please log in first.');
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

      // Prepare transaction call
      const call = {
        contractAddress: worldAddress,
        entrypoint: 'add_coins',
        calldata: [amount.toString()] // amount as felt252
      };

      // Execute transaction
      const txHash = await executeTransaction(call);

      console.log('✅ Coins added successfully:', {
        amount,
        txHash
      });

      return txHash;

    } catch (err) {
      console.error('❌ Failed to add coins:', err);
      throw err;
    }
  };

  return {
    addCoins,
    loading,
    error
  };
}
