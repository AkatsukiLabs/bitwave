import { GameScreen } from "@/components/GameScreen";
import { useGameOver } from "@/hooks/dojo/useGameOver";

export default function DuckHunt() {
  const { handleGameOver } = useGameOver();

  const onGameOver = async (finalScore: number) => {
    await handleGameOver('DUCK_HUNT', finalScore);
  };

  return <GameScreen playerName="Hunter" gamePath="duckhunt" onGameOver={onGameOver} />;
}