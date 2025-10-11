import duckHunt from "@/assets/duck-hunt.jpg";
import snakeCover from "@/assets/snake-cover.png";
import asteroidsCover from "@/assets/asteroids-cover.png";
import tetris from "@/assets/tetris.jpg";
import starkjumpCover from "@/assets/starkjump-cover.png";
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
    id: "asteroids",
    title: "Asteroids",
    year: "(1979)",
    image: asteroidsCover,
  },
  {
    id: "tetris",
    title: "Tetris",
    year: "(1999)",
    image: tetris,
  },
  {
    id: "strkjump",
    title: "StrkJump",
    year: "(2024)",
    image: starkjumpCover,
  },
];

const Home = () => {
  const handleGameClick = (gameId: string) => {
    if (gameId === "duck-hunt") {
      window.location.href = "/duck-hunt";
    } else if (gameId === "snake") {
      window.location.href = "/snake";
    } else if (gameId === "asteroids") {
      window.location.href = "/asteroids";
    } else if (gameId === "strkjump") {
      window.location.href = "/strkjump";
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
