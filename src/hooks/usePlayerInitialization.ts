import { useState, useCallback } from 'react';
import { useAegis } from '@cavos/aegis';
import { usePlayer } from './usePlayer';
import { useMinigameScores } from './useMinigameScores';
import { useSpawnPlayer } from './dojo/useSpawnPlayer';
import useGameStore from '@/store/gameStore';
import { toast } from 'sonner';

/**
 * Hook to handle player initialization after login
 *
 * Flow:
 * 1. Check if player exists in Torii (blockchain)
 * 2. If player doesn't exist -> spawn new player with name "none"
 * 3. If player exists -> load player data into store
 * 4. Load minigame scores for the player
 */

export interface UsePlayerInitializationReturn {
  initializePlayer: () => Promise<boolean>;
  isInitializing: boolean;
  error: string | null;
}

export function usePlayerInitialization(): UsePlayerInitializationReturn {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { aegisAccount } = useAegis();
  const { player, refetch: refetchPlayer } = usePlayer();
  const { refetch: refetchScores } = useMinigameScores();
  const { spawnPlayer } = useSpawnPlayer();
  const { setAegisAuth } = useGameStore();

  /**
   * Initialize player after successful login
   * Returns true if successful, false otherwise
   */
  const initializePlayer = useCallback(async (): Promise<boolean> => {
    const timestamp = new Date().toLocaleTimeString();

    try {
      setIsInitializing(true);
      setError(null);

      // Verify wallet is connected
      if (!aegisAccount?.address) {
        throw new Error('No wallet connected');
      }

      console.log(`🎮 [${timestamp}] INITIALIZING PLAYER`);
      console.log(`   💳 Wallet: ${aegisAccount.address}`);

      // Update store with Aegis auth state
      setAegisAuth(
        { username: aegisAccount.address.slice(0, 10) },
        { address: aegisAccount.address, network: 'mainnet' }
      );

      // Step 1: Try to fetch existing player from Torii
      console.log(`📡 [${timestamp}] Checking if player exists in blockchain...`);
      await refetchPlayer();

      // Wait a bit for the refetch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Check if player exists
      const currentPlayer = useGameStore.getState().player;

      if (!currentPlayer) {
        console.log(`🆕 [${timestamp}] Player not found - spawning new player...`);

        // Spawn player with "none" as default name
        // The contract accepts a string directly (felt252)
        const txHash = await spawnPlayer(0); // Send 0 as placeholder for "none"

        if (!txHash) {
          throw new Error('Failed to spawn player on blockchain');
        }

        console.log(`✅ [${timestamp}] Player spawned! TX: ${txHash}`);

        // Wait for transaction to be processed
        toast.loading('Creating player on blockchain...', {
          duration: 3000
        });

        // Wait for blockchain to process
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Fetch the newly created player
        await refetchPlayer();

        toast.success('Player created successfully!', {
          description: 'Welcome to Bitwave!'
        });

      } else {
        console.log(`✅ [${timestamp}] Player found in blockchain`);
        console.log(`   👤 Name: ${currentPlayer.name}`);
        console.log(`   💰 Coin Balance: ${currentPlayer.coin_balance}`);

        toast.success('Welcome back!', {
          description: 'Player data loaded from blockchain'
        });
      }

      // Step 3: Load minigame scores
      console.log(`🎮 [${timestamp}] Loading minigame scores...`);
      await refetchScores();

      const scores = useGameStore.getState().minigameScores;
      const scoreCount = Object.keys(scores).length;
      console.log(`✅ [${timestamp}] Loaded ${scoreCount} minigame score(s)`);

      console.log(`🎉 [${timestamp}] PLAYER INITIALIZATION COMPLETE`);
      return true;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize player';
      console.error(`❌ [${timestamp}] Player initialization error:`, err);
      setError(errorMsg);

      toast.error('Failed to initialize player', {
        description: errorMsg
      });

      return false;

    } finally {
      setIsInitializing(false);
    }
  }, [aegisAccount, refetchPlayer, refetchScores, spawnPlayer, setAegisAuth]);

  return {
    initializePlayer,
    isInitializing,
    error
  };
}
