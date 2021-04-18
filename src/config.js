import { sortByAttr } from "@src/utils";

export const version = "0.3.2";

export const pages = [
	{
		path: "units",
		displayName: "Units"
	}, {
		path: "analysis",
		displayName: "Analysis"
	}, {
		path: "guides",
		displayName: "Guides / Reference"
	}
];

export const guidePages = [
	{
		path: "formulas",
		displayName: "Formulas"
	}, {
		path: "arena-jewels",
		displayName: "Arena Jewels"
	}, {
		path: "chara-profiles",
		displayName: "Character Profiles"
	}, {
		path: "clan-battle-laps",
		displayName: "Clan Battle Data"
	}, {
		path: "position",
		displayName: "Unit Positions"
	}, {
		path: "equipment",
		displayName: "Equipment Data"
	}, {
		path: "cute",
		displayName: "Cuteness"
	}, {
		path: "quests",
		displayName: "Quest Data"
	}
].sort(sortByAttr("displayName"));

export const analysisPages = [
	{
		path: "stat-table",
		displayName: "Max Stat Table"
	}, {
		path: "rank-comparison",
		displayName: "Rank Comparison"
	}, {
		path: "damage-scaling",
		displayName: "Skill Damage Scaling"
	}, {
		path: "drops",
		displayName: "Drops Per Stamina"
	}, {
		path: "equipment-demand",
		displayName: "Equipment Demand"
	}, {
		path: "arena-distance",
		displayName: "Arena Distance"
	}
].sort(sortByAttr("displayName"));

export const changeLog = [{
		version: "0.3.2",
		date: "2021-04-06",
		notes: [
			"Guides: Quest data, cuteness",
			"Added Saren distance to unit position guide",
			"Deleted settings as a separate page"
		]
	}, {
		version: "0.3.1",
		date: "2021-03-16",
		notes: [
			"Notification quiz",
			"Add 2x drops option to drops per stamina table",
			"Analysis: Equipment demand",
			"Guide: Equipment stats"
		]
	}, {
		version: "0.3",
		date: "2021-03-13",
		notes: [
			"Guides: Clan battle laps, unit positioning",
			"Added summons to unit viewer, under \"characters\"",
			"Worked on action descriptions"
		]
	}, {
		version: "0.2",
		date: "2021-03-04",
		notes: [
			"Added enemies to unit viewer",
			"Guides: Character profiles, arena jewels",
			"Analysis: Drops per stamina"
		]
	}, {
		version: "0.1",
		date: "2021-02-24",
		notes: [
			"Created unit viewer", 
			"Analysis: Rank comparison, max stats comparison, skill damage scaling", 
			"Guides: Formulas"
		]
	}
];
