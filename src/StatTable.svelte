<script>
	import unlocked from "./global-unlocked.js";
	import { STAT_NAMES, createUnit, calculatePower } from "./priconne.js";

	var maxedUnits = unlocked.units.map(function(unitName) {
		return createUnit({
			name: unitName,
			rarity: 5,
			level: 80,
			bond: 8,
			rank: 7,
			items: {
				equip_slot_1: false,
				refine_slot_1: 0,
				equip_slot_2: true,
				refine_slot_2: 5,
				equip_slot_3: true,
				refine_slot_3: 5,
				equip_slot_4: true,
				refine_slot_4: 5,
				equip_slot_5: true,
				refine_slot_5: 5,
				equip_slot_6: true,
				refine_slot_6: 5
			},
			skills: {
				union_burst: 80,
				main_skill_1: 80,
				main_skill_2: 80,
				ex_skill_1: 80
			}
		});
	});

	var tableHeaders = ["Name"];
	tableHeaders = tableHeaders.concat(STAT_NAMES);
	tableHeaders.push("Power");
</script>

<div>
	<table>
		<tr>
		{#each tableHeaders as header}
			<th>{header}</th>
		{/each}
		</tr>
		{#each maxedUnits as unit}
		<tr>
			<td>{unit.name}</td>
			{#each STAT_NAMES as stat}
				<td>{Math.round(unit[stat])}</td>
			{/each}
			<td>{Math.round(calculatePower(unit))}</td>
		{/each}
	</table>
</div>