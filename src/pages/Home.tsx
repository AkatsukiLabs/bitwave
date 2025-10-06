import doom from "@/assets/doom.jpg";
import duckHunt from "@/assets/duck-hunt.jpg";
import snakeCover from "@/assets/snake-cover.png";
import tetris from "@/assets/tetris.jpg";
import starknetLogo from "@/assets/starknet-logo.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";

interface Game {
  id: string;
  title: string;
  year: string;
  image: string;
}

const games: Game[] = [
  {
    id: "duck-hunt",
    title: "Duck Hunt",
    year: "(1998)",
    image: duckHunt,
  },
  {
    id: "snake",
    title: "Snake",
    year: "(1976)",
    image: snakeCover,
  },
  {
    id: "double-jump",
    title: "Stark Jump",
    year: "(2024)",
    image: starknetLogo,
  },
  {
    id: "doom",
    title: "DOOM",
    year: "(1998)",
    image: doom,
  },
  {
    id: "tetris",
    title: "Tetris",
    year: "(1999)",
    image: tetris,
  },
];

const Home = () => {
  const handleGameClick = (gameId: string) => {
    if (gameId === "duck-hunt") {
      window.location.href = "/duck-hunt";
    } else if (gameId === "snake") {
      window.location.href = "/snake";
    } else if (gameId === "double-jump") {
      window.location.href = "/double-jump";
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-4 mb-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card rounded-lg p-4 cursor-pointer"
            onClick={() => handleGameClick(game.id)}
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
            <p className="text-muted-foreground text-xs">{game.year}</p>
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
