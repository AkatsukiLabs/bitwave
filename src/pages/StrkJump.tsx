import { GameScreen } from "@/components/GameScreen";
import { useGameOver } from "@/hooks/dojo/useGameOver";

export default function StrkJump() {
  const { handleGameOver } = useGameOver();

  const onGameOver = async (finalScore: number) => {
    await handleGameOver('STRKJUMP', finalScore);
  };

  return <GameScreen playerName="Player" gamePath="starkjump" onGameOver={onGameOver} />;
}