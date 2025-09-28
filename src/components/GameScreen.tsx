import { useEffect, useRef } from 'react';

interface GameScreenProps {
  playerName?: string;
}

export function GameScreen({ playerName = "Player" }: GameScreenProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<unknown>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    const initializeGame = async () => {
      if (initializingRef.current || gameInstanceRef.current) {
        console.log('🎮 Game initialization already in progress or completed, skipping');
        return;
      }

      if (gameContainerRef.current) {
        try {
          initializingRef.current = true;
          const { startGame } = await import('../game/duckhunt/main');
          const gameInstance = startGame(gameContainerRef.current, {
            playerName: playerName
          });

          if (gameInstance) {
            gameInstanceRef.current = gameInstance;
          } else {
            console.log('🎮 Game initialization skipped (already exists)');
          }
        } catch (error) {
          console.error('❌ Failed to initialize game:', error);
        } finally {
          initializingRef.current = false;
        }
      }
    };

    initializeGame();

    return () => {
      if (gameInstanceRef.current) {
        try {
          console.log('🧹 Cleaning up game instance');
          import('../game/duckhunt/main').then(({ destroyGame }) => {
            destroyGame();
          });
          gameInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up game:', error);
        }
      }
      initializingRef.current = false;
    };
  }, [playerName]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div
        ref={gameContainerRef}
        style={{
          width: '1024px',
          height: '896px',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      />
    </div>
  );
}