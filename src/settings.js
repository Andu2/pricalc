import { localStorageStore } from "@src/local-store.js";
import { version } from "@src/config";

export const includeExSkillStats = localStorageStore("includeExSkillStats", true);
export const hideImpossibleRarities = localStorageStore("hideImpossibleRarities", false);
// remember which analysis the user was looking at when switching back
export const lastAnalysis = localStorageStore("lastAnalysis", "");
export const lastGuide = localStorageStore("lastGuide", "");

export const baseUnitConfig = {
	id: -1,
	rarity: 1,
	level: 1,
	rank: 1,
	equipment: {
		slot1: {
			equipped: false,
			refine: 0
		},
		slot2: {
			equipped: false,
			refine: 0
		},
		slot3: {
			equipped: false,
			refine: 0
		},
		slot4: {
			equipped: false,
			refine: 0
		},
		slot5: {
			equipped: false,
			refine: 0
		},
		slot6: {
			equipped: false,
			refine: 0
		}
	},
	skills: {
		union_burst: 1,
		main_skill_1: 1,
		main_skill_2: 1,
		ex_skill_1: 1
	},
	bond: {}
};
export const savedUnit = localStorageStore("savedUnit", baseUnitConfig);

export const lastVersion = localStorageStore("lastVersion", version);
