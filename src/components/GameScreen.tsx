import { useEffect, useRef, useState } from 'react';

interface GameScreenProps {
  playerName?: string;
  gamePath?: string;
}

export function GameScreen({ playerName = "Player", gamePath = "duckhunt" }: GameScreenProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<unknown>(null);
  const initializingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeGame = async () => {
      if (initializingRef.current || gameInstanceRef.current) {
        console.log('🎮 Game initialization already in progress or completed, skipping');
        return;
      }

      if (gameContainerRef.current) {
        try {
          initializingRef.current = true;
          const { startGame } = await import(`../game/${gamePath}/main`);
          const gameInstance = startGame(gameContainerRef.current, {
            playerName: playerName
          });

          if (gameInstance) {
            gameInstanceRef.current = gameInstance;
            // Hide loading spinner after game starts
            setTimeout(() => setIsLoading(false), 500);
          } else {
            console.log('🎮 Game initialization skipped (already exists)');
            setIsLoading(false);
          }
        } catch (error) {
          console.error('❌ Failed to initialize game:', error);
          setIsLoading(false);
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
          import(`../game/${gamePath}/main`).then(({ destroyGame }) => {
            destroyGame();
          });
          gameInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up game:', error);
        }
      }
      initializingRef.current = false;
    };
  }, [playerName, gamePath]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Loading spinner */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #333',
            borderTop: '5px solid #4ade80',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <div
        ref={gameContainerRef}
        style={{
          width: '1024px',
          height: '896px',
          maxWidth: '100vw',
          maxHeight: '100vh',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
}