import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

// Type definition for `bitwave::models::minigame_score::MinigameScore` struct
export interface MinigameScore {
	player_address: string;
	minigame_id: number;
	highest_score: number;
	total_score: number;
}

// Type definition for `bitwave::models::player::Player` struct
export interface Player {
	player_address: string;
	name: number;
	coin_balance: number;
}

export interface SchemaType extends ISchemaType {
	bitwave: {
		MinigameScore: MinigameScore,
		Player: Player,
	},
}
export const schema: SchemaType = {
	bitwave: {
		MinigameScore: {
			player_address: "",
			minigame_id: 0,
			highest_score: 0,
			total_score: 0,
		},
		Player: {
			player_address: "",
			name: 0,
			coin_balance: 0,
		},
	},
};
export enum ModelsMapping {
	MinigameScore = 'bitwave-MinigameScore',
	Player = 'bitwave-Player',
}