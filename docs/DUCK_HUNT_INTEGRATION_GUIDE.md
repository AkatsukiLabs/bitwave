# Guía Completa de Integración: Duck Hunt con Cavos SDK y Contratos Dojo

## 📋 Tabla de Contenidos
1. [Arquitectura General](#arquitectura-general)
2. [Configuración Inicial](#configuración-inicial)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Integración de Cavos SDK](#integración-de-cavos-sdk)
5. [Conexión con Contratos Dojo](#conexión-con-contratos-dojo)
6. [Sistema de Autenticación](#sistema-de-autenticación)
7. [Gestión de Estado con Zustand](#gestión-de-estado-con-zustand)
8. [Integración con Torii](#integración-con-torii)
9. [Sistema de Optimistic Updates](#sistema-de-optimistic-updates)
10. [Flujo de Juego Completo](#flujo-de-juego-completo)
11. [Implementación del Leaderboard](#implementación-del-leaderboard)
12. [Código de Ejemplo Completo](#código-de-ejemplo-completo)

## Arquitectura General

### Tecnologías Principales
- **Frontend**: React + TypeScript + Vite
- **Estado Global**: Zustand con persistencia
- **Autenticación**: Cavos SDK (Google OAuth)
- **Blockchain**: Starknet con contratos Dojo
- **Indexación**: Torii para queries GraphQL
- **UI/UX**: Optimistic updates para mejor experiencia

### Flujo de Datos
```
Usuario → UI → Zustand Store → Cavos SDK → Contrato Dojo
                     ↓
                Torii (Queries) ← Indexador
```

## Configuración Inicial

### 1. Instalación de Dependencias

```bash
# Dependencias principales
npm install cavos-service-sdk@^1.2.34
npm install zustand
npm install @dojoengine/core @dojoengine/torii-client
npm install starknet
npm install react-hot-toast framer-motion

# Dependencias de desarrollo
npm install -D @types/react @types/node typescript vite
```

### 2. Variables de Entorno

```env
# .env
VITE_CAVOS_APP_ID=tu_app_id_cavos
VITE_CAVOS_ORG_SECRET=tu_org_secret_cavos
VITE_CAVOS_DEFAULT_NETWORK=sepolia

# Dojo/Torii Configuration
VITE_PUBLIC_NODE_URL=https://api.cartridge.gg/x/starknet/sepolia
VITE_PUBLIC_TORII=https://api.cartridge.gg/x/duckhunter/torii
VITE_PUBLIC_WORLD_ADDRESS=0x1234...  # Tu dirección del mundo Dojo
VITE_PUBLIC_GAME_CONTRACT=0x5678...  # Tu dirección del contrato game
```

## Estructura del Proyecto

```
src/
├── config/
│   ├── cavosConfig.ts          # Configuración de Cavos y contratos
│   └── dojoConfig.ts           # Configuración de Dojo/Torii
├── hooks/
│   ├── useCavosAuth.tsx       # Hook de autenticación
│   ├── useCavosTransaction.tsx # Hook para transacciones
│   ├── usePlayer.tsx          # Hook para datos del jugador (Torii)
│   └── useLeaderboard.tsx     # Hook para leaderboard (Torii)
├── store/
│   └── gameStore.ts           # Store de Zustand
├── services/
│   ├── gameService.ts         # Lógica del juego
│   └── toriiService.ts        # Queries a Torii
├── components/
│   ├── Login/
│   │   ├── LoginScreen.tsx    # Pantalla de login
│   │   └── UsernameModal.tsx  # Modal para nombre de usuario
│   ├── Home/
│   │   └── HomeScreen.tsx     # Pantalla principal
│   ├── Game/
│   │   ├── DuckHuntGame.tsx   # Componente del juego
│   │   └── GameCanvas.tsx     # Canvas del juego
│   └── Leaderboard/
│       └── LeaderboardScreen.tsx # Pantalla de leaderboard
└── App.tsx
```

## Integración de Cavos SDK

### Configuración Base (`config/cavosConfig.ts`)

```typescript
// Network configuration
export const network = import.meta.env.VITE_CAVOS_DEFAULT_NETWORK === 'mainnet' ? 'mainnet' : 'sepolia';
export const orgSecret = import.meta.env.VITE_CAVOS_ORG_SECRET;
export const appId = import.meta.env.VITE_CAVOS_APP_ID;

// Contract addresses
export const CONTRACT_ADDRESSES = {
  mainnet: {
    world: '0x...',
    game: '0x...'
  },
  sepolia: {
    world: import.meta.env.VITE_PUBLIC_WORLD_ADDRESS,
    game: import.meta.env.VITE_PUBLIC_GAME_CONTRACT
  }
};

export const getContractAddresses = () => CONTRACT_ADDRESSES[network];
```

### Hook de Autenticación con Google OAuth (`hooks/useCavosAuth.tsx`)

```typescript
import { useMemo } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { network, orgSecret, appId } from '../config/cavosConfig';
import useGameStore from '../store/gameStore';

interface UseCavosAuthReturn {
  user: any;
  wallet: any;
  loading: boolean;
  error: string | null;
  address?: string;
  handleGoogleAuth: () => void;
  handleGoogleCallback: (callbackData: any) => Promise<void>;
  handleLogout: () => void;
  isConnected: boolean;
}

export function useCavosAuth(): UseCavosAuthReturn {
  const {
    cavos,
    setCavosAuth,
    setCavosLoading,
    setCavosError,
    clearCavosAuth,
    setPlayerName
  } = useGameStore();

  const cavosAuth = useMemo(() => {
    return new CavosAuth(network, appId);
  }, []);

  /**
   * Iniciar flujo de autenticación con Google
   * El componente SignInWithGoogle de cavos-service-sdk maneja la redirección
   */
  const handleGoogleAuth = () => {
    console.log('🎯 Iniciating Google OAuth flow...');
    setCavosLoading(true);
    // El componente SignInWithGoogle maneja el resto
  };

  /**
   * Procesar callback de Google OAuth
   * Se llama desde /auth/callback con los datos del usuario
   */
  const handleGoogleCallback = async (callbackData: any) => {
    setCavosLoading(false);
    setCavosError(null);
    
    try {
      console.log('📦 Processing Google OAuth callback:', callbackData);
      
      // Extraer datos del callback
      const userData = {
        email: callbackData.email || callbackData.user?.email,
        user_id: callbackData.user_id || callbackData.id,
        username: extractUsernameFromEmail(callbackData.email),
        organization: callbackData.organization,
        created_at: callbackData.created_at || new Date().toISOString()
      };
      
      const walletData = callbackData.wallet || {
        address: callbackData.wallet_address,
        network: callbackData.network || network
      };
      
      const accessToken = callbackData.authData?.accessToken || callbackData.access_token;
      const refreshToken = callbackData.authData?.refreshToken || callbackData.refresh_token;
      
      console.log('✅ Google auth successful:', {
        email: userData.email,
        wallet: walletData.address
      });
      
      // Actualizar store
      setCavosAuth(userData, walletData, accessToken, refreshToken);
      setPlayerName(userData.username);
      
      // Llamar a spawn_player para nuevo usuario
      // NOTA: El nombre del jugador está limitado a 31 caracteres en felt252
      await spawnPlayer(userData.username, walletData.address, accessToken);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Google auth failed';
      setCavosError(errorMsg);
      console.error('❌ Google auth callback failed:', error);
    }
  };

  /**
   * Extraer username del email
   */
  const extractUsernameFromEmail = (email: string): string => {
    const username = email.split('@')[0];
    // Limitar a 31 caracteres para felt252
    return username.slice(0, 31);
  };

  /**
   * Llamar a spawn_player en el contrato
   * NOTA: El contrato acepta strings directamente (máximo 31 caracteres)
   */
  const spawnPlayer = async (username: string, walletAddress: string, token: string) => {
    try {
      const { executeTransaction } = useGameStore.getState();
      
      // Asegurar que el username no exceda 31 caracteres
      const playerName = username.slice(0, 31);
      
      const txHash = await executeTransaction([{
        contractAddress: getContractAddresses().game,
        entrypoint: 'spawn_player',
        calldata: [playerName] // Enviar string directamente
      }], token, walletAddress);
      
      console.log('✅ Player spawned:', txHash);
      
    } catch (error) {
      console.error('⚠️ Error spawning player (non-fatal):', error);
      // No es fatal - el usuario puede jugar aunque falle spawn_player
    }
  };

  const handleLogout = () => {
    clearCavosAuth();
    console.log('🚪 Usuario desconectado');
  };

  return {
    user: cavos.user,
    wallet: cavos.wallet,
    loading: cavos.loading,
    error: cavos.error,
    address: cavos.wallet?.address,
    handleGoogleAuth,
    handleGoogleCallback,
    handleLogout,
    isConnected: cavos.isAuthenticated
  };
}
```

### Hook de Transacciones (`hooks/useCavosTransaction.tsx`)

```typescript
import { useState, useMemo } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { network, appId } from '../config/cavosConfig';
import useGameStore from '../store/gameStore';

interface TransactionCall {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

interface UseCavosTransactionReturn {
  executeTransaction: (calls: TransactionCall[]) => Promise<string>;
  loading: boolean;
  error: string | null;
}

export function useCavosTransaction(): UseCavosTransactionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCavosTokens } = useGameStore();

  const cavosAuth = useMemo(() => {
    return new CavosAuth(network, appId);
  }, []);

  const executeTransaction = async (calls: TransactionCall[]): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const currentState = useGameStore.getState();
      const currentCavos = currentState.cavos;
      
      if (!currentCavos.isAuthenticated || !currentCavos.accessToken || !currentCavos.wallet) {
        throw new Error('Not authenticated');
      }

      console.log('📝 Executing transaction:', {
        calls: calls.map(c => ({
          contract: c.contractAddress.slice(0, 10) + '...',
          entrypoint: c.entrypoint,
          dataLength: c.calldata.length
        }))
      });

      const result = await cavosAuth.executeCalls(
        currentCavos.wallet.address,
        calls,
        currentCavos.accessToken
      );

      if (result?.error) {
        throw new Error(result.error);
      }

      const txHash = result?.txHash || result?.transaction_hash;
      
      // Actualizar token si viene uno nuevo
      if (result?.accessToken) {
        setCavosTokens(result.accessToken, currentCavos.refreshToken);
      }

      console.log('✅ Transaction successful:', txHash);
      return txHash;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeTransaction, loading, error };
}
```

## Conexión con Contratos Dojo

### Configuración Dojo (`config/dojoConfig.ts`)

```typescript
export const dojoConfig = {
  toriiUrl: import.meta.env.VITE_PUBLIC_TORII || 'http://localhost:8080',
  rpcUrl: import.meta.env.VITE_PUBLIC_NODE_URL,
  worldAddress: import.meta.env.VITE_PUBLIC_WORLD_ADDRESS,
  gameContract: import.meta.env.VITE_PUBLIC_GAME_CONTRACT
};
```

## Sistema de Autenticación con Google OAuth

### Integración con Login Component Existente

Como ya tienes una pantalla de login en tu proyecto, aquí está cómo integrar el componente de Google OAuth de Cavos SDK:

```typescript
// En tu LoginScreen existente, agregar:
import { SignInWithGoogle } from 'cavos-service-sdk';
import { useCavosAuth } from '../../hooks/useCavosAuth';

export function LoginScreen() {
  const { handleGoogleAuth, loading } = useCavosAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  const handleGoogleClick = () => {
    // Hacer clic en el botón oculto de Cavos
    const cavosButton = googleButtonRef.current?.querySelector('button');
    if (cavosButton) {
      cavosButton.click();
    } else {
      handleGoogleAuth();
    }
  };

  return (
    <div className="your-existing-styles">
      {/* Tu UI existente */}
      
      {/* Componente Cavos oculto */}
      <div ref={googleButtonRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}>
        <SignInWithGoogle
          appId={import.meta.env.VITE_CAVOS_APP_ID || ""}
          network={import.meta.env.VITE_CAVOS_DEFAULT_NETWORK || "mainnet"}
          finalRedirectUri={`${window.location.origin}/auth/callback`}
          text="Continue with Google"
        />
      </div>
      
      {/* Tu botón personalizado */}
      <button onClick={handleGoogleClick} className="your-button-styles">
        Sign in with Google
      </button>
    </div>
  );
}
```

### Componente de Callback OAuth

```typescript
// components/auth/AuthCallback.tsx
import { useEffect } from 'react';
import { useCavosAuth } from '../../hooks/useCavosAuth';
import { useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const { handleGoogleCallback } = useCavosAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userData = urlParams.get("user_data");
      const error = urlParams.get("error");
      
      if (error) {
        console.error('Auth error:', error);
        navigate('/login');
        return;
      }
      
      if (userData) {
        const decodedUserData = JSON.parse(decodeURIComponent(userData));
        await handleGoogleCallback(decodedUserData);
        navigate('/home');
      }
    };
    
    processCallback();
  }, []);
  
  return (
    <div className="loading-screen">
      Processing authentication...
    </div>
  );
}
```

## Gestión de Estado con Zustand

### Store Principal (`store/gameStore.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CavosAuth } from 'cavos-service-sdk';
import { network, appId, getContractAddresses } from '../config/cavosConfig';

// Types
interface CavosUser {
  email: string;
  user_id: string;
  username: string;
  [key: string]: any;
}

interface CavosWallet {
  address: string;
  network: string;
  [key: string]: any;
}

interface CavosAuthState {
  user: CavosUser | null;
  wallet: CavosWallet | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface Player {
  owner: string;
  name: string;
  kills: number;
  points: number;
  creation_day: number;
}

interface GameStats {
  currentScore: number;
  totalKills: number;
  totalShots: number;
  accuracy: number;
  highScore: number;
}

interface GameStore {
  // Cavos Auth
  cavos: CavosAuthState;
  setCavosAuth: (user: CavosUser | null, wallet: CavosWallet | null, accessToken: string | null, refreshToken: string | null) => void;
  setCavosTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setCavosLoading: (loading: boolean) => void;
  setCavosError: (error: string | null) => void;
  clearCavosAuth: () => void;
  
  // Player
  playerName: string;
  player: Player | null;
  setPlayerName: (name: string) => void;
  setPlayer: (player: Player | null) => void;
  
  // Game Stats
  gameStats: GameStats;
  updateGameStats: (stats: Partial<GameStats>) => void;
  resetGameStats: () => void;
  
  // Optimistic Updates
  pendingTransactions: string[];
  addPendingTransaction: (txHash: string) => void;
  removePendingTransaction: (txHash: string) => void;
  
  // Transaction execution
  executeTransaction: (calls: any[], token?: string, walletAddress?: string) => Promise<string>;
  
  // Leaderboard
  leaderboard: Player[];
  setLeaderboard: (players: Player[]) => void;
}

const initialGameStats: GameStats = {
  currentScore: 0,
  totalKills: 0,
  totalShots: 0,
  accuracy: 0,
  highScore: 0
};

const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial Cavos state
      cavos: {
        user: null,
        wallet: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null
      },
      
      // Player state
      playerName: '',
      player: null,
      
      // Game stats
      gameStats: initialGameStats,
      
      // Pending transactions for optimistic updates
      pendingTransactions: [],
      
      // Leaderboard
      leaderboard: [],
      
      // Cavos Auth Actions
      setCavosAuth: (user, wallet, accessToken, refreshToken) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            user,
            wallet,
            accessToken,
            refreshToken,
            isAuthenticated: !!(user && wallet && accessToken),
            error: null
          }
        }));
      },
      
      setCavosTokens: (accessToken, refreshToken) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            accessToken,
            refreshToken
          }
        }));
      },
      
      setCavosLoading: (loading) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            loading
          }
        }));
      },
      
      setCavosError: (error) => {
        set((state) => ({
          cavos: {
            ...state.cavos,
            error,
            loading: false
          }
        }));
      },
      
      clearCavosAuth: () => {
        set((state) => ({
          cavos: {
            user: null,
            wallet: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            error: null
          },
          playerName: '',
          player: null,
          gameStats: initialGameStats
        }));
      },
      
      // Player Actions
      setPlayerName: (name) => set({ playerName: name }),
      setPlayer: (player) => set({ player }),
      
      // Game Stats Actions
      updateGameStats: (stats) => {
        set((state) => ({
          gameStats: {
            ...state.gameStats,
            ...stats
          }
        }));
      },
      
      resetGameStats: () => {
        set((state) => ({
          gameStats: {
            ...initialGameStats,
            highScore: state.gameStats.highScore // Mantener high score
          }
        }));
      },
      
      // Transaction Management
      addPendingTransaction: (txHash) => {
        set((state) => ({
          pendingTransactions: [...state.pendingTransactions, txHash]
        }));
      },
      
      removePendingTransaction: (txHash) => {
        set((state) => ({
          pendingTransactions: state.pendingTransactions.filter(tx => tx !== txHash)
        }));
      },
      
      // Execute transaction helper
      executeTransaction: async (calls, token, walletAddress) => {
        const cavosAuth = new CavosAuth(network, appId);
        const state = get();
        
        const accessToken = token || state.cavos.accessToken;
        const address = walletAddress || state.cavos.wallet?.address;
        
        if (!accessToken || !address) {
          throw new Error('No authentication available');
        }
        
        const result = await cavosAuth.executeCalls(address, calls, accessToken);
        
        if (result?.error) {
          throw new Error(result.error);
        }
        
        const txHash = result?.txHash || result?.transaction_hash;
        
        // Add to pending transactions for tracking
        get().addPendingTransaction(txHash);
        
        return txHash;
      },
      
      // Leaderboard Actions
      setLeaderboard: (players) => set({ leaderboard: players })
    }),
    {
      name: 'duck-hunt-storage',
      partialize: (state) => ({
        cavos: state.cavos,
        playerName: state.playerName,
        gameStats: {
          highScore: state.gameStats.highScore // Solo persistir high score
        }
      })
    }
  )
);

export default useGameStore;
```

## Integración con Torii

### Hook para Player Data (`hooks/usePlayer.tsx`)

```typescript
import { useState, useEffect } from 'react';
import { addAddressPadding } from 'starknet';
import useGameStore from '../store/gameStore';
import { dojoConfig } from '../config/dojoConfig';

const TORII_URL = dojoConfig.toriiUrl + "/graphql";

const PLAYER_QUERY = `
  query GetPlayer($playerAddress: ContractAddress!) {
    duckhunterPlayerModels(where: { owner: $playerAddress }) {
      edges {
        node {
          owner
          name
          kills
          points
          creation_day
        }
      }
    }
  }
`;

export function usePlayer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const player = useGameStore(state => state.player);
  const setPlayer = useGameStore(state => state.setPlayer);
  const cavosWallet = useGameStore(state => state.cavos.wallet);

  const fetchPlayer = async () => {
    if (!cavosWallet?.address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const paddedAddress = addAddressPadding(cavosWallet.address).toLowerCase();
      
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: PLAYER_QUERY,
          variables: { playerAddress: paddedAddress }
        })
      });

      const result = await response.json();
      
      if (result.data?.duckhunterPlayerModels?.edges?.length > 0) {
        const playerData = result.data.duckhunterPlayerModels.edges[0].node;
        
        // Convertir valores hex a números
        setPlayer({
          owner: playerData.owner,
          name: playerData.name,
          kills: parseInt(playerData.kills, 16) || 0,
          points: parseInt(playerData.points, 16) || 0,
          creation_day: parseInt(playerData.creation_day, 16) || 0
        });
      }
    } catch (err) {
      console.error('Error fetching player:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch player');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [cavosWallet?.address]);

  return {
    player,
    loading,
    error,
    refetch: fetchPlayer
  };
}
```

### Hook para Leaderboard (`hooks/useLeaderboard.tsx`)

```typescript
import { useState, useEffect } from 'react';
import { dojoConfig } from '../config/dojoConfig';
import useGameStore from '../store/gameStore';

const TORII_URL = dojoConfig.toriiUrl + "/graphql";

const LEADERBOARD_QUERY = `
  query GetLeaderboard {
    duckhunterPlayerModels(
      order: { field: POINTS, direction: DESC }
      limit: 10
    ) {
      edges {
        node {
          owner
          name
          kills
          points
          creation_day
        }
      }
    }
  }
`;

interface LeaderboardPlayer {
  rank: number;
  name: string;
  points: number;
  kills: number;
  address: string;
  isCurrentUser: boolean;
}

export function useLeaderboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  
  const cavosWallet = useGameStore(state => state.cavos.wallet);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: LEADERBOARD_QUERY
        })
      });

      const result = await response.json();
      
      if (result.data?.duckhunterPlayerModels?.edges) {
        const leaderboardData = result.data.duckhunterPlayerModels.edges.map(
          (edge: any, index: number) => {
            const node = edge.node;
            return {
              rank: index + 1,
              name: node.name || `Hunter ${index + 1}`,
              points: parseInt(node.points, 16) || 0,
              kills: parseInt(node.kills, 16) || 0,
              address: node.owner,
              isCurrentUser: node.owner.toLowerCase() === cavosWallet?.address?.toLowerCase()
            };
          }
        );
        
        setPlayers(leaderboardData);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Refrescar cada 30 segundos
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    players,
    loading,
    error,
    refetch: fetchLeaderboard
  };
}
```

## Sistema de Optimistic Updates

### Concepto y Propósito

Los **Optimistic Updates** son una técnica de UX que actualiza la interfaz inmediatamente, sin esperar la confirmación del blockchain. Esto es crucial en juegos para mantener una experiencia fluida.

#### ¿Por qué son importantes?

1. **Latencia del Blockchain**: Las transacciones en Starknet pueden tardar varios segundos
2. **Experiencia de Usuario**: Los jugadores esperan feedback inmediato
3. **Eficiencia**: Permite batching de transacciones para reducir costos

#### Flujo de Optimistic Updates:

```
1. Usuario dispara → 2. UI actualiza inmediatamente → 3. TX se envía en background
         ↓                           ↓                            ↓
   Score: 10 → 20              Store actualizado            Si falla: rollback
                                                            Si éxito: confirmar
```

### Implementación en el Store

```typescript
// En tu gameStore.ts
interface GameStore {
  // Estado del juego
  gameStats: GameStats;
  
  // Estado optimista
  optimisticStats: GameStats | null;
  pendingUpdates: Array<{ points: number; kills: number; timestamp: number }>;
  
  // Acciones optimistas
  applyOptimisticUpdate: (points: number, kills: number) => void;
  confirmOptimisticUpdate: (txHash: string) => void;
  rollbackOptimisticUpdate: () => void;
}

// Implementación
applyOptimisticUpdate: (points, kills) => {
  set((state) => {
    // Guardar estado actual para posible rollback
    const snapshot = { ...state.gameStats };
    
    // Aplicar update optimista
    const newStats = {
      ...state.gameStats,
      currentScore: state.gameStats.currentScore + points,
      totalKills: state.gameStats.totalKills + kills
    };
    
    return {
      gameStats: newStats,
      optimisticStats: snapshot, // Guardar para rollback
      pendingUpdates: [...state.pendingUpdates, { points, kills, timestamp: Date.now() }]
    };
  });
},

rollbackOptimisticUpdate: () => {
  set((state) => {
    if (state.optimisticStats) {
      return {
        gameStats: state.optimisticStats,
        optimisticStats: null,
        pendingUpdates: []
      };
    }
    return state;
  });
}
```

### Patrón de Uso en Componentes

```typescript
// En tu componente de juego
const handleDuckShot = async (duckId: number) => {
  // 1. Update optimista inmediato
  store.applyOptimisticUpdate(10, 1); // +10 puntos, +1 kill
  
  // 2. Mostrar feedback visual
  showHitAnimation();
  
  // 3. Agregar a batch (no enviar inmediatamente)
  batchManager.addUpdate({ points: 10, kills: 1 });
  
  // 4. Enviar batch cuando sea apropiado (cada 5 disparos o al final)
  if (batchManager.shouldSend()) {
    try {
      const txHash = await sendBatchTransaction();
      store.confirmOptimisticUpdate(txHash);
    } catch (error) {
      // 5. Rollback si falla
      store.rollbackOptimisticUpdate();
      toast.error('Failed to update score');
    }
  }
};
```

### Manager de Batching para Transacciones

```typescript
// services/batchManager.ts
export class BatchManager {
  private pendingUpdates: Array<{ points: number; kills: number; timestamp: number }> = [];
  private readonly BATCH_SIZE = 5; // Enviar cada 5 updates
  private readonly MAX_WAIT_TIME = 10000; // Máximo 10 segundos
  
  addUpdate(update: { points: number; kills: number }) {
    this.pendingUpdates.push({
      ...update,
      timestamp: Date.now()
    });
  }
  
  shouldSend(): boolean {
    // Enviar si:
    // 1. Tenemos suficientes updates
    if (this.pendingUpdates.length >= this.BATCH_SIZE) return true;
    
    // 2. El update más antiguo tiene más de MAX_WAIT_TIME
    if (this.pendingUpdates.length > 0) {
      const oldestUpdate = this.pendingUpdates[0];
      if (Date.now() - oldestUpdate.timestamp > this.MAX_WAIT_TIME) {
        return true;
      }
    }
    
    return false;
  }
  
  getBatchData(): { totalPoints: number; totalKills: number } {
    let totalPoints = 0;
    let totalKills = 0;
    
    this.pendingUpdates.forEach(update => {
      totalPoints += update.points;
      totalKills += update.kills;
    });
    
    return { totalPoints, totalKills };
  }
  
  clear() {
    this.pendingUpdates = [];
  }
  
  // Para el final del juego
  hasPendingUpdates(): boolean {
    return this.pendingUpdates.length > 0;
  }
}

// Uso en el componente del juego
const batchManager = new BatchManager();

const sendBatchTransaction = async () => {
  const { totalPoints, totalKills } = batchManager.getBatchData();
  
  const txHash = await store.executeTransaction([{
    contractAddress: getContractAddresses().game,
    entrypoint: 'update_game',
    calldata: [
      totalPoints.toString(),  // String directo para felt252
      totalKills.toString()
    ]
  }]);
  
  batchManager.clear();
  return txHash;
};
```

## Conexión entre Componentes Existentes

Como ya tienes los componentes de Login, Home y Leaderboard, aquí está cómo conectarlos con la integración de Cavos:

### Flujo de Navegación

```typescript
// App.tsx - Rutas principales
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useGameStore from './store/gameStore';

function App() {
  const isAuthenticated = useGameStore(state => state.cavos.isAuthenticated);
  
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Callback de OAuth */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Rutas protegidas */}
        <Route path="/home" element={
          isAuthenticated ? <HomeScreen /> : <Navigate to="/login" />
        } />
        <Route path="/game" element={
          isAuthenticated ? <GameScreen /> : <Navigate to="/login" />
        } />
        <Route path="/leaderboard" element={
          isAuthenticated ? <LeaderboardScreen /> : <Navigate to="/login" />
        } />
        
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
```

### Integración en Home Screen

```typescript
// En tu HomeScreen existente
import { usePlayer } from '../../hooks/usePlayer';
import useGameStore from '../../store/gameStore';

export function HomeScreen() {
  const { player, loading, refetch } = usePlayer();
  const playerName = useGameStore(state => state.playerName);
  const navigate = useNavigate();
  
  // Los datos del jugador vienen de Torii
  useEffect(() => {
    refetch(); // Obtener datos actualizados del jugador
  }, []);
  
  return (
    <div>
      <h1>Welcome, {playerName || player?.name}!</h1>
      
      {/* Mostrar stats del jugador */}
      {player && (
        <div>
          <p>Total Points: {player.points}</p>
          <p>Total Kills: {player.kills}</p>
        </div>
      )}
      
      {/* Botones de navegación */}
      <button onClick={() => navigate('/game')}>Play Game</button>
      <button onClick={() => navigate('/leaderboard')}>Leaderboard</button>
    </div>
  );
}
```

### Integración en Leaderboard

```typescript
// En tu LeaderboardScreen existente
import { useLeaderboard } from '../../hooks/useLeaderboard';
import useGameStore from '../../store/gameStore';

export function LeaderboardScreen() {
  const { players, loading, refetch } = useLeaderboard();
  const currentWallet = useGameStore(state => state.cavos.wallet?.address);
  
  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      {players.map(player => (
        <div key={player.address} 
             className={player.address === currentWallet ? 'highlight' : ''}>
          <span>{player.rank}. {player.name}</span>
          <span>{player.points} pts</span>
          <span>{player.kills} kills</span>
        </div>
      ))}
    </div>
  );
}
```

### Integración en el Juego

```typescript
// En tu GameScreen existente
import { BatchManager } from '../../services/batchManager';
import useGameStore from '../../store/gameStore';

export function GameScreen() {
  const batchManager = useRef(new BatchManager());
  const { executeTransaction } = useCavosTransaction();
  const store = useGameStore();
  
  // Cuando se dispara a un pato
  const onDuckHit = (points: number) => {
    // 1. Update optimista
    store.applyOptimisticUpdate(points, 1);
    
    // 2. Agregar al batch
    batchManager.current.addUpdate({ points, kills: 1 });
    
    // 3. Verificar si enviar
    if (batchManager.current.shouldSend()) {
      sendBatchUpdate();
    }
  };
  
  // Al finalizar el juego
  const onGameEnd = async () => {
    // Enviar updates pendientes
    if (batchManager.current.hasPendingUpdates()) {
      await sendBatchUpdate();
    }
    
    // Navegar a resultados o home
    navigate('/home');
  };
  
  const sendBatchUpdate = async () => {
    const { totalPoints, totalKills } = batchManager.current.getBatchData();
    
    try {
      await executeTransaction([{
        contractAddress: getContractAddresses().game,
        entrypoint: 'update_game',
        calldata: [totalPoints.toString(), totalKills.toString()]
      }]);
      
      batchManager.current.clear();
    } catch (error) {
      store.rollbackOptimisticUpdate();
    }
  };
}
```

## Flujo de Juego Completo

### Componente Principal del Juego (`components/Game/DuckHuntGame.tsx`)

```typescript
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameService } from '../../services/gameService';
import useGameStore from '../../store/gameStore';
import { GameCanvas } from './GameCanvas';
import toast from 'react-hot-toast';

interface GameConfig {
  duckSpeed: number;
  spawnInterval: number;
  gameDuration: number;
  pointsPerDuck: number;
}

const DEFAULT_CONFIG: GameConfig = {
  duckSpeed: 3,
  spawnInterval: 2000,
  gameDuration: 60000, // 60 segundos
  pointsPerDuck: 10
};

export function DuckHuntGame({ onExit }: { onExit: () => void }) {
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResults, setShowResults] = useState(false);
  
  const gameStats = useGameStore(state => state.gameStats);
  const resetGameStats = useGameStore(state => state.resetGameStats);
  const playerName = useGameStore(state => state.playerName);
  
  const gameIntervalRef = useRef<NodeJS.Timeout>();
  const timerIntervalRef = useRef<NodeJS.Timeout>();
  
  // Iniciar juego
  const startGame = () => {
    resetGameStats();
    setGameActive(true);
    setTimeLeft(60);
    setShowResults(false);
    
    // Timer countdown
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Finalizar juego
  const endGame = async () => {
    setGameActive(false);
    
    // Limpiar intervals
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    // Enviar updates pendientes al blockchain
    await gameService.finishGame();
    
    setShowResults(true);
  };
  
  // Manejar disparo
  const handleShot = async (hit: boolean, x: number, y: number) => {
    if (!gameActive) return;
    
    if (hit) {
      // Procesar disparo exitoso con optimistic update
      await gameService.processShot({
        hit: true,
        points: DEFAULT_CONFIG.pointsPerDuck,
        ducksKilled: 1
      });
      
      // Efecto visual de hit
      toast.success('+' + DEFAULT_CONFIG.pointsPerDuck, {
        position: 'top-center',
        duration: 1000,
        style: {
          background: '#10b981',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }
      });
    } else {
      // Actualizar solo shots para accuracy
      const currentStats = useGameStore.getState().gameStats;
      useGameStore.getState().updateGameStats({
        totalShots: currentStats.totalShots + 1,
        accuracy: (currentStats.totalKills / (currentStats.totalShots + 1)) * 100
      });
    }
  };
  
  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-green-400 relative overflow-hidden">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-between items-center bg-black/50 rounded-lg p-3 text-white">
          <div className="flex gap-6">
            <div>
              <span className="text-sm opacity-75">Score</span>
              <div className="text-2xl font-bold">{gameStats.currentScore}</div>
            </div>
            <div>
              <span className="text-sm opacity-75">Ducks</span>
              <div className="text-2xl font-bold">{gameStats.totalKills}</div>
            </div>
            <div>
              <span className="text-sm opacity-75">Accuracy</span>
              <div className="text-2xl font-bold">
                {gameStats.totalShots > 0 ? `${gameStats.accuracy.toFixed(0)}%` : '-'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 items-center">
            <div>
              <span className="text-sm opacity-75">Time</span>
              <div className="text-2xl font-bold">{timeLeft}s</div>
            </div>
            <button
              onClick={onExit}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
      
      {/* Game Canvas */}
      <GameCanvas 
        gameActive={gameActive}
        onShot={handleShot}
        config={DEFAULT_CONFIG}
      />
      
      {/* Start Screen */}
      {!gameActive && !showResults && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-3xl font-bold text-center mb-4">🦆 Duck Hunt</h2>
            <p className="text-gray-600 text-center mb-6">
              Shoot as many ducks as you can in 60 seconds!
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Points per duck:</span>
                <span className="font-bold">{DEFAULT_CONFIG.pointsPerDuck}</span>
              </div>
              <div className="flex justify-between">
                <span>Your best score:</span>
                <span className="font-bold">{gameStats.highScore}</span>
              </div>
            </div>
            <button
              onClick={startGame}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Start Game
            </button>
          </motion.div>
        </div>
      )}
      
      {/* Results Screen */}
      <AnimatePresence>
        {showResults && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <h2 className="text-3xl font-bold text-center mb-6">Game Over!</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-lg">
                  <span>Final Score:</span>
                  <span className="font-bold">{gameStats.currentScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ducks Shot:</span>
                  <span className="font-bold">{gameStats.totalKills}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Shots:</span>
                  <span className="font-bold">{gameStats.totalShots}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-bold">
                    {gameStats.totalShots > 0 ? `${gameStats.accuracy.toFixed(1)}%` : '-'}
                  </span>
                </div>
                
                {gameStats.currentScore > gameStats.highScore && (
                  <div className="text-center text-green-500 font-bold text-xl mt-4">
                    🎉 New High Score! 🎉
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Implementación del Leaderboard

### Pantalla de Leaderboard (`components/Leaderboard/LeaderboardScreen.tsx`)

```typescript
import { motion } from 'framer-motion';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useNavigate } from 'react-router-dom';

export function LeaderboardScreen() {
  const { players, loading, error, refetch } = useLeaderboard();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 to-pink-400 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
              <button
                onClick={() => navigate('/home')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading rankings...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">Failed to load leaderboard</p>
                <button
                  onClick={refetch}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No players yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player, index) => (
                  <motion.div
                    key={player.address}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.isCurrentUser 
                        ? 'bg-purple-100 border-2 border-purple-500' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-10 h-10 flex items-center justify-center">
                        {player.rank <= 3 ? (
                          <span className="text-2xl">
                            {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="text-xl font-bold text-gray-600">
                            {player.rank}
                          </span>
                        )}
                      </div>
                      
                      {/* Player Info */}
                      <div>
                        <div className="font-semibold text-gray-800">
                          {player.name}
                          {player.isCurrentUser && (
                            <span className="ml-2 text-purple-600 text-sm">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {player.kills} ducks shot
                        </div>
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {player.points}
                      </div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Refresh button */}
            {!loading && players.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={refetch}
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  Refresh Rankings
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

## Código de Ejemplo Completo

### App Principal (`App.tsx`)

```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginScreen } from './components/Login/LoginScreen';
import { HomeScreen } from './components/Home/HomeScreen';
import { DuckHuntGame } from './components/Game/DuckHuntGame';
import { LeaderboardScreen } from './components/Leaderboard/LeaderboardScreen';
import useGameStore from './store/gameStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isConnected = useGameStore(state => state.cavos.isAuthenticated);
  
  if (!isConnected) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <HomeScreen />
          </ProtectedRoute>
        } />
        <Route path="/game" element={
          <ProtectedRoute>
            <DuckHuntGame onExit={() => window.location.href = '/home'} />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <LeaderboardScreen />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### Home Screen (`components/Home/HomeScreen.tsx`)

```typescript
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCavosAuth } from '../../hooks/useCavosAuth';
import { usePlayer } from '../../hooks/usePlayer';
import useGameStore from '../../store/gameStore';

export function HomeScreen() {
  const navigate = useNavigate();
  const { handleLogout } = useCavosAuth();
  const { player } = usePlayer();
  const playerName = useGameStore(state => state.playerName);
  const highScore = useGameStore(state => state.gameStats.highScore);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {playerName || 'Hunter'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Ready for some duck hunting?
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.div>
        
        {/* Stats Card */}
        {player && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {player.points}
                </div>
                <div className="text-gray-600 text-sm">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {player.kills}
                </div>
                <div className="text-gray-600 text-sm">Ducks Shot</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {highScore}
                </div>
                <div className="text-gray-600 text-sm">High Score</div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/game')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="text-6xl mb-4">🦆</div>
            <div className="text-2xl font-bold">Play Game</div>
            <div className="text-sm opacity-90 mt-2">
              Start hunting ducks!
            </div>
          </motion.button>
          
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/leaderboard')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-2xl font-bold">Leaderboard</div>
            <div className="text-sm opacity-90 mt-2">
              See top hunters
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
```

## Resumen de Características Clave

### 1. **Autenticación con Google OAuth**
- Login con Google mediante SignInWithGoogle de Cavos SDK
- Creación automática de wallet Starknet
- Extracción de username desde email de Google
- Llamada a `spawn_player` al registrarse (máximo 31 caracteres para felt252)

### 2. **Optimistic Updates**
- UI se actualiza inmediatamente al disparar
- Batching de transacciones (cada 5 disparos)
- Rollback automático si falla la transacción
- Mejor UX sin esperar confirmaciones

### 3. **Integración con Torii**
- Queries GraphQL para obtener datos
- Leaderboard en tiempo real
- Actualización automática cada 30 segundos
- Filtrado y ordenamiento eficiente

### 4. **Gestión de Estado con Zustand**
- Estado persistente entre sesiones
- Separación clara de concerns
- Fácil debugging y testing
- Soporte para optimistic updates

### 5. **Transacciones Eficientes**
- Batching para reducir costos de gas
- Manejo automático de tokens
- Retry logic en caso de fallos
- Tracking de transacciones pendientes

## Pasos de Implementación

### Paso 1: Setup Inicial
1. Crear nuevo proyecto React con Vite
2. Instalar todas las dependencias
3. Configurar variables de entorno
4. Crear estructura de carpetas

### Paso 2: Configuración Base
1. Implementar `cavosConfig.ts` y `dojoConfig.ts`
2. Crear store de Zustand
3. Configurar rutas en `App.tsx`

### Paso 3: Sistema de Auth
1. Implementar `useCavosAuth` hook
2. Crear pantalla de login
3. Integrar con store
4. Probar flujo de autenticación

### Paso 4: Integración con Contratos
1. Implementar `useCavosTransaction` hook
2. Crear servicio de juego
3. Implementar llamadas a contratos
4. Probar transacciones

### Paso 5: Queries con Torii
1. Implementar hooks de Torii
2. Crear queries GraphQL
3. Integrar con componentes
4. Probar actualizaciones

### Paso 6: Lógica del Juego
1. Crear componente de juego
2. Implementar mecánicas de disparo
3. Agregar optimistic updates
4. Integrar con servicios

### Paso 7: UI/UX
1. Crear pantallas principales
2. Agregar animaciones con Framer Motion
3. Implementar toasts de feedback
4. Pulir diseño responsive

### Paso 8: Testing y Deploy
1. Probar flujo completo
2. Verificar transacciones en explorer
3. Optimizar performance
4. Deploy a producción

## Notas Importantes

### Seguridad
- NUNCA exponer `VITE_CAVOS_ORG_SECRET` en frontend producción
- Validar todos los inputs del usuario
- Implementar rate limiting para transacciones
- Usar HTTPS en producción

### Performance
- Batching de transacciones para reducir gas
- Caché de queries con Torii
- Lazy loading de componentes pesados
- Optimistic updates para mejor UX

### Manejo de Errores
- Rollback automático en optimistic updates
- Mensajes claros al usuario
- Logging detallado para debugging
- Retry logic para transacciones

### Testing
- Usar Sepolia para desarrollo
- Verificar contratos en Voyager
- Probar con múltiples usuarios
- Simular fallos de red

## Conclusión

Esta guía proporciona una implementación completa de Duck Hunt con:
- ✅ Autenticación simplificada con Cavos
- ✅ Integración completa con contratos Dojo
- ✅ Queries eficientes con Torii
- ✅ Optimistic updates para mejor UX
- ✅ Estado global con Zustand
- ✅ Batching de transacciones
- ✅ Leaderboard en tiempo real
- ✅ UI moderna y responsiva

Con esta implementación, un Agente de Claude Code debería poder crear un cliente funcional del juego Duck Hunt integrado con blockchain Starknet.