import { useState, useEffect, useCallback } from 'react';
import { useAegis } from '@cavos/aegis';
import useGameStore from '@/store/gameStore';
import { toriiUrl } from '@/config/cavosConfig';
import type { MinigameScore } from '@/dojo/models.gen';

/**
 * Hook to fetch minigame scores from Torii GraphQL indexer
 * Based on the MinigameScore model from models.gen.ts:
 * - player_address: string
 * - minigame_id: number
 * - highest_score: number
 * - total_score: number
 */

const TORII_GRAPHQL_URL = `${toriiUrl}/graphql`;

// GraphQL query to get all minigame scores for a player
const MINIGAME_SCORES_QUERY = `
  query GetMinigameScores($playerAddress: String!) {
    bitwaveMinigameScoreModels(where: { player_address: $playerAddress }) {
      edges {
        node {
          player_address
          minigame_id
          highest_score
          total_score
        }
      }
    }
  }
`;

export interface UseMinigameScoresReturn {
  scores: Record<number, MinigameScore>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMinigameScores(): UseMinigameScoresReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { aegisAccount } = useAegis();
  const { minigameScores, setMinigameScore } = useGameStore();

  /**
   * Fetch all minigame scores for the current player
   */
  const fetchMinigameScores = useCallback(async () => {
    const walletAddress = aegisAccount?.address;

    if (!walletAddress) {
      console.log('⚠️ No wallet address available, skipping minigame scores fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🎮 Fetching minigame scores from Torii:', {
        address: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        toriiUrl: TORII_GRAPHQL_URL
      });

      const response = await fetch(TORII_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: MINIGAME_SCORES_QUERY,
          variables: {
            playerAddress: walletAddress.toLowerCase()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Torii query failed: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('📦 Torii minigame scores response:', result);

      // Check for GraphQL errors
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL query error');
      }

      // Extract minigame scores
      const scoreEdges = result.data?.bitwaveMinigameScoreModels?.edges;

      if (scoreEdges && scoreEdges.length > 0) {
        console.log(`✅ Found ${scoreEdges.length} minigame score(s)`);

        // Process each score and add to store
        scoreEdges.forEach((edge: any) => {
          const scoreData = edge.node;

          const minigameScore: MinigameScore = {
            player_address: scoreData.player_address,
            minigame_id: parseInt(scoreData.minigame_id, 16) || 0,
            highest_score: parseInt(scoreData.highest_score, 16) || 0,
            total_score: parseInt(scoreData.total_score, 16) || 0
          };

          console.log(`   🎯 Minigame ${minigameScore.minigame_id}:`, {
            highest: minigameScore.highest_score,
            total: minigameScore.total_score
          });

          // Add to store indexed by minigame_id
          setMinigameScore(minigameScore.minigame_id, minigameScore);
        });

      } else {
        console.log('⚠️ No minigame scores found for player');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch minigame scores';
      console.error('❌ Error fetching minigame scores:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [aegisAccount?.address, setMinigameScore]);

  /**
   * Auto-fetch minigame scores when wallet address changes
   */
  useEffect(() => {
    if (aegisAccount?.address) {
      fetchMinigameScores();
    }
  }, [aegisAccount?.address, fetchMinigameScores]);

  return {
    scores: minigameScores,
    loading,
    error,
    refetch: fetchMinigameScores
  };
}
