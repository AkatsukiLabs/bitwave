import { useState } from 'react';
import { useAegis } from '@cavos/aegis';
import useGameStore from '@/store/gameStore';
import { getContractAddresses } from '@/config/cavosConfig';
import { toast } from 'sonner';

/**
 * Hook to update player scores (highest and total)
 * Contracts:
 * - game::update_player_highest_score(minigameId: u32, highestScore: u64)
 * - game::update_player_total_score(minigameId: u32, score: u64)
 */

export interface UseUpdateScoresReturn {
  updateHighestScore: (minigameId: number, highestScore: number) => Promise<string | null>;
  updateTotalScore: (minigameId: number, score: number) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useUpdateScores(): UseUpdateScoresReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { aegisAccount } = useAegis();
  const { addPendingTransaction } = useGameStore();
  const contractAddresses = getContractAddresses();

  const updateHighestScore = async (minigameId: number, highestScore: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!aegisAccount?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('🎯 Updating highest score:', { minigameId, highestScore });

      const result = await aegisAccount.execute([{
        contractAddress: contractAddresses.game,
        entrypoint: 'update_player_highest_score',
        calldata: [minigameId.toString(), highestScore.toString()]
      }]);

      const txHash = result?.transaction_hash || result?.txHash;
      if (!txHash) throw new Error('No transaction hash');

      console.log('✅ Highest score updated:', txHash);
      addPendingTransaction(txHash);
      toast.success('High score saved!');

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update score';
      setError(msg);
      toast.error('Failed to update score', { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTotalScore = async (minigameId: number, score: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!aegisAccount?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('📊 Updating total score:', { minigameId, score });

      const result = await aegisAccount.execute([{
        contractAddress: contractAddresses.game,
        entrypoint: 'update_player_total_score',
        calldata: [minigameId.toString(), score.toString()]
      }]);

      const txHash = result?.transaction_hash || result?.txHash;
      if (!txHash) throw new Error('No transaction hash');

      console.log('✅ Total score updated:', txHash);
      addPendingTransaction(txHash);

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update score';
      setError(msg);
      toast.error('Failed to update score', { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateHighestScore, updateTotalScore, loading, error };
}
