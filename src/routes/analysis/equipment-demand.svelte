<script>
import DopeAssTable from "@src/components/DopeAssTable.svelte";
import DataComponent from "@src/components/DataComponent.svelte";
import CharacterFilter from "@src/components/CharacterFilter.svelte";
import { lookupRows, cacheFunction, getTable } from "@src/data";
import { getMaxRefine, getUnlockedUnits, isFragment, isHardQuest, getItemImg } from "@src/logic";
import { sortByAttr, escAttr } from "@src/utils";

export const requiredTables = [ "unit_data", "unit_promotion", "quest_data", "wave_group_data", 
	"item_data", "equipment_data", "enemy_reward_data", "equipment_craft" ];

let unitIds = {};
let dataLoaded = false;

let equipment = [];
let equipmentSets = [];
let craftData = [];
let quests = [];

let demand = {};
let craftDemand = {};
let flattenedCraftData = {};

function getFlattenedCrafts(craft) {
	let flattenedCraft = {};
	for (var i = 1; i <= 10; i++) {
		let craftId = craft["condition_equipment_id_" + i];
		if (craftId <= 0) break;
		let childData = lookupRows("equipment_data", { equipment_id: craftId }, {}, { cache: true })[0];
		if (isFragment(childData)) continue;
		let childCraftData = lookupRows("equipment_craft", { equipment_id: craftId }, {}, { cache: true })[0];
		flattenedCraft[craftId] = craft["consume_num_" + i];
		if (childCraftData) {
			let childFlattenedCraft = getFlattenedCrafts(childCraftData);
			for (var equipId in childFlattenedCraft) {
				if (flattenedCraft[equipId] === undefined) {
					flattenedCraft[equipId] = 0;
				}
				flattenedCraft[equipId] += childFlattenedCraft[equipId];
			}
		}
	}
	return flattenedCraft;
}

function generateDemand(unitIds) {
	if (!dataLoaded) return;
	for (var key in demand) {
		demand[key] = 0;
	}
	for (var key in craftDemand) {
		craftDemand[key] = 0;
	}
	equipmentSets.forEach(function(equipSet) {
		if (!unitIds[equipSet.unit_id]) return;
		for (var i = 1; i <= 6; i++) {
			let equipId = equipSet["equip_slot_" + i];
			if (equipId === 0 || equipId === 999999) continue;
			if (!demand[equipId]) {
				demand[equipId] = 0;
			}
			demand[equipId]++;
			if (flattenedCraftData[equipId] !== undefined) {
				for (var craftEquipId in flattenedCraftData[equipId]) {
					if (!craftDemand[craftEquipId]) {
						craftDemand[craftEquipId] = 0;
					}
					craftDemand[craftEquipId] += flattenedCraftData[equipId][craftEquipId];
				}
			}
		}
	});
}

const getDemandQuestCount = cacheFunction(function getDemandQuestCount(itemId, isHard = false) {
	let questCount = 0;
	let standardOdds = isHard ? 72 : 36;

	// Turn this into a lookup table for performance
	let waveLookup = {};
	getTable("wave_group_data").forEach(function(waveData) {
		waveLookup[waveData.wave_group_id] = waveData;
	});

	let dropLookup = {};
	getTable("enemy_reward_data").forEach(function(dropData) {
		dropLookup[dropData.drop_reward_id] = dropData;
	});

	// What a beautiful code pyramid
	quests.forEach(function(questData) {
		if (isHardQuest(questData) === isHard) {
			for (var wave = 1; wave <= 3; wave++) {
				let waveId = questData["wave_group_id_" + wave];
				let waveData = waveLookup[waveId];
				for (var enemy = 1; enemy <= 5; enemy++) {
					if (waveData["enemy_id_" + enemy] && waveData["drop_reward_id_" + enemy]) {
						let dropData = dropLookup[waveData["drop_reward_id_" + enemy]];
						for (var drop = 1; drop <= 5; drop++) {
							if (dropData["reward_type_" + drop] && dropData["reward_id_" + drop] === itemId) {
								questCount += dropData["reward_num_" + drop] * dropData["odds_" + drop] / standardOdds;
							}
						}
					}
				}
			}
		}
	})

	return questCount;
});

$: generateDemand(unitIds);
$: data = getDemandTableData(unitIds);

function isNotFragment(data) {
	return !isFragment(data);
}

function getDemandTableData() {
	if (!dataLoaded) return [];
	return equipment.filter(isNotFragment).filter(function(equipData) {
		// hide zero demand
		return (demand[equipData.equipment_id] || craftDemand[equipData.equipment_id])
	}).map(function(equipData) {
		let rowData = {
			icon: "<img class=\"table-icon\" src=\"" + escAttr(getItemImg(equipData.equipment_id)) + "\">",
			name: equipData.equipment_name,
			demand: demand[equipData.equipment_id] || 0,
			craftDemand: craftDemand[equipData.equipment_id] || 0,
			fragments: 0
		}

		let dropId = equipData.equipment_id;

		let craftData = lookupRows("equipment_craft", { equipment_id: equipData.equipment_id }, {}, { cache: true })[0];
		if (craftData !== undefined) {
			for (var i = 1; i <= 10; i++) {
				if (craftData["condition_equipment_id_" + i]) {
					let craftItem = lookupRows("equipment_data", { equipment_id: craftData["condition_equipment_id_" + i] }, {}, { cache: true})[0];
					if (isFragment(craftItem)) {
						dropId = craftData["condition_equipment_id_" + i];
						rowData.fragments = craftData["consume_num_" + i];
						break;
					}
				}
			}
		}

		rowData.normalQuests = Math.round(getDemandQuestCount(dropId, false) * 100) / 100;
		rowData.hardQuests = Math.round(getDemandQuestCount(dropId, true) * 100) / 100;

		rowData.totalDemand = rowData.demand + rowData.craftDemand;
		if (rowData.fragments > 0) {
			rowData.totalFragmentDemand = rowData.totalDemand * rowData.fragments;
		}
		else {
			rowData.totalFragmentDemand = rowData.totalDemand;
		}

		return rowData;
	}).sort(sortByAttr("totalFragmentDemand", true));
}

let columns = [
	{
		attr: "icon",
		sort: null,
		html: true,
		displayName: "Icon"
	},
	{
		attr: "name",
		sort: "default",
		displayName: "Name"
	},
	{
		attr: "fragments",
		sort: "default",
		displayName: "Fragments"
	},
	{
		attr: "demand",
		sort: "default",
		displayName: "Equip Demand"
	},
	{
		attr: "craftDemand",
		sort: "default",
		displayName: "Craft Demand"
	}, {
		attr: "totalDemand",
		sort: "default",
		displayName: "Total Demand"
	}, {
		attr: "totalFragmentDemand",
		sort: "default",
		displayName: "Total Item Demand",
		helpText: "For equipment that is crafted with fragments, this is the total number of fragments that must be collected to fully equip all selected characters. For equipment that is not crafted with fragments, this is the amount of equipment that must be collected."
	}, {
		attr: "normalQuests",
		sort: "numeric",
		displayName: "Normal Quests",
		helpText: "Quest count is weighted according to the standard drop rate of 36%. The third listed item on normal stages has 2/3 the standard drop rate and is counted as 2/3 of a quest. \"Hidden\" drops have 5/9 the standard drop rate and are counted as 5/9 of a quest."
	}, {
		attr: "hardQuests",
		sort: "numeric",
		displayName: "Hard Quests",
		helpText: "Quest count is weighted according to the standard drop rate of 72%. \"Hidden\" drops on hard stages have 5/18 the standard drop rate and are counted as 5/18 of a quest."
	}
];

function onDataReady() {
	dataLoaded = true;
	unitIds = {};
	getUnlockedUnits().forEach(function(unitData) {
		unitIds[unitData.unit_id] = true;
	})

	equipment = getTable("equipment_data");
	equipmentSets = getTable("unit_promotion");
	craftData = getTable("equipment_craft")
	quests = getTable("quest_data");

	demand = {};
	craftDemand = {};
	flattenedCraftData = {};

	craftData.forEach(function(craft) {
		flattenedCraftData[craft.equipment_id] = getFlattenedCrafts(craft);
	});
}

</script>

<h2>Equipment Demand</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<table id="demand-table-table">
		<tr>
			<td id="demand-table-config">
				<CharacterFilter bind:unitIds={unitIds} />
			</td>
			<td id="demand-table">
				<DopeAssTable data={data} columns={columns} />
			</td>
		</tr>
	</table>
	<p>
		Equipment demand is calculated for max rank. To see equipment demand for lower ranks for individual cards, check the unit viewer.
	</p>
</DataComponent>

<style>
	td#demand-table-config {
		width: 180px;
		padding-right: 10px;
		border-right: 3px solid #cfe4ff;
	}

	table#demand-table-table {
		table-layout: fixed;
		width: 100%;
	}

	td#demand-table {
		padding-left: 10px;
	}

	div.table-wrap {
		overflow-x: auto;
	}
</style>