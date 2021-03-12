<script>
import DopeAssTable from "@src/components/DopeAssTable.svelte";
import { lookupRows, UNLOCKED_UNITS, SUMMON_UNITS, getUnitSkills } from "@src/data/priconnedb";
import { sortByAttr } from "@src/utils"

let positionData = UNLOCKED_UNITS.map(function(unitData) {
	let unitIdImg = (unitData.unit_id + "").slice(0, 4) + "11";
	let classification = "Front";
	if (unitData.search_area_width >= 300) {
		classification = "Middle"
	}
	if (unitData.search_area_width >= 600) {
		classification = "Back"
	}

	let notes = "";
	let unitSkills = getUnitSkills(unitData.unit_id);
	let positionManipSkills = [];
	for (var skillName in unitSkills) {
		for (var i = 0; i < unitSkills[skillName].actions.length; i++) {
			let action = unitSkills[skillName].actions[i];
			if (action.action_type === 2) {
				if (skillName === "union_burst" && (action.target_range < 0 || action.target_type !== 3)) continue;
				positionManipSkills.push(unitSkills[skillName].data.name);
			}
		}
	}
	if (positionManipSkills.length > 0) {
		notes = "Manipulates position with skills: " + positionManipSkills.join(", ");
	}

	return {
		position: unitData.search_area_width,
		classification: classification,
		name: unitData.unit_name,
		icon: "<img class='table-icon' src='images/unit/unit_icon_unit_" + unitIdImg + ".png' />",
		notes: notes
	}
}).sort(sortByAttr("position"));

let columns = [
	{
		attr: "icon",
		displayName: "Icon",
		html: true,
		sort: null
	}, {
		attr: "name",
		displayName: "Character",
		sort: "default"
	}, {
		attr: "position",
		displayName: "Range",
		sort: "numeric"
	}, {
		attr: "classification",
		displayName: "Classification",
		sort: "default"
	}, {
		attr: "notes",
		displayName: "Notes",
		sort: "default"
	}
]
</script>

<p>
	Each unit has a certain distance they need to be from the first enemy before they can attack or use skills. If they are out of range, they will walk forward until they reach their range. If they are closer than this range, they will not walk backward.
</p>

<p>
	I still need to do some research regarding positioning. If any knowledgeable people out there ahve some insights, they would be appreciated :)
</p>

<DopeAssTable data={positionData} columns={columns} />
