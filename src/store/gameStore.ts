import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, MinigameScore } from '@/dojo/models.gen';

/**
 * Zustand Store for Bitwave Gaming Platform
 * Manages global state for authentication, player data, and game stats
 */

// ==================== Types ====================

interface AegisUser {
  email?: string;
  user_id?: string;
  username?: string;
  organization?: string;
  created_at?: string;
  [key: string]: any;
}

interface AegisWallet {
  address: string;
  network?: string;
  [key: string]: any;
}

interface AegisAuthState {
  user: AegisUser | null;
  wallet: AegisWallet | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface GameStats {
  currentScore: number;
  totalKills: number;
  totalShots: number;
  accuracy: number;
  highScore: number;
}

// ==================== Store Interface ====================

interface GameStore {
  // Aegis Auth State
  aegis: AegisAuthState;
  setAegisAuth: (user: AegisUser | null, wallet: AegisWallet | null) => void;
  setAegisLoading: (loading: boolean) => void;
  setAegisError: (error: string | null) => void;
  clearAegisAuth: () => void;

  // Player State (from Torii)
  playerName: string;
  player: Player | null;
  setPlayerName: (name: string) => void;
  setPlayer: (player: Player | null) => void;

  // Game Stats (local/optimistic)
  gameStats: GameStats;
  updateGameStats: (stats: Partial<GameStats>) => void;
  resetGameStats: () => void;

  // Minigame Scores (from contracts)
  minigameScores: Record<number, MinigameScore>;
  setMinigameScore: (minigameId: number, score: MinigameScore) => void;

  // Transaction Management
  pendingTransactions: string[];
  addPendingTransaction: (txHash: string) => void;
  removePendingTransaction: (txHash: string) => void;

  // Leaderboard
  leaderboard: Player[];
  setLeaderboard: (players: Player[]) => void;
}

// ==================== Initial States ====================

const initialGameStats: GameStats = {
  currentScore: 0,
  totalKills: 0,
  totalShots: 0,
  accuracy: 0,
  highScore: 0
};

const initialAegisState: AegisAuthState = {
  user: null,
  wallet: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// ==================== Store Implementation ====================

const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ========== Aegis Auth State ==========
      aegis: initialAegisState,

      setAegisAuth: (user, wallet) => {
        set((state) => ({
          aegis: {
            ...state.aegis,
            user,
            wallet,
            isAuthenticated: !!(user && wallet),
            error: null
          }
        }));
      },

      setAegisLoading: (loading) => {
        set((state) => ({
          aegis: {
            ...state.aegis,
            loading
          }
        }));
      },

      setAegisError: (error) => {
        set((state) => ({
          aegis: {
            ...state.aegis,
            error,
            loading: false
          }
        }));
      },

      clearAegisAuth: () => {
        set((state) => ({
          aegis: initialAegisState,
          playerName: '',
          player: null,
          gameStats: initialGameStats,
          minigameScores: {}
        }));
      },

      // ========== Player State ==========
      playerName: '',
      player: null,

      setPlayerName: (name) => set({ playerName: name }),

      setPlayer: (player) => set({ player }),

      // ========== Game Stats ==========
      gameStats: initialGameStats,

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
            highScore: state.gameStats.highScore // Preserve high score
          }
        }));
      },

      // ========== Minigame Scores ==========
      minigameScores: {},

      setMinigameScore: (minigameId, score) => {
        set((state) => ({
          minigameScores: {
            ...state.minigameScores,
            [minigameId]: score
          }
        }));
      },

      // ========== Transaction Management ==========
      pendingTransactions: [],

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

      // ========== Leaderboard ==========
      leaderboard: [],

      setLeaderboard: (players) => set({ leaderboard: players })
    }),
    {
      name: 'bitwave-game-storage',
      // Only persist specific parts of the state
      partialize: (state) => ({
        aegis: {
          user: state.aegis.user,
          wallet: state.aegis.wallet,
          isAuthenticated: state.aegis.isAuthenticated
        },
        playerName: state.playerName,
        gameStats: {
          highScore: state.gameStats.highScore // Only persist high score
        }
      })
    }
  )
);

export default useGameStore;
