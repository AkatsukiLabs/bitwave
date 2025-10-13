import { GameScreen } from "@/components/GameScreen";
import { useGameOver } from "@/hooks/dojo/useGameOver";

export default function Asteroids() {
  const { handleGameOver } = useGameOver();

  const onGameOver = async (finalScore: number) => {
    await handleGameOver('ASTEROIDS', finalScore);
  };

  return <GameScreen playerName="Player" gamePath="asteroids" onGameOver={onGameOver} />;
}
