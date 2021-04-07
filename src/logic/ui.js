import { getUnitType } from "@src/logic/unit";
import { getItemType } from "@src/logic/item";

export function getUnitImg(unitId, rarity) {
	rarity = rarity || 1;
	if (unitId > -1) {
		let unitType = getUnitType(unitId);
		if (unitType === "character") {
			var unitIdString = unitId + "";
			var unitIdWithRarity = unitIdString.slice(0, 4) + (rarity >= 3 ? "3" : "1") + unitIdString.slice(-1); 
			return "images/unit/unit_icon_unit_" + unitIdWithRarity + ".png";
		}
		else if (unitType === "shadow") {
			return "images/unit/unit_icon_shadow_" + (unitId - 500000 + 10) + ".png";
		}
		else {
			return "images/unit/unit_icon_unit_" + unitId + ".png";
		}
	}
	else {
		return "images/unit/unit_icon_unit_unknown.png";
	}
}

export function getItemImg(itemId) {
	if (itemId > -1) {
		let itemType = getItemType(itemId);
		if (itemType === "item") {
			return "images/item/icon_icon_item_" + itemId + ".png";
		}
		else if (itemType === "equipment") {
			return "images/equipment/icon_icon_equipment_" + itemId + ".png";
		}
	}
		
	return "images/unit/unit_icon_unit_unknown.png";
}
