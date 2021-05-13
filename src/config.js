import { sortByAttr } from "@src/utils";

export const version = "0.5";

export const nav = [
	{
		path: "units",
		displayName: "Units"
	}, {
	// 	path: "simulator",
	// 	displayName: "Simulator"
	// }, {
		path: "tool-index",
		displayName: "Analysis Tools"
	}, {
		path: "misc-index",
		displayName: "Misc"
	}
];

export const pages = [
	{
		path: "guides/formulas",
		category: "Calculators",
		displayName: "Combat Formulas",
		description: "An interactive guide to how some of the combat formulas work.",
		icon: "jp/icon/extract/latest/icon_skill_2024.png"
	}, {
		path: "guides/arena-jewels",
		category: "Calculators",
		displayName: "Arena Jewels",
		description: "An interactive reference on how many jewels can be acquired in the battle arena and princess arena.",
		icon: "jp/unit/extract/latest/icon_unit_103011.png"
	}, {
		path: "guides/chara-profiles",
		category: "Misc Data",
		displayName: "Character Profiles",
		description: "Character information including age, race, height, weight, birthday, and blood type.",
		icon: "jp/unit/extract/latest/icon_unit_100211.png"
	}, {
		path: "guides/clan-battle-laps",
		category: "Reference",
		displayName: "Clan Battle Data",
		description: "An overview of the bosses in each clan battle.",
		icon: "jp/unit/extract/latest/icon_unit_302100.png"
	}, {
		path: "guides/position",
		category: "Reference",
		displayName: "Unit Positions",
		description: "List of ideal range values for each character. Includes distance from Saren.",
		icon: "jp/unit/extract/latest/icon_unit_102811.png"
	}, {
		path: "guides/equipment",
		category: "Reference",
		displayName: "Equipment Data",
		description: "Equipment stats, level requirements, and fragment requirements.",
		icon: "jp/icon/extract/latest/icon_equipment_101011.png"
	}, {
	// 	path: "guides/cute",
	// 	category: "Reference",
	// 	displayName: "Cuteness"
	// }, {
		path: "guides/quests",
		category: "Reference",
		displayName: "Quest Data",
		description: "Enemies and expected drops for every normal and hard quest.",
		icon: "jp/icon/extract/latest/icon_map_100020.png"
	}, {
		path: "analysis/stat-table",
		category: "Reference",
		displayName: "Max Stat Table",
		description: "Stats for each character at maximum level.",
		icon: "jp/icon/extract/latest/icon_skill_2016.png"
	}, {
		path: "analysis/rank-comparison",
		category: "Analysis",
		displayName: "Rank Comparison",
		description: "Stat differences between equipment ranks. Useful for determining whether to rank a character up.",
		icon: "jp/icon/extract/latest/icon_equipment_104551.png"
	}, {
		path: "analysis/damage-scaling",
		category: "Analysis",
		displayName: "Skill Damage Scaling",
		description: "Plot of how much damage each attacking skill does, per skill level and per attack stat.",
		icon: "jp/icon/extract/latest/icon_skill_3001.png"
	}, {
		path: "analysis/drops",
		category: "Analysis",
		displayName: "Item Drops",
		description: "Select an item and see which quests drop it, and which quests are most stamina-efficient for farming it.",
		icon: "jp/icon/extract/latest/icon_item_90007.png"
	}, {
		path: "analysis/equipment-demand",
		category: "Analysis",
		displayName: "Equipment Demand",
		description: "Select characters and calculate the amount of each equipment fragment necessary to max them out.",
		icon: "jp/icon/extract/latest/icon_item_99002.png"
	}, {
		path: "units",
		category: "Analysis",
		displayName: "Unit Viewer",
		description: "View character, enemy, and boss details, including stats and detailed skill descriptions.",
		icon: "jp/unit/extract/latest/icon_unit_101211.png"
	}, {
	// 	path: "simulator",
	// 	category: "Analysis",
	// 	displayName: "Simulator",
	// 	description: "Select a lineup of units and simulate the positions each unit will end up in. More simulation features coming soon™!",
	// 	icon: "jp/icon/extract/latest/icon_skill_1001.png"
	// }, {
		path: "notification-quiz",
		category: "Fun Stuff",
		displayName: "Notification Quiz",
		description: "Match the notification message to the character!",
		icon: "jp/unit/extract/latest/icon_unit_100611.png"
	}, {
		path: "guides/divine-amulets",
		category: "Calculators",
		displayName: "Shard Amulet Costs",
		description: "Calculate how many divine amulets you'll need to get a character starred up.",
		icon: "jp/icon/extract/latest/icon_item_90005.png"
	}, {
		path: "units",
		category: "Featured PriCalc Tools",
		displayName: "Unit Viewer",
		description: "With this tool, you can view character stats at specific levels, skill levels, rarity, rank, and bond. You can also view enemy unit and boss stats!",
		icon: "jp/unit/extract/latest/icon_unit_101211.png"
	// }, {
	// 	path: "simulator",
	// 	category: "Featured PriCalc Tools",
	// 	displayName: "Simulator",
	// 	description: "Select a lineup of units and simulate a fight.",
	// 	icon: "jp/icon/extract/latest/icon_skill_1001.png"
	}, {
		path: "analysis/rank-comparison",
		category: "Featured PriCalc Tools",
		displayName: "Rank Comparison",
		description: "This table shows the stat difference between different ranks for each character. Useful when trying to decide whether to rank up!",
		icon: "jp/icon/extract/latest/icon_equipment_104551.png"
	// }, {
	// 	path: "guides/clan-battle-laps",
	// 	category: "Featured PriCalc Tools",
	// 	displayName: "Clan Battle Data",
	// 	description: "An overview of the bosses in each clan battle.",
	// 	icon: "jp/unit/extract/latest/icon_unit_302100.png"
	}, {
		path: "jp-history/characters",
		category: "JP Content History",
		displayName: "Characters Added",
		description: "Dates on which characters were added in JP.",
		icon: "jp/unit/extract/latest/icon_unit_106811.png" 
	}, {
		path: "jp-history/features",
		category: "JP Content History",
		displayName: "Game Updates",
		description: "Dates on which various game updates where added in JP, including new dungeons, new grotto levels, new furniture levels, and other new features. Also, dates on which arenas were shuffled.",
		icon: "jp/icon/extract/latest/icon_item_90008.png" 
	}, {
		path: "jp-history/ranks-levels-areas",
		category: "JP Content History",
		displayName: "Ranks and Max Level",
		description: "Dates on which the max level was increased, and dates on which new equipment was added (along with the associated quest area).",
		icon: "jp/icon/extract/latest/icon_equipment_105552.png" 
	}, {
		path: "jp-history/six-stars",
		category: "JP Content History",
		displayName: "Six Stars Added",
		description: "Dates on which characters got a six star upgrade.",
		icon: "jp/unit/extract/latest/icon_unit_101261.png" 
	}, {
		path: "jp-history/unique-equipment",
		category: "JP Content History",
		displayName: "Unique Equipment",
		description: "Dates on which characters got their unique equipment.",
		icon: "jp/icon/extract/latest/icon_equipment_140000.png" 
	}
].sort(sortByAttr("displayName"));

export const changeLog = [{
		version: "0.5",
		date: "2021-05-13",
		notes: [
			"Added ability to select data source, including JP data and old data",
			"Unit viewer: Added skill mana cost, shard location, total exp",
			"Added rarity and rank selection to max stat table",
			"Added number of cards and next three birthdays to character profile page"
		]
	}, {
		version: "0.4",
		date: "2021-04-25",
		notes: [
			"Merged analysis and guides",
			"Added ability to hide menu and added page indices",
			"Guides: Divine amulet costs",
			"Added unit filter on equipment demand tool",
			"Added cast times and animation times",
			"Added JP content history section"
		]
	}, {
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
