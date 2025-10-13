import { useCavosTransaction } from '../useCavosTransaction';
import { getContractAddresses } from '@/config/cavosConfig';
import { toast } from 'sonner';
import useGameStore from '@/store/gameStore';

/**
 * Hook to update player scores (highest and total)
 * Contracts:
 * - game::update_player_highest_score(minigame_id: u32, highest_score: u32)
 * - game::update_player_total_score(minigame_id: u32, score: u32)
 */

export interface UseUpdateScoresReturn {
  updateHighestScore: (minigameId: number, highestScore: number) => Promise<string | null>;
  updateTotalScore: (minigameId: number, score: number) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useUpdateScores(): UseUpdateScoresReturn {
  const { executeTransaction, loading, error } = useCavosTransaction();
  const contractAddresses = getContractAddresses();
  const { setMinigameScore, minigameScores } = useGameStore();

  const updateHighestScore = async (minigameId: number, highestScore: number): Promise<string | null> => {
    try {
      console.log('🏆 Updating highest score:', { minigameId, highestScore });

      // Check if this is actually a new high score
      const currentScore = minigameScores[minigameId];
      if (currentScore && highestScore <= currentScore.highest_score) {
        console.log('⚠️ Score not higher than current high score, skipping transaction');
        return null;
      }

      const txHash = await executeTransaction({
        contractAddress: contractAddresses.game,
        entrypoint: 'update_player_highest_score',
        calldata: [minigameId.toString(), highestScore.toString()]
      });

      console.log('✅ Highest score updated:', txHash);

      // Update local store optimistically
      setMinigameScore(minigameId, {
        ...currentScore,
        player_address: currentScore?.player_address || '',
        minigame_id: minigameId,
        highest_score: highestScore,
        total_score: currentScore?.total_score || 0
      });

      toast.success('New high score!', {
        description: `Score: ${highestScore}`
      });

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update highest score';
      console.error('❌ Update highest score error:', err);
      return null;
    }
  };

  const updateTotalScore = async (minigameId: number, score: number): Promise<string | null> => {
    try {
      console.log('📊 Updating total score:', { minigameId, score });

      const txHash = await executeTransaction({
        contractAddress: contractAddresses.game,
        entrypoint: 'update_player_total_score',
        calldata: [minigameId.toString(), score.toString()]
      });

      console.log('✅ Total score updated:', txHash);

      // Update local store optimistically
      const currentScore = minigameScores[minigameId];
      setMinigameScore(minigameId, {
        ...currentScore,
        player_address: currentScore?.player_address || '',
        minigame_id: minigameId,
        highest_score: currentScore?.highest_score || 0,
        total_score: (currentScore?.total_score || 0) + score
      });

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update total score';
      console.error('❌ Update total score error:', err);
      return null;
    }
  };

  return { updateHighestScore, updateTotalScore, loading, error };
}
