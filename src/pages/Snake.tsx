import { GameScreen } from "@/components/GameScreen";
import { useGameOver } from "@/hooks/dojo/useGameOver";

export default function Snake() {
  const { handleGameOver } = useGameOver();

  const onGameOver = async (finalScore: number) => {
    await handleGameOver('SNAKE', finalScore);
  };

  return <GameScreen playerName="Player" gamePath="snake" onGameOver={onGameOver} />;
}
