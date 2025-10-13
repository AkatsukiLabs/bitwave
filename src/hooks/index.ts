/**
 * Central exports for all custom hooks
 */

// Auth hooks
export { useAegisAuth } from './useAegisAuth';

// Player hooks
export { usePlayer } from './usePlayer';
export type { UsePlayerReturn } from './usePlayer';

export { useMinigameScores } from './useMinigameScores';
export type { UseMinigameScoresReturn } from './useMinigameScores';

export { usePlayerInitialization } from './usePlayerInitialization';
export type { UsePlayerInitializationReturn } from './usePlayerInitialization';

// Transaction hooks
export { useCavosTransaction } from './useCavosTransaction';
export type { UseCavosTransactionReturn, TransactionCall } from './useCavosTransaction';

// Dojo contract hooks
export * from './dojo';
