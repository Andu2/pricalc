<script>
	import { STAT_NAMES, createActor, calculatePower, getUnlockedUnits } from "@src/priconne.js";

	var maxedUnits;
	var tableData;
	var includeExSkill = true;
	var sort = {
		column: 0,
		ascending: false
	}

	var unlockedUnits = getUnlockedUnits();

	var statsWeCareAbout = STAT_NAMES.filter(function(stat) {
		return (["physical_penetrate", "magic_penetrate"].indexOf(stat) === -1)
	});
	var tableHeaders = ["Icon", "Name", "HP", "Physical Attack", "Magic Attack", "Physical Defense", "Magic Defense", "Physical Critical Rate", 
		"Magic Critical Rate", "HP Regen", "TP Regen", "Dodge", "HP Drain", "HP Recovery Boost", "TP Boost", "TP Retain", "Accuracy", "Power"];

	function changeSort(event) {
		var i = event.target.getAttribute("data-colnum") * 1;
		if (sort.column === i) {
			sort.ascending = !sort.ascending;
		}
		else {
			sort.ascending = false;
			sort.column = i;
		}

		tableData.sort(function(row1, row2) {
			if (row1[sort.column] > row2[sort.column]) {
				return (sort.ascending ? 1 : -1);
			}
			else if (row1[sort.column] < row2[sort.column]) {
				return (sort.ascending ? -1 : 1);
			}
			else return 0;
		});

		// This is to force svelte to update
		tableData = tableData.slice();
	}

	function recalculate() {
		maxedUnits = unlockedUnits.map(function(unitData) {
			return createActor({
				id: unitData.unit_id,
				rarity: 5,
				level: 85,
				bond: 8,
				rank: 8,
				equipment: {
					slot1: {
						equipped: true,
						refine: 5,
						id: -1
					},
					slot2: {
						equipped: true,
						refine: 5,
						id: -1
					},
					slot3: {
						equipped: true,
						refine: 5,
						id: -1
					},
					slot4: {
						equipped: true,
						refine: 5,
						id: -1
					},
					slot5: {
						equipped: true,
						refine: 5,
						id: -1
					},
					slot6: {
						equipped: true,
						refine: 5,
						id: -1
					}
				},
				skills: {
					union_burst: 1,
					main_skill_1: 1,
					main_skill_2: 1,
					ex_skill_1: 85
				},
				includeExSkillStats: includeExSkill
			});
		});

		tableData = maxedUnits.map(function(unit) {
			var unitIdString = unit.id + "";
			var unitIdWithRarity = unitIdString.slice(0, 4) + "3" + unitIdString.slice(-1); 
			var charImg = "images/unit/unit_icon_unit_" + unitIdWithRarity + ".png";

			var row = [charImg, unit.unitData.unit_name];
			statsWeCareAbout.forEach(function(stat) {
				row.push(Math.round(unit[stat]));
			});
			row.push(Math.round(calculatePower(unit)));
			return row;
		});
	}

	recalculate();
</script>

<div>
	<input type="checkbox" bind:checked={includeExSkill} on:change={recalculate} /> Include EX skill stat boosts
	<table>
		<tr>
		{#each tableHeaders as header, i}
			<th data-colnum={i} on:click={changeSort}>{header}</th>
		{/each}
		</tr>
		{#each tableData as row}
		<tr>
			{#each row as cellData, i}
				{#if i===0} <!--special rule - turn first cell into image-->
				<td><img class="icon" src={cellData}/></td>
				{:else}
				<td>{cellData}</td>
				{/if}
			{/each}
		</tr>
		{/each}
	</table>
</div>

<style>
th {
	cursor: pointer;
	padding: 0px 5px;
}
td.imgcell {
	/*white-space: nowrap;*/
}
img.icon {
	width: 40px;
	height: 40px;
}
</style>