import { useState } from 'react';
import { getContractAddresses } from '@/config/cavosConfig';
import { toast } from 'sonner';
import { useAegis } from '@cavos/aegis';
import useGameStore from '@/store/gameStore';
import { network } from '@/config/cavosConfig';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { aegisAccount } = useAegis();
  const contractAddresses = getContractAddresses();
  const { aegis, addPendingTransaction, removePendingTransaction } = useGameStore();

  const spawnPlayer = async (playerName: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Spawning player:', playerName);

      // Check authentication
      if (!aegis.isAuthenticated || !aegis.wallet?.address) {
        throw new Error('Not authenticated. Please log in first.');
      }

      // Check if aegisAccount is available
      if (!aegisAccount) {
        throw new Error('Aegis account not initialized.');
      }

      // Execute spawn_player transaction
      const result = await aegisAccount.execute(
        contractAddresses.game,
        'spawn_player',
        [playerName] // Send string directly as felt252
      );

      const txHash = result?.transactionHash;

      if (!txHash || typeof txHash !== 'string') {
        throw new Error('No valid transaction hash returned.');
      }

      console.log('✅ Player spawned:', txHash);

      // Add to pending transactions
      addPendingTransaction(txHash);

      // Explorer URL
      const explorerUrl = network === 'SN_MAINNET'
        ? `https://voyager.online/tx/${txHash}`
        : `https://sepolia.voyager.online/tx/${txHash}`;

      toast.success('Player created!', {
        action: {
          label: 'View',
          onClick: () => window.open(explorerUrl, '_blank')
        }
      });

      // Remove from pending after delay
      setTimeout(() => removePendingTransaction(txHash), 30000);

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to spawn player';
      setError(msg);
      console.error('❌ Spawn player error:', err);
      toast.error('Failed to create player', { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { spawnPlayer, loading, error };
}
