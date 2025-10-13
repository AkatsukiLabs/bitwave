import { useState } from 'react';
import { useAegis } from '@cavos/aegis';
import useGameStore from '@/store/gameStore';
import { getContractAddresses } from '@/config/cavosConfig';
import { toast } from 'sonner';

/**
 * Hook to spawn a new player in the game
 * Contract: game::spawn_player(playerName: felt252)
 */

export interface UseSpawnPlayerReturn {
  spawnPlayer: (playerName: number) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useSpawnPlayer(): UseSpawnPlayerReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { aegisAccount } = useAegis();
  const { addPendingTransaction } = useGameStore();
  const contractAddresses = getContractAddresses();

  const spawnPlayer = async (playerName: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!aegisAccount?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('🚀 Spawning player:', playerName);

      const result = await aegisAccount.execute([{
        contractAddress: contractAddresses.game,
        entrypoint: 'spawn_player',
        calldata: [playerName.toString()] // felt252 as string
      }]);

      const txHash = result?.transaction_hash || result?.txHash;
      if (!txHash) throw new Error('No transaction hash');

      console.log('✅ Player spawned:', txHash);
      addPendingTransaction(txHash);
      toast.success('Player created!');

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to spawn player';
      setError(msg);
      toast.error('Failed to spawn player', { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { spawnPlayer, loading, error };
}
