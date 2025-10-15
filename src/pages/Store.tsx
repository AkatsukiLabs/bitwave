import coinIcon from "@/assets/coin-icon.png";
import coinBag from "@/assets/coin-bag.png";
import safeIcon from "@/assets/safe-icon.png";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/hooks/usePlayer";
import { useAddCoins } from "@/hooks/dojo/useAddCoins";
import { useAegisAuth } from "@/hooks/useAegisAuth";
import { depositVesu } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

interface CoinPackage {
  id: string;
  coins: number;
  price: string;
  icon: string;
}

const coinPackages: CoinPackage[] = [
  {
    id: "small",
    coins: 25,
    price: "0.00001",
    icon: coinIcon,
  },
  {
    id: "medium",
    coins: 50,
    price: "0.0001",
    icon: coinBag,
  },
  {
    id: "large",
    coins: 100,
    price: "0.001",
    icon: safeIcon,
  },
];

const Store = () => {
  const { player, loading, refetch } = usePlayer();
  const { addCoins, loading: addingCoins } = useAddCoins();
  const { aegisAccount } = useAegisAuth();
  const [buyingPackage, setBuyingPackage] = useState<string | null>(null);

  const handleBuyCoins = async (pkg: CoinPackage) => {
    await aegisAccount.recoverSession();
    if (!aegisAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    setBuyingPackage(pkg.id);

    try {
      // Step 1: Create Vesu position by depositing WBTC
      const btcAmount = parseFloat(pkg.price);
      toast.loading("Creating Vesu position...", { id: "vesu-position" });

      const vesuTxHash = await depositVesu(aegisAccount, btcAmount);

      if (!vesuTxHash) {
        throw new Error("Failed to create Vesu position");
      }

      toast.success("Vesu position created successfully!", {
        id: "vesu-position",
      });

      // Step 2: Add coins to player balance
      toast.loading("Adding coins to your balance...", { id: "add-coins" });

      const coinTxHash = await addCoins(pkg.coins);

      if (!coinTxHash) {
        throw new Error("Failed to add coins to balance");
      }

      toast.success(`Successfully purchased ${pkg.coins} coins!`, {
        id: "add-coins",
      });

      // Step 3: Refresh player data to show updated balance
      await refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to purchase coins";
      console.error("Buy coins error:", error);
      toast.error(errorMessage);
    } finally {
      setBuyingPackage(null);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Balance Display */}
      <div className="text-center mb-8">
        <p className="text-muted-foreground mb-2">Your balance</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold text-foreground">
            {loading ? "..." : player?.coin_balance ?? 0}
          </span>
          <span className="text-xl text-muted-foreground">coins</span>
        </div>
      </div>

      {/* Coin Packages */}
      <div className="space-y-4">
        {coinPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="game-card rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={pkg.icon}
                  alt={`${pkg.coins} coins`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-foreground font-bold">{pkg.coins} coins</p>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-foreground">
                    {pkg.price}
                  </span>
                  <span className="text-sm text-muted-foreground">BTC</span>
                </div>
              </div>
            </div>
            <Button
              variant="bitwave"
              className="font-bold"
              onClick={() => handleBuyCoins(pkg)}
              disabled={buyingPackage === pkg.id || addingCoins || loading}
            >
              {buyingPackage === pkg.id ? "Processing..." : "Buy"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;
