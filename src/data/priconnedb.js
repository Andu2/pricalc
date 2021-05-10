export {default as animationDurations} from "@src/data/animation-durations.json";
export {default as jpContentHistory} from "@src/data/jp-content-history.json";

import Papa from "papaparse";
import { sortByAttr } from "@src/utils";
import { dataSource } from "@src/settings";
import { get } from "svelte/store";

const CDN_URL = "https://pricalc.b-cdn.net";

let loadedTables = {}
let loadedDataSource = "";

export function loadTables(tables) {
	let currentDataSource = get(dataSource);
	if (currentDataSource !== loadedDataSource) {
		loadedTables = {};
	}
	let [ dataSourceServer, dataSourceVersion ] = currentDataSource.split("-");
	let tableFetches = tables.map(function(tableName) {
		let tableUrl = CDN_URL + "/" + dataSourceServer + "/masterdata/extract/" + dataSourceVersion + "/" + tableName + ".csv";
		return new Promise(function(resolve, reject) {
			if (loadedTables[tableName] !== undefined) {
				resolve(loadedTables[tableName]);
			}
			else {
				Papa.parse(tableUrl, {
					download: true,
					header: true,
					dynamicTyping: true,
					skipEmptyLines: true,
					complete: function(result) {
						let tableData = processTable(tableName, result.data);
						loadedTables[tableName] = tableData;
						resolve(tableData);
					},
					error: function(error) {
						//console.warn(error)
						resolve(null);
					}
				})
			}
		})
	});
	return Promise.all(tableFetches);
}

function processTable(tableName, tableData) {
	if (tableName === "item_data") {
		// mana be special
		// Also stamina, player exp, jewels
		tableData.push({
			"dummy_row": true,
			"item_id": 94001,
			"item_name": "Mana",
			"description": "Mana",
			"promotion_level": 1,
			"item_type": 12,
			"value": 1,
			"price": 0,
			"limit_num": 999999999,
			"start_time": "2015/12/17 15:00:00",
			"end_time": "2030/08/01 14:59:59"
		});
	}
	return tableData;
}

export function isTableLoaded(tableName) {
	return loadedTables[tableName] !== undefined;
}

// Return an error if the tables have not been loaded 
// Nevermind I don't like this. Just throw an error on lookupRows or getTable
// export function createDependentFunction(dependentTables, func) {
// 	return function checkDependency() {
// 		let notLoaded = dependentTables.filter(function(tableName) {
// 			return (loadedTables[tableName] === undefined);
// 		});
// 		if (notLoaded.length > 0) {
// 			throw Error("Cannot run function " + func.name + " because the requisite table(s) " + notLoaded.join(", ") + " have not been loaded.");
// 		}
// 		return func.apply(null, arguments);
// 	}
// }

// This function returns the table object itself; DON'T MODIFY THE DATA WITHOUT MAKING A COPY
export function getTable(tableName) {
	if (loadedTables[tableName] === undefined) {
		throw Error("Table " + tableName + " needs to be loaded before being used");
	}
	return loadedTables[tableName];
}

let lookupCache = {};
export function lookupRows(tableName, constraints, calculated = {}, options = {}) {
	if (loadedTables[tableName] === undefined) {
		throw Error("Table " + tableName + " needs to be loaded before being used");
	}
	let serializedInputs = tableName + JSON.stringify(constraints);
	if (options.cache) {
		if (Object.keys(calculated).length > 0) {
			console.warn("Cache does not work with calculated");
			options.cache = false;
		}
		else {
			if (lookupCache[serializedInputs] !== undefined) {
				return lookupCache[serializedInputs];
			}
		}	
	}
	let returnRows = loadedTables[tableName].filter(function(row) {
		for (var column in constraints) {
			if (typeof calculated[column] === "function") {
				if (constraints[column] !== calculated[column](row)) return false;
			}
			else if (constraints[column] instanceof Array) {
				if (constraints[column].indexOf(row[column]) === -1) return false;
			}
			else {
				if (row[column] !== constraints[column]) return false;
			}
		}
		return true;
	});
	if (options.cache) {
		lookupCache[serializedInputs] = returnRows;
	}
	return returnRows;
}

export const STAT_NAMES = ["hp", "atk", "magic_str", "def", "magic_def", "physical_critical", "magic_critical", 
	"wave_hp_recovery", "wave_energy_recovery", "dodge", //"physical_penetrate", "magic_penetrate",
	"life_steal", "hp_recovery_rate", "energy_recovery_rate", "energy_reduce_rate", "accuracy"];

export const STAT_DISPLAY_NAMES = {
	"hp": "HP",
	"atk": "Physical Attack",
	"def": "Physical Defense",
	"magic_str": "Magic Attack", 
	"magic_def": "Magic Defense",
	"physical_critical": "Physical Critical Rate",
	"magic_critical": "Magic Critical Rate", 
	"wave_hp_recovery": "HP Regen",
	"wave_energy_recovery": "TP Regen",
	"dodge": "Dodge",
	"life_steal": "HP Drain",
	"hp_recovery_rate": "HP Recovery Boost",
	"energy_recovery_rate": "TP Boost",
	"energy_reduce_rate": "TP Retain",
	"accuracy": "Accuracy"
}

export const SKILL_NAMES = ["union_burst", "main_skill_1", "main_skill_2", "ex_skill_1"];

// Stats are referenced by number throughout the database
export const NUMBER_TO_STAT = {
	1: "hp",
	2: "atk",
	3: "def",
	4: "magic_str",
	5: "magic_def",
	6: "physical_critical",
	7: "magic_critical",
	8: "dodge",
	9: "life_steal",
	10: "wave_hp_recovery", // Thank you Loppolutte for pointing out what this stat is
	11: "wave_energy_recovery",
	14: "don't know" // TODO. Christina has it.
}

// Slightly different numbers for skills because why not
export const BUFF_NUMBER_TO_STAT = {
	1: "hp",
	2: "atk",
	3: "def",
	4: "magic_str",
	5: "magic_def",
	6: "magic_critical",
	7: "physical_critical",
	8: "dodge",
	9: "life_steal",
	10: "wave_hp_recovery",
	11: "wave_energy_recovery",
	14: "don't know"
}

export const WEAPON_TYPES = {
	1: "Fist",
	2: "Dagger",
	3: "Axe",
	4: "Short Sword",
	5: "Long Sword",
	6: "Spear",
	7: "Staff",
	8: "Bow"
	// 9: "Dagger"
}
