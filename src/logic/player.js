import { getTable } from "@src/data/priconnedb";

export function getMaxLevel() {
	return getTable("experience_team").slice(-1)[0].team_level - 1; // Database has one more than current max level
}
