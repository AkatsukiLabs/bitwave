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

      // Get wallet data from Aegis SDK
      // For social login, aegisAccount.address is null, but we can get the wallet from getSocialWallet()
      let walletAddress: string | null = null;
      let userData: any = {};
      let walletData: any = {};

      // Try to get social wallet first
      try {
        const socialWallet = aegisAccount.getSocialWallet();
        if (socialWallet && socialWallet.wallet) {
          walletAddress = socialWallet.wallet.address;
          userData = {
            email: socialWallet.email,
            user_id: socialWallet.user_id,
            username: socialWallet.email?.split('@')[0] || walletAddress.slice(0, 10),
            organization: socialWallet.organization
          };
          walletData = {
            address: socialWallet.wallet.address,
            network: socialWallet.wallet.network
          };
          console.log(`✅ [${timestamp}] Social wallet detected:`, {
            email: socialWallet.email,
            address: walletAddress
          });
        }
      } catch (err) {
        console.warn('No social wallet found, trying regular address...');
      }

      // Fallback to regular aegisAccount.address (for in-app wallets)
      if (!walletAddress && aegisAccount?.address) {
        walletAddress = aegisAccount.address;
        userData = { username: walletAddress.slice(0, 10) };
        walletData = { address: walletAddress, network: 'mainnet' };
      }

      if (!walletAddress) {
        throw new Error('No wallet connected');
      }

      console.log(`🎮 [${timestamp}] INITIALIZING PLAYER`);
      console.log(`   💳 Wallet: ${walletAddress}`);

      // Update store with Aegis auth state
      setAegisAuth(userData, walletData);

      // Step 1: Try to fetch existing player from Torii
      console.log(`📡 [${timestamp}] Checking if player exists in blockchain...`);
      await refetchPlayer();

      // Wait a bit for the refetch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Check if player exists
      const currentPlayer = useGameStore.getState().player;

      if (!currentPlayer) {
        console.log(`🆕 [${timestamp}] Player not found - spawning new player...`);

        // Spawn player with "player" as default name (felt252)
        // The contract accepts a string directly
        const txHash = await spawnPlayer("player");

        if (!txHash) {
          throw new Error('Failed to spawn player on blockchain');
        }

        console.log(`✅ [${timestamp}] Player spawned! TX: ${txHash}`);

        // Show loading toast with specific ID
        const loadingToast = toast.loading('Creating player on blockchain...');

        // Wait for blockchain to process
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Fetch the newly created player
        await refetchPlayer();

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Show success toast
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
