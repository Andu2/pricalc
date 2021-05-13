<script>
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import DataComponent from "@src/components/DataComponent.svelte";
	import { lookupRows } from "@src/data";
	import { getUnitSkills, getUnlockedUnits, getSummonUnits, getUnitImg, getPositionClass } from "@src/logic";
	import { sortByAttr, escAttr } from "@src/utils"

	const requiredTables = [ "unit_data", "skill_data", "skill_action", "unit_skill_data" ]

	let positionData = [];

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
			attr: "sarenDistance",
			displayName: "Distance from Saren",
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

	function onDataReady() {
		let UNLOCKED_UNITS = getUnlockedUnits();
		let SUMMON_UNITS = getSummonUnits();

		let sarenData = lookupRows("unit_data", { unit_id: 102801 })[0];

		positionData = UNLOCKED_UNITS.map(function(unitData) {
			let classification = getPositionClass(unitData.search_area_width);

			let notes = "";
			let unitSkills = getUnitSkills(unitData.unit_id);
			let positionManipSkills = [];
			for (var skillName in unitSkills) {
				for (var i = 0; i < unitSkills[skillName].actions.length; i++) {
					let action = unitSkills[skillName].actions[i];
					if (action.action_type === 2) {
						if (skillName === "union_burst" && (action.target_range < 0 || action.target_range >= 2160 || action.target_type !== 3)) continue;
						positionManipSkills.push(unitSkills[skillName].data.name);
					}
				}
			}
			if (positionManipSkills.length > 0) {
				notes = "Manipulates position with skills: " + positionManipSkills.join(", ");
			}

			return {
				position: unitData.search_area_width,
				sarenDistance: Math.abs(unitData.search_area_width - sarenData.search_area_width),
				classification: classification,
				name: unitData.unit_name,
				icon: "<img class='table-icon' src='" + getUnitImg(unitData.unit_id, { rarity: 3 }) + "' />",
				notes: notes
			}
		}).sort(sortByAttr("position"));
	}
</script>

<h2>Unit Positioning</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<p>
		Each unit has a certain distance they need to be from the first enemy before they can attack or use skills. If they are out of range, they will walk forward until they reach their range. If they are closer than this range, they will not walk backward.
	</p>

	<p>
		Distance from Saren is provided as a quick way to see which unit takes priority for Saren's TP boosting skill, which boosts the nearest allied unit.
	</p>

	<p><strong>The character's range value is not necessarily the exact position they will be at in an actual battle.</strong> When walking forward, units move in increments of 12, so they will end up closer than their minimum range if the distance to the closest enemy is not a multiple of 12. This is why Saren does not always boost the unit she's "supposed" to! Exact distances depend on team compositions. <!-- To simulate exact distances, try the <a href="simulator">simulator.</a> --></p>

	<DopeAssTable data={positionData} columns={columns} scroll={false} />
</DataComponent>
