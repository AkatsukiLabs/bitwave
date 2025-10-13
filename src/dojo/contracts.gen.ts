import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_game_decreasePlayerCoinBalance_calldata = (amount: number): DojoCall => {
		return {
			contractName: "game",
			entrypoint: "decrease_player_coin_balance",
			calldata: [amount],
		};
	};

	const game_decreasePlayerCoinBalance = async (snAccount: Account | AccountInterface, amount: number) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_decreasePlayerCoinBalance_calldata(amount),
				"bitwave",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_increasePlayerCoinBalance_calldata = (amount: number): DojoCall => {
		return {
			contractName: "game",
			entrypoint: "increase_player_coin_balance",
			calldata: [amount],
		};
	};

	const game_increasePlayerCoinBalance = async (snAccount: Account | AccountInterface, amount: number) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_increasePlayerCoinBalance_calldata(amount),
				"bitwave",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_spawnPlayer_calldata = (playerName: number): DojoCall => {
		return {
			contractName: "game",
			entrypoint: "spawn_player",
			calldata: [playerName],
		};
	};

	const game_spawnPlayer = async (snAccount: Account | AccountInterface, playerName: number) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_spawnPlayer_calldata(playerName),
				"bitwave",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_updatePlayerHighestScore_calldata = (minigameId: number, highestScore: number): DojoCall => {
		return {
			contractName: "game",
			entrypoint: "update_player_highest_score",
			calldata: [minigameId, highestScore],
		};
	};

	const game_updatePlayerHighestScore = async (snAccount: Account | AccountInterface, minigameId: number, highestScore: number) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_updatePlayerHighestScore_calldata(minigameId, highestScore),
				"bitwave",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_updatePlayerTotalScore_calldata = (minigameId: number, score: number): DojoCall => {
		return {
			contractName: "game",
			entrypoint: "update_player_total_score",
			calldata: [minigameId, score],
		};
	};

	const game_updatePlayerTotalScore = async (snAccount: Account | AccountInterface, minigameId: number, score: number) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_updatePlayerTotalScore_calldata(minigameId, score),
				"bitwave",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	return {
		game: {
			decreasePlayerCoinBalance: game_decreasePlayerCoinBalance,
			buildDecreasePlayerCoinBalanceCalldata: build_game_decreasePlayerCoinBalance_calldata,
			increasePlayerCoinBalance: game_increasePlayerCoinBalance,
			buildIncreasePlayerCoinBalanceCalldata: build_game_increasePlayerCoinBalance_calldata,
			spawnPlayer: game_spawnPlayer,
			buildSpawnPlayerCalldata: build_game_spawnPlayer_calldata,
			updatePlayerHighestScore: game_updatePlayerHighestScore,
			buildUpdatePlayerHighestScoreCalldata: build_game_updatePlayerHighestScore_calldata,
			updatePlayerTotalScore: game_updatePlayerTotalScore,
			buildUpdatePlayerTotalScoreCalldata: build_game_updatePlayerTotalScore_calldata,
		},
	};
}