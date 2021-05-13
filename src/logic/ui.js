import { getUnitType } from "@src/logic/unit";
import { getItemType } from "@src/logic/item";
import { dataSource } from "@src/settings";
import { get } from "svelte/store";

export const CDN_URL = "https://pricalc.b-cdn.net";

let dataSourceServer = "en";
let dataSourceVersion = "latest";
dataSource.subscribe(function(value) {
	[ dataSourceServer, dataSourceVersion ] = value.split("-");
});

export function getUnitImg(unitId, options = {}) {
	if (options.rarity === undefined) options.rarity = 1;
	if (options.server === undefined) options.server = dataSourceServer;
	if (options.useMissingImage === undefined) options.useMissingImage = true;
	if (unitId > -1) {
		let unitType = getUnitType(unitId);
		if (unitType === "character") {
			var unitIdString = unitId + "";
			let imgRarity = 1;
			if (options.rarity >= 6) imgRarity = 6;
			else if (options.rarity >= 3) imgRarity = 3;
			var unitIdWithRarity = unitIdString.slice(0, 4) + imgRarity + unitIdString.slice(-1); 
			return CDN_URL + "/" + options.server + "/unit/extract/latest/icon_unit_" + unitIdWithRarity + ".png";
		}
		else if (unitType === "summon") {
			// Summons don't have an icon, so I made them myself.
			return "images/unit/icon_unit_" + unitId + ".png";
		}
		else if (unitType === "shadow") {
			return CDN_URL + "/" + options.server + "/unit/extract/latest/icon_shadow_" + (unitId - 500000 + 10) + ".png";
		}
		else {
			if (options.prefabId) {
				return CDN_URL + "/" + options.server + "/unit/extract/latest/icon_unit_" + options.prefabId + ".png";
			}
			return CDN_URL + "/" + options.server + "/unit/extract/latest/icon_unit_" + unitId + ".png";
		}
	}

	if (options.useMissingImage) {
		return CDN_URL + "/" + options.server + "/unit/extract/latest/icon_unit_unknown.png";
	}
	else {
		// 1x1 transparent png to prevent "broken image"
		return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
	}
}

const substituteImgIds = {
	"91002": "91001"
}
export function getItemImg(itemId, options = {}) {
	if (options.invalid === undefined) options.invalid = false;
	if (options.server === undefined) options.server = dataSourceServer;
	if (itemId > -1) {
		let itemType = getItemType(itemId);
		let itemIdString = itemId + "";
		itemIdString = substituteImgIds[itemIdString] || itemIdString;
		if (options.invalid) {
			itemIdString = "invalid_" + itemId;
		}
		if (itemType === "item") {
			return CDN_URL + "/" + options.server + "/icon/extract/latest/icon_item_" + itemIdString + ".png";
		}
		else if (itemType === "equipment") {
			return CDN_URL + "/" + options.server + "/icon/extract/latest/icon_equipment_" + itemIdString + ".png";
		}
	}
		
	return CDN_URL + "/" + options.server + "/unit/extract/latest/icon_unit_unknown.png";
}

// For arbitrary other icons
export function getIcon(iconName, options = {}) {
	if (options.server === undefined) options.server = dataSourceServer;
	return CDN_URL + "/" + options.server + "/icon/extract/latest/" + iconName + ".png";
}
