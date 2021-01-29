<script>
	import unlocked from "./global-unlocked.js";
	import { STAT_NAMES, createUnit, calculatePower } from "./priconne.js";

	var selected = {
		name: "Kokkoro",
		rarity: 1,
		level: 1,
		bond: 1,
		rank: 1,
		items: {
			equip_slot_1: false,
			refine_slot_1: 0,
			equip_slot_2: false,
			refine_slot_2: 0,
			equip_slot_3: false,
			refine_slot_3: 0,
			equip_slot_4: false,
			refine_slot_4: 0,
			equip_slot_5: false,
			refine_slot_5: 0,
			equip_slot_6: false,
			refine_slot_6: 0
		},
		skills: {
			union_burst: 1,
			main_skill_1: 1,
			main_skill_2: 1,
			ex_skill_1: 1
		}
	};

	var unit;

	var calculated = {
		power: 0
	}

	function maxAll() {
		selected.rarity = 5;
		selected.level = 80;
		selected.bond = 8;
		selected.rank = 7;
		selected.items = {
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
		selected.skills = {
			union_burst: 80,
			main_skill_1: 80,
			main_skill_2: 80,
			ex_skill_1: 80
		}
		recalculate();
	}

	function recalculate() {
		// garbage collect plz
		unit = createUnit(selected);
		calculated.power = calculatePower(unit);
	}

	recalculate();
</script>

<div>
	Unit: 
	<select bind:value={selected.name} on:change={recalculate}>
		{#each unlocked.units as unitName}
		<option value={unitName}>{unitName}</option>
		{/each}
	</select>
	Rarity: <input type="number" min=1 max=5 bind:value={selected.rarity} on:change={recalculate} />
	Level: <input type="number" min=1 max=80 bind:value={selected.level} on:change={recalculate} />
	Bond: <input type="number" min=1 max=8 bind:value={selected.bond} on:change={recalculate} />
	Rank: <input type="number" min=1 max=7 bind:value={selected.rank} on:change={recalculate} />
	<br />
	Equip 1: <input type="checkbox" bind:checked={selected.items.equip_slot_1} on:change={recalculate} />
	Equip 1 Refine: <input type="number" min=0 max=5 bind:value={selected.items.refine_slot_1} on:change={recalculate} />
	Equip 2: <input type="checkbox" bind:checked={selected.items.equip_slot_2} on:change={recalculate} />
	Equip 2 Refine: <input type="number" min=0 max=5 bind:value={selected.items.refine_slot_2} on:change={recalculate} />
	Equip 3: <input type="checkbox" bind:checked={selected.items.equip_slot_3} on:change={recalculate} />
	Equip 3 Refine: <input type="number" min=0 max=5 bind:value={selected.items.refine_slot_3} on:change={recalculate} />
	Equip 4: <input type="checkbox" bind:checked={selected.items.equip_slot_4} on:change={recalculate} />
	Equip 4 Refine: <input type="number" min=0 max=5 bind:value={selected.items.refine_slot_4} on:change={recalculate} />
	Equip 5: <input type="checkbox" bind:checked={selected.items.equip_slot_5} on:change={recalculate} />
	Equip 5 Refine: <input type="number" min=0 max=5 bind:value={selected.items.refine_slot_5} on:change={recalculate} />
	Equip 6: <input type="checkbox" bind:checked={selected.items.equip_slot_6} on:change={recalculate} />
	Equip 6 Refine: <input type="number" min=0 max=5 bind:value={selected.items.refine_slot_6} on:change={recalculate} />
	<br />
	Union Burst Level: <input type="number" min=1 max=80 bind:value={selected.skills.union_burst} on:change={recalculate} />
	Main Skill 1 Level: <input type="number" min=1 max=80 bind:value={selected.skills.main_skill_1} on:change={recalculate} />
	Main Skill 2 Level: <input type="number" min=1 max=80 bind:value={selected.skills.main_skill_2} on:change={recalculate} />
	Ex Skill 1 Level: <input type="number" min=1 max=80 bind:value={selected.skills.ex_skill_1} on:change={recalculate} />
	<br />
	<button type="button" on:click={maxAll}>Max all</button>
	<br />
	Power: {Math.round(calculated.power)}
	<br />
	<table>
		{#each STAT_NAMES as stat}
		<tr><td>{stat}</td><td>{Math.round(unit[stat])}</td>
		{/each}
	</table>
</div>