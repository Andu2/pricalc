import { getTable, lookupRows, cacheFunction } from "@src/data/priconnedb";

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
	if (!equipData || !equipData.equipment_id) return false;
	let fragmentWords = [
		"Fragment",
		"Blueprint",
		"欠片", // fragment
		"の設計図" // blueprint
	]
	for (var i = 0; i < fragmentWords.length; i++) {
		if (equipData.equipment_name.indexOf(fragmentWords[i]) > -1) {
			return true;
		}
	}
	return false;
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

export const getDroppableItems = cacheFunction(function getDroppableItems() {
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
	return items;
});

export function getShardType(unitId) {
	let unitRarity = lookupRows("unit_rarity", { unit_id: unitId })[0];
	if (!unitRarity) return "unknown";
	let shardId = unitRarity.unit_material_id;

	let shopLineupIds = {
		"Dungeon shop": 1204001,
		"Arena shop": 1202001,
		"Princess Arena shop": 1203001,
		"Clan Battle shop": 1205001
	}

	for (var shop in shopLineupIds) {
		let shopItemsMaxLevel = lookupRows("fix_lineup_group_set", { lineup_group_set_id: shopLineupIds[shop], team_level_to: -1 }, {}, { cache: true})[0];
		for (var i = 1; i <= 10; i++) {
			if (shopItemsMaxLevel["reward_id_" + i] === shardId) {
				return shop;
			}
		}
	}

	// To simplify lookup, just check the third reward id among all rewards and assume it's our hard node
	let questReward = lookupRows("quest_reward_data", { reward_id_3: shardId });
	if (questReward.length > 0) {
		return "Hard quests"
	}

	return "Not farmable"
}
