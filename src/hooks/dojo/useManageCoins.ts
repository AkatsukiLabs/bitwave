import { useState } from 'react';
import { useAegis } from '@cavos/aegis';
import useGameStore from '@/store/gameStore';
import { getContractAddresses } from '@/config/cavosConfig';
import { toast } from 'sonner';

/**
 * Hook to manage player coin balance
 * Contracts:
 * - game::increase_player_coin_balance(amount: u256)
 * - game::decrease_player_coin_balance(amount: u256)
 */

export interface UseManageCoinsReturn {
  increaseCoins: (amount: number) => Promise<string | null>;
  decreaseCoins: (amount: number) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useManageCoins(): UseManageCoinsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { aegisAccount } = useAegis();
  const { addPendingTransaction } = useGameStore();
  const contractAddresses = getContractAddresses();

  const increaseCoins = async (amount: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!aegisAccount?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('💰 Increasing coin balance:', amount);

      const result = await aegisAccount.execute([{
        contractAddress: contractAddresses.game,
        entrypoint: 'increase_player_coin_balance',
        calldata: [amount.toString()]
      }]);

      const txHash = result?.transaction_hash || result?.txHash;
      if (!txHash) throw new Error('No transaction hash');

      console.log('✅ Coins increased:', txHash);
      addPendingTransaction(txHash);
      toast.success(`+${amount} coins!`);

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to increase coins';
      setError(msg);
      toast.error('Failed to increase coins', { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const decreaseCoins = async (amount: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!aegisAccount?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('💸 Decreasing coin balance:', amount);

      const result = await aegisAccount.execute([{
        contractAddress: contractAddresses.game,
        entrypoint: 'decrease_player_coin_balance',
        calldata: [amount.toString()]
      }]);

      const txHash = result?.transaction_hash || result?.txHash;
      if (!txHash) throw new Error('No transaction hash');

      console.log('✅ Coins decreased:', txHash);
      addPendingTransaction(txHash);
      toast.success(`-${amount} coins`);

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to decrease coins';
      setError(msg);
      toast.error('Failed to decrease coins', { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { increaseCoins, decreaseCoins, loading, error };
}
