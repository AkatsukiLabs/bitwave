import { useState } from "react";
import { getContractAddresses } from "@/config/cavosConfig";
import { toast } from "sonner";
import useGameStore from "@/store/gameStore";
import { useAegis } from "@cavos/aegis";
import { network } from "@/config/cavosConfig";

/**
 * Hook to update player scores (highest and total)
 * Contracts:
 * - game::update_player_highest_score(minigame_id: u32, highest_score: u32)
 * - game::update_player_total_score(minigame_id: u32, score: u32)
 */

export interface UseUpdateScoresReturn {
  updateHighestScore: (
    minigameId: number,
    highestScore: number
  ) => Promise<string | null>;
  updateTotalScore: (
    minigameId: number,
    score: number
  ) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useUpdateScores(): UseUpdateScoresReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { aegisAccount } = useAegis();
  const contractAddresses = getContractAddresses();
  const {
    setMinigameScore,
    minigameScores,
    aegis,
    addPendingTransaction,
    removePendingTransaction,
  } = useGameStore();

  const updateHighestScore = async (
    minigameId: number,
    highestScore: number
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log("🏆 Updating highest score:", { minigameId, highestScore });

      // Check authentication
      if (!aegis.isAuthenticated || !aegis.wallet?.address) {
        throw new Error("Not authenticated. Please log in first.");
      }

      // Check if aegisAccount is available
      if (!aegisAccount) {
        throw new Error("Aegis account not initialized.");
      }

      // Check if this is actually a new high score
      const currentScore = minigameScores[minigameId];
      if (currentScore && highestScore <= currentScore.highest_score) {
        console.log(
          "⚠️ Score not higher than current high score, skipping transaction"
        );
        return null;
      }

      // Execute transaction
      const result = await aegisAccount.execute(
        contractAddresses.game,
        "update_player_highest_score",
        [minigameId.toString(), highestScore.toString()]
      );

      const txHash = result?.transactionHash;

      if (!txHash || typeof txHash !== "string") {
        throw new Error("No valid transaction hash returned.");
      }

      console.log("✅ Highest score updated:", txHash);

      // Add to pending transactions
      addPendingTransaction(txHash);

      // Update local store optimistically
      setMinigameScore(minigameId, {
        ...currentScore,
        player_address: currentScore?.player_address || "",
        minigame_id: minigameId,
        highest_score: highestScore,
        total_score: currentScore?.total_score || 0,
      });

      // Explorer URL
      const explorerUrl =
        network === "SN_MAINNET"
          ? `https://voyager.online/tx/${txHash}`
          : `https://sepolia.voyager.online/tx/${txHash}`;

      toast.success("New high score!", {
        description: `Score: ${highestScore}`,
        action: {
          label: "View",
          onClick: () => window.open(explorerUrl, "_blank"),
        },
      });

      // Remove from pending after delay
      setTimeout(() => removePendingTransaction(txHash), 30000);

      return txHash;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update highest score";
      setError(msg);
      console.error("❌ Update highest score error:", err);
      toast.error("Failed to update score", { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTotalScore = async (
    minigameId: number,
    score: number
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Updating total score:", { minigameId, score });

      // Check authentication
      if (!aegis.isAuthenticated || !aegis.wallet?.address) {
        throw new Error("Not authenticated. Please log in first.");
      }

      // Check if aegisAccount is available
      if (!aegisAccount) {
        throw new Error("Aegis account not initialized.");
      }

      await aegisAccount.recoverSession();

      // Execute transaction
      const result = await aegisAccount.execute(
        contractAddresses.game,
        "update_player_total_score",
        [minigameId.toString(), score.toString()]
      );

      const txHash = result?.transactionHash;

      if (!txHash || typeof txHash !== "string") {
        throw new Error("No valid transaction hash returned.");
      }

      console.log("✅ Total score updated:", txHash);

      // Add to pending transactions
      addPendingTransaction(txHash);

      // Update local store optimistically
      const currentScore = minigameScores[minigameId];
      setMinigameScore(minigameId, {
        ...currentScore,
        player_address: currentScore?.player_address || "",
        minigame_id: minigameId,
        highest_score: currentScore?.highest_score || 0,
        total_score: (currentScore?.total_score || 0) + score,
      });

      // Explorer URL
      const explorerUrl =
        network === "SN_MAINNET"
          ? `https://voyager.online/tx/${txHash}`
          : `https://sepolia.voyager.online/tx/${txHash}`;

      toast.success("Score updated!", {
        action: {
          label: "View",
          onClick: () => window.open(explorerUrl, "_blank"),
        },
      });

      // Remove from pending after delay
      setTimeout(() => removePendingTransaction(txHash), 30000);

      return txHash;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update total score";
      setError(msg);
      console.error("❌ Update total score error:", err);
      toast.error("Failed to update score", { description: msg });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateHighestScore, updateTotalScore, loading, error };
}
