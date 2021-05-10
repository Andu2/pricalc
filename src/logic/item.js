import { getTable, lookupRows } from "@src/data/priconnedb";

export function getItemType(itemId) {
	if (itemId / 100000 < 1) return "item";
	else return "equipment";
}

export function getItemName(itemId) {
	if (itemId > -1) {
		let itemType = getItemType(itemId);
		if (itemType === "item") {
			let itemData = lookupRows("item_data", { item_id: itemId })[0];
			if (itemData !== undefined) return itemData.item_name;
		}
		else if (itemType === "equipment") {
			let equipmentData = lookupRows("equipment_data", { equipment_id: itemId })[0];
			if (equipmentData !== undefined) return equipmentData.equipment_name;
		}
	}
		
	return "Select an item...";
}

export function isFragment(equipData) {
	return (equipData.equipment_name.indexOf("Blueprint") > -1 || equipData.equipment_name.indexOf("Fragment") > -1);
}

export function getMaxRank() {
	let maxRankFound = 0;
	let maxEquipmentFound = {};
	getTable("unit_promotion").forEach(function(row) {
		if (row.promotion_level > maxRankFound) {
			maxRankFound = row.promotion_level;
			for ( var i = 1; i <= 6; i++) {
				maxEquipmentFound["slot" + i] = (row["equip_slot_" + i] !== 999999);
			}
		}
	});
	return {
		rank: maxRankFound,
		equipment: maxEquipmentFound
	}
}

let cachedDroppableItems = null;
export function getDroppableItems() {
	if (cachedDroppableItems) {
		return cachedDroppableItems;
	}

	let items = [];

	let quests = getTable("quest_data");
	quests.forEach(function(quest) {
		for (var waveNum = 1; waveNum <= 3; waveNum++) {
			let wave = lookupRows("wave_group_data", { wave_group_id: quest["wave_group_id_" + waveNum]})[0];
			for (var enemyNum = 1; enemyNum <= 5; enemyNum++) {
				let rewardId = wave["drop_reward_id_" + enemyNum];
				if (rewardId > 0) {
					let rewardData = lookupRows("enemy_reward_data", { drop_reward_id: rewardId })[0];
					for (var rewardNum = 1; rewardNum <= 5; rewardNum++) {
						if (items.indexOf(rewardData["reward_id_" + rewardNum]) === -1) {
							items.push(rewardData["reward_id_" + rewardNum])
						}
					}
				}
			}
		}
	});

	// Mana is special - make a dummy row for it
	items.push(94001);

	cachedDroppableItems = items;

	return items;
}
