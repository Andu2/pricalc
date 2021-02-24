import { localStorageStore } from "./local-store.js";

export const includeExSkillStats = localStorageStore("includeExSkillStats", true);
export const hideImpossibleRarities = localStorageStore("hideImpossibleRarities", false);
// remember which analysis the user was looking at when switching back
export const lastAnalysis = localStorageStore("lastAnalysis", "");
export const lastGuide = localStorageStore("lastGuide", "");
