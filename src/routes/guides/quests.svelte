<script>
	import { lookupRows, getTable } from "@src/data/priconnedb";
	import QuestViewer from "@src/components/QuestViewer.svelte";
	import DataComponent from "@src/components/DataComponent.svelte";

	const requiredTables = [ "quest_data", "quest_area_data", "wave_group_data", "enemy_parameter", "enemy_reward_data",
		"item_data", "equipment_data" ];

	let quests = [];
	let areas = [];
	let areaOptions = [];

	let questId = -1;
	let areaId = -9999;
	let isHard = false;

	$: calcAreaId = (isHard ? areaId + 1000 : areaId);
	$: questOptions = getQuestOptions(calcAreaId);
	$: questData = getQuestData(questId);

	function getQuestOptions(areaId) {
		if (areaId < 0) return [];
		let options = lookupRows("quest_data", { area_id: areaId });
		if (options.length) {
			questId = options[0].quest_id;
		}
		else {
			questId = -1;
		}
		return options;
	}

	function getQuestData(questId) {
		if (questId < 0) return null;
		return lookupRows("quest_data", { quest_id: questId })[0];
	}

	function onDataReady() {
		quests = getTable("quest_data");
		areas = lookupRows("quest_area_data", { map_type: 101 });
		areaOptions = areas.filter(function(area) {
			return (area.area_id < 12000); // normal = 11000, hard = 12000
		});

		areaId = areaOptions[0].area_id;
		questId = -1;
	}
</script>

<h2>Quest Data Reference</h2>
<DataComponent requiredTables={requiredTables} onDataReady={onDataReady} >
	<span class="config-label">Area:</span><select bind:value={areaId}>
		{#each areaOptions as area}
		<option value={area.area_id}>
			{area.area_name}
		</option>
		{/each}
	</select>
	<input type="checkbox" bind:checked={isHard} /> Hard
	<br />
	<span class="config-label">Quest:</span><select bind:value={questId}>
		{#each questOptions as quest}
		<option value={quest.quest_id}>
			{quest.quest_name}
		</option>
		{/each}
	</select>

	<QuestViewer questData={questData} />
</DataComponent>

<style>
span.config-label {
	width: 55px;
	display: inline-block;
}
</style>