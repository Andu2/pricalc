<script>
import DopeAssTable from "@src/components/DopeAssTable.svelte";
import { lookupRows, UNLOCKED_UNITS } from "@src/data/priconnedb";
import { getMaxRefine } from "@src/logic/unit";
import { sortByAttr } from "@src/utils";

let unlockedUnitIds = UNLOCKED_UNITS.map(function(unit) {
	return unit.unit_id
});
let equipment = lookupRows("equipment_data", {});
let equipmentSets = lookupRows("unit_promotion", {}).filter(function(row) {
	return unlockedUnitIds.indexOf(row.unit_id) > -1;
});
let craftData = lookupRows("equipment_craft", {})

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

equipmentSets.forEach(function(equipSet) {
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

$: data = getDemandTableData();

function getDemandTableData() {
	return equipment.filter(isNotFragment).map(function(equipData) {
		let rowData = {
			icon: "<img class=\"table-icon\" src=\"images/equipment/icon_icon_equipment_" + equipData.equipment_id + ".png\">",
			name: equipData.equipment_name,
			demand: demand[equipData.equipment_id] || 0,
			craftDemand: craftDemand[equipData.equipment_id] || 0
		}

		let craftData = lookupRows("equipment_craft", { equipment_id: equipData.equipment_id }, {}, { cache: true })[0];
		if (craftData === undefined) {
			rowData.fragments = 0;
		}
		else {
			// It's always the first item
			rowData.fragments = craftData.consume_num_1;
			// for (var i = 1; i <= 5; i++) {
			// 	if (craftData["condition_equipment_id_" + i])
			// }
		}

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

function isNotFragment(equipData) {
	return (equipData.enable_donation === 0 || equipData.promotion_level <= 1);
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
		helpText: "For equipment that is crafted with fragments, this is the total number of fragments that must be collected to fully equip all current characters. For equipment that is not crafted with fragments, this is the amount of equipment that must be collected."
	}
];

</script>

<DopeAssTable data={data} columns={columns} />

<style>
</style>