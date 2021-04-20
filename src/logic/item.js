export function getItemType(itemId) {
	if (itemId / 100000 < 1) return "item";
	else return "equipment";
}

export function isFragment(equipData) {
	return (equipData.equipment_name.indexOf("Blueprint") > -1 || equipData.equipment_name.indexOf("Fragment") > -1);
}
