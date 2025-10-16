import { useState } from 'react';
import { useAegis } from '@cavos/aegis';
import useGameStore from '@/store/gameStore';
import { getContractAddresses, network } from '@/config/cavosConfig';
import { toast } from 'sonner';

/**
 * Hook to manage player coin balance
 * Contracts:
 * - game::increase_player_coin_balance(amount: u256)
 * - game::decrease_player_coin_balance(amount: u256)
 */

export interface UseManageCoinsReturn {
  increaseCoins: (amount: number) => Promise<string | null>;
  decreaseCoins: (amount: number) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useManageCoins(): UseManageCoinsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { aegisAccount } = useAegis();
  const { addPendingTransaction, removePendingTransaction } = useGameStore();
  const contractAddresses = getContractAddresses();

  const increaseCoins = async (amount: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!aegisAccount) {
        throw new Error('Aegis account not initialized');
      }

      // Verify we have wallet address (either from social wallet or in-app wallet)
      let walletAddress: string | null = null;
      try {
        const socialWallet = aegisAccount.getSocialWallet();
        if (socialWallet?.wallet?.address) {
          walletAddress = socialWallet.wallet.address;
        }
      } catch (err) {
        // No social wallet, try regular address
      }

      if (!walletAddress && aegisAccount.address) {
        walletAddress = aegisAccount.address;
      }

      if (!walletAddress) {
        throw new Error('No wallet address found. Please log in first.');
      }

      console.log('💰 Increasing coin balance:', amount);

      // Validate amount
      if (amount <= 0 || !Number.isInteger(amount)) {
        throw new Error('Amount must be a positive integer');
      }

      const result = await aegisAccount.execute(
        contractAddresses.game,
        'increase_player_coin_balance',
        [amount.toString()]
      );

      const txHash = result?.transactionHash;
      if (!txHash || typeof txHash !== 'string') {
        throw new Error('No valid transaction hash returned');
      }

      console.log('✅ Coins increased:', txHash);
      addPendingTransaction(txHash);

      const explorerUrl = network === 'SN_MAINNET'
        ? `https://voyager.online/tx/${txHash}`
        : `https://sepolia.voyager.online/tx/${txHash}`;

      toast.success(`+${amount} coins!`, {
        action: {
          label: 'View',
          onClick: () => window.open(explorerUrl, '_blank')
        }
      });

      setTimeout(() => removePendingTransaction(txHash), 30000);

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to increase coins';
      setError(msg);
      console.error('❌ Failed to increase coins:', err);
      toast.error('Failed to increase coins', { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const decreaseCoins = async (amount: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!aegisAccount) {
        throw new Error('Aegis account not initialized');
      }

      // Verify we have wallet address (either from social wallet or in-app wallet)
      let walletAddress: string | null = null;
      try {
        const socialWallet = aegisAccount.getSocialWallet();
        if (socialWallet?.wallet?.address) {
          walletAddress = socialWallet.wallet.address;
        }
      } catch (err) {
        // No social wallet, try regular address
      }

      if (!walletAddress && aegisAccount.address) {
        walletAddress = aegisAccount.address;
      }

      if (!walletAddress) {
        throw new Error('No wallet address found. Please log in first.');
      }

      console.log('💸 Decreasing coin balance:', amount);

      // Validate amount
      if (amount <= 0 || !Number.isInteger(amount)) {
        throw new Error('Amount must be a positive integer');
      }

      const result = await aegisAccount.execute(
        contractAddresses.game,
        'decrease_player_coin_balance',
        [amount.toString()]
      );

      const txHash = result?.transactionHash;
      if (!txHash || typeof txHash !== 'string') {
        throw new Error('No valid transaction hash returned');
      }

      console.log('✅ Coins decreased:', txHash);
      addPendingTransaction(txHash);

      const explorerUrl = network === 'SN_MAINNET'
        ? `https://voyager.online/tx/${txHash}`
        : `https://sepolia.voyager.online/tx/${txHash}`;

      toast.success(`-${amount} coins`, {
        action: {
          label: 'View',
          onClick: () => window.open(explorerUrl, '_blank')
        }
      });

      setTimeout(() => removePendingTransaction(txHash), 30000);

      return txHash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to decrease coins';
      setError(msg);
      console.error('❌ Failed to decrease coins:', err);
      toast.error('Failed to decrease coins', { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { increaseCoins, decreaseCoins, loading, error };
}
