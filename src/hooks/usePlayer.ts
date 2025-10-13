import { useState, useEffect, useCallback } from 'react';
import { useAegis } from '@cavos/aegis';
import useGameStore from '@/store/gameStore';
import { toriiUrl } from '@/config/cavosConfig';
import type { Player } from '@/dojo/models.gen';

/**
 * Hook to fetch player data from Torii GraphQL indexer
 * Based on the actual Player model from models.gen.ts:
 * - player_address: string
 * - name: number (felt252)
 * - coin_balance: number
 */

const TORII_GRAPHQL_URL = `${toriiUrl}/graphql`;

// GraphQL query to get player data based on actual model
const PLAYER_QUERY = `
  query GetPlayer($playerAddress: String!) {
    bitwavePlayerModels(where: { player_address: $playerAddress }) {
      edges {
        node {
          player_address
          name
          coin_balance
        }
      }
    }
  }
`;

export interface UsePlayerReturn {
  player: Player | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlayer(): UsePlayerReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { aegisAccount } = useAegis();
  const { player, setPlayer } = useGameStore();

  /**
   * Fetch player data from Torii
   */
  const fetchPlayer = useCallback(async () => {
    const walletAddress = aegisAccount?.address;

    if (!walletAddress) {
      console.log('⚠️ No wallet address available, skipping player fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching player data from Torii:', {
        address: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        toriiUrl: TORII_GRAPHQL_URL
      });

      const response = await fetch(TORII_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: PLAYER_QUERY,
          variables: {
            playerAddress: walletAddress.toLowerCase()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Torii query failed: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('📦 Torii response:', result);

      // Check for GraphQL errors
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL query error');
      }

      // Extract player data
      const playerEdges = result.data?.bitwavePlayerModels?.edges;

      if (playerEdges && playerEdges.length > 0) {
        const playerData = playerEdges[0].node;

        // Convert hex values to numbers for numeric fields
        const playerModel: Player = {
          player_address: playerData.player_address,
          name: parseInt(playerData.name, 16) || 0, // felt252 as number
          coin_balance: parseInt(playerData.coin_balance, 16) || 0
        };

        console.log('✅ Player data fetched:', playerModel);
        setPlayer(playerModel as any); // Store expects slightly different type
      } else {
        console.log('⚠️ No player data found for address');
        setPlayer(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch player data';
      console.error('❌ Error fetching player:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [aegisAccount?.address, setPlayer]);

  /**
   * Auto-fetch player data when wallet address changes
   */
  useEffect(() => {
    if (aegisAccount?.address) {
      fetchPlayer();
    }
  }, [aegisAccount?.address, fetchPlayer]);

  return {
    player,
    loading,
    error,
    refetch: fetchPlayer
  };
}
