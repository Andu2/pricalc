export function getItemType(itemId) {
	if (itemId / 100000 < 1) return "item";
	else return "equipment";
}
