<script>
import DopeAssTable from "@src/components/DopeAssTable.svelte";
import CharacterFilter from "@src/components/CharacterFilter.svelte";
import { lookupRows, UNLOCKED_UNITS } from "@src/data/priconnedb";
import { getMaxRefine } from "@src/logic/unit";
import { sortByAttr } from "@src/utils";
import { isFragment } from "@src/logic/item";
import { isHardQuest } from "@src/logic/quest";

let unitIds = {};
UNLOCKED_UNITS.forEach(function(unit) {
	unitIds[unit.unit_id] = true;
});
let equipment = lookupRows("equipment_data", {});
let equipmentSets = lookupRows("unit_promotion", {});
let craftData = lookupRows("equipment_craft", {})
let quests = lookupRows("quest_data", {});

let demand = {};
let craftDemand = {};
let flattenedCraftData = {};

craftData.forEach(function(craft) {
	flattenedCraftData[craft.equipment_id] = getFlattenedCrafts(craft);
});

function getFlattenedCrafts(craft) {
	let flattenedCraft = {};
	// 1st piece always fragments
	for (var i = 2; i <= 10; i++) {
		let craftId = craft["condition_equipment_id_" + i];
		if (craftId <= 0) break;
		flattenedCraft[craftId] = craft["consume_num_" + i];
		let childCraftData = lookupRows("equipment_craft", { equipment_id: craftId }, {}, { cache: true })[0];
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

let questCountCache = {};
function getQuestCount(itemId, isHard = false) {
	let cacheKey = itemId + isHard;
	if (questCountCache[cacheKey] !== undefined) {
		return questCountCache[cacheKey];
	}

	let questCount = 0;
	let standardOdds = isHard ? 72 : 36;

	// What a beautiful code pyramid
	quests.forEach(function(questData) {
		if (isHardQuest(questData) === isHard) {
			for (var wave = 1; wave <= 3; wave++) {
				let waveId = questData["wave_group_id_" + wave];
				let waveData = lookupRows("wave_group_data", { wave_group_id: waveId }, {}, { cache: true })[0];
				for (var enemy = 1; enemy <= 5; enemy++) {
					if (waveData["enemy_id_" + enemy] && waveData["drop_reward_id_" + enemy]) {
						let dropData = lookupRows("enemy_reward_data", { drop_reward_id: waveData["drop_reward_id_" + enemy]}, {}, { cache: true })[0];
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

	questCountCache[cacheKey] = questCount;
	return questCount;
}

$: generateDemand(unitIds);
$: data = getDemandTableData(unitIds);

function isNotFragment(data) {
	return !isFragment(data);
}

function getDemandTableData() {
	return equipment.filter(isNotFragment).filter(function(equipData) {
		// hide zero demand
		return (demand[equipData.equipment_id] || craftDemand[equipData.equipment_id])
	}).map(function(equipData) {
		let rowData = {
			icon: "<img class=\"table-icon\" src=\"images/equipment/icon_icon_equipment_" + equipData.equipment_id + ".png\">",
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
						dropId = craftData.condition_equipment_id_1;
						rowData.fragments = craftData.consume_num_1;
						break;
					}
				}
			}
		}

		rowData.normalQuests = Math.round(getQuestCount(dropId) * 100) / 100;
		rowData.hardQuests = Math.round(getQuestCount(dropId, true) * 100) / 100;

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

</script>

<h2>Equipment Demand</h2>

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