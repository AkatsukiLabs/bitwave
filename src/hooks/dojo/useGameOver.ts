import { useUpdateScores } from './useUpdateScores';
import useGameStore from '@/store/gameStore';
import { MINIGAME_IDS } from '@/config/minigameIds';

/**
 * Hook to handle game over logic
 * Compares scores with stored scores and updates blockchain if needed
 * Only executes transactions if user is logged in
 */

export interface UseGameOverReturn {
  handleGameOver: (gameName: keyof typeof MINIGAME_IDS, finalScore: number) => Promise<void>;
  loading: boolean;
}

export function useGameOver(): UseGameOverReturn {
  const { updateHighestScore, updateTotalScore, loading } = useUpdateScores();
  const { minigameScores, aegis } = useGameStore();

  const handleGameOver = async (
    gameName: keyof typeof MINIGAME_IDS,
    finalScore: number
  ): Promise<void> => {
    const minigameId = MINIGAME_IDS[gameName];

    if (!minigameId) {
      console.error('❌ Invalid game name:', gameName);
      return;
    }

    console.log(`🎮 Game Over: ${gameName} (ID: ${minigameId}) - Score: ${finalScore}`);

    // Check if user is logged in using Zustand store
    console.log('🔍 Auth Status:', {
      isAuthenticated: aegis.isAuthenticated,
      hasWallet: !!aegis.wallet,
      walletAddress: aegis.wallet?.address,
    });

    if (!aegis.isAuthenticated || !aegis.wallet?.address) {
      console.log('⚠️ User not logged in, skipping blockchain score update');
      return;
    }

    try {
      // Get current scores from store
      const currentScores = minigameScores[minigameId];
      const currentHighScore = currentScores?.highest_score || 0;

      console.log('📊 Current scores:', {
        highestScore: currentHighScore,
        totalScore: currentScores?.total_score || 0,
        newScore: finalScore
      });

      // Always update total score (adds to cumulative total)
      const totalScoreTx = await updateTotalScore(minigameId, finalScore);
      if (totalScoreTx) {
        console.log('✅ Total score transaction:', totalScoreTx);
      }

      // Update highest score only if new score is higher
      if (finalScore > currentHighScore) {
        console.log(`🏆 New high score! ${currentHighScore} → ${finalScore}`);
        const highScoreTx = await updateHighestScore(minigameId, finalScore);
        if (highScoreTx) {
          console.log('✅ High score transaction:', highScoreTx);
        }
      } else {
        console.log(`💭 Score ${finalScore} not higher than current high score ${currentHighScore}`);
      }

    } catch (error) {
      console.error('❌ Error handling game over:', error);
    }
  };

  return {
    handleGameOver,
    loading
  };
}
