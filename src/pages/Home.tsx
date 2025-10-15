import duckHunt from "@/assets/duck-hunt.jpg";
import snakeCover from "@/assets/snake-cover.png";
import asteroidsCover from "@/assets/asteroids-cover.png";
import starkjumpLogo from "/graphics/starkjump.png";
import coinIcon from "@/assets/coin-icon.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { useManageCoins } from "@/hooks/dojo/useManageCoins";
import { toast } from "sonner";
import { useState } from "react";

interface Game {
  id: string;
  title: string;
  year: string;
  image: string;
  cost: number;
}

const games: Game[] = [
  {
    id: "duck-hunt",
    title: "Duck Hunt",
    year: "(1998)",
    image: duckHunt,
    cost: 5,
  },
  {
    id: "snake",
    title: "Snake",
    year: "(1976)",
    image: snakeCover,
    cost: 5,
  },
  {
    id: "asteroids",
    title: "Asteroids",
    year: "(1979)",
    image: asteroidsCover,
    cost: 5,
  },
  {
    id: "strkjump",
    title: "StrkJump",
    year: "(2024)",
    image: starkjumpLogo,
    cost: 10,
  },
];

const Home = () => {
  const { player, refetch } = usePlayer();
  const { decreaseCoins, loading } = useManageCoins();
  const [processingGame, setProcessingGame] = useState<string | null>(null);

  const handleGameClick = async (game: Game) => {
    if (loading || processingGame) return;

    const currentBalance = player?.coin_balance ?? 0;

    // Check if player has enough coins
    if (currentBalance < game.cost) {
      toast.error("Not enough coins!", {
        description: `You need ${game.cost} coins to play ${game.title}. Visit the Store to buy more.`
      });
      return;
    }

    setProcessingGame(game.id);

    try {
      // Decrease coins
      const txHash = await decreaseCoins(game.cost);

      if (txHash) {
        // Optimistic update - refresh player data
        await refetch();

        // Navigate to game
        if (game.id === "duck-hunt") {
          window.location.href = "/duck-hunt";
        } else if (game.id === "snake") {
          window.location.href = "/snake";
        } else if (game.id === "asteroids") {
          window.location.href = "/asteroids";
        } else if (game.id === "strkjump") {
          window.location.href = "/strkjump";
        }
      }
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setProcessingGame(null);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Balance Display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <img src={coinIcon} alt="Coins" className="w-6 h-6" />
          <span className="text-2xl font-bold text-foreground">
            {player?.coin_balance ?? 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {games.map((game) => (
          <div
            key={game.id}
            className={`game-card rounded-lg p-4 cursor-pointer transition-opacity ${
              processingGame === game.id ? "opacity-50" : ""
            }`}
            onClick={() => handleGameClick(game)}
          >
            <div className="aspect-square rounded-md overflow-hidden mb-3">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-foreground font-bold text-sm mb-1 leading-tight">
              {game.title}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">{game.year}</p>
              <div className="flex items-center gap-1">
                <img src={coinIcon} alt="Cost" className="w-4 h-4" />
                <span className="text-foreground text-xs font-bold">
                  {game.cost}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works link */}
      <div className="text-center">
        <Link to="/how-it-works">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-bitwave-orange"
          >
            <HelpCircle size={16} />
            How it works?
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
