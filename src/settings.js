import { localStorageStore } from "@src/local-store.js";
import config from "@src/config.js";

export const includeExSkillStats = localStorageStore("includeExSkillStats", true);
export const hideImpossibleRarities = localStorageStore("hideImpossibleRarities", false);
// remember which analysis the user was looking at when switching back
export const lastAnalysis = localStorageStore("lastAnalysis", "");
export const lastGuide = localStorageStore("lastGuide", "");

export const savedUnit = localStorageStore("savedUnit", {
	id: -1,
	rarity: 1,
	level: 1,
	rank: 1,
	bond: 0,
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
	bonds: []
});

export const lastVersion = localStorageStore("lastVersion", config.version);
