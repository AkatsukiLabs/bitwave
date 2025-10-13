import { useCavosTransaction } from '../useCavosTransaction';
import { getContractAddresses } from '@/config/cavosConfig';
import { toast } from 'sonner';

/**
 * Hook to spawn a new player in the game
 * Contract: game::spawn_player(playerName: felt252)
 */

export interface UseSpawnPlayerReturn {
  spawnPlayer: (playerName: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useSpawnPlayer(): UseSpawnPlayerReturn {
  const { executeTransaction, loading, error } = useCavosTransaction();
  const contractAddresses = getContractAddresses();

  const spawnPlayer = async (playerName: string): Promise<string | null> => {
    try {
      console.log('🚀 Spawning player:', playerName);

      // Execute spawn_player transaction
      const txHash = await executeTransaction({
        contractAddress: contractAddresses.game,
        entrypoint: 'spawn_player',
        calldata: [playerName] // Send string directly as felt252
      });

      console.log('✅ Player spawned:', txHash);
      toast.success('Player created!');

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to spawn player';
      console.error('❌ Spawn player error:', err);
      return null;
    }
  };

  return { spawnPlayer, loading, error };
}
