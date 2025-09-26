import coinIcon from "@/assets/coin-icon.png";
import coinBag from "@/assets/coin-bag.png";
import safeIcon from "@/assets/safe-icon.png";
import starknetLogo from "@/assets/starknet-logo.png";
import { Button } from "@/components/ui/button";

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  icon: string;
}

const coinPackages: CoinPackage[] = [
  {
    id: "small",
    coins: 5,
    price: 50,
    icon: coinIcon,
  },
  {
    id: "medium",
    coins: 50,
    price: 100,
    icon: coinBag,
  },
  {
    id: "large",
    coins: 100,
    price: 200,
    icon: safeIcon,
  },
];

const Store = () => {
  return (
    <div className="max-w-md mx-auto">
      {/* Balance Display */}
      <div className="text-center mb-8">
        <p className="text-muted-foreground mb-2">Your balance</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold text-foreground">500</span>
          <img src={starknetLogo} alt="Starknet" className="w-8 h-8" />
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
                <p className="text-foreground font-bold">
                  {pkg.coins} coins
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-foreground">
                    {pkg.price}
                  </span>
                  <img src={starknetLogo} alt="Starknet" className="w-5 h-5" />
                </div>
              </div>
            </div>
            <Button
              variant="bitwave"
              className="font-bold"
            >
              Buy
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;