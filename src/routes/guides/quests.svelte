<script>
	import { lookupRows } from "@src/data/priconnedb";
	import QuestViewer from "@src/components/QuestViewer.svelte";

	let quests = lookupRows("quest_data", {});
	let areas = lookupRows("quest_area_data", { map_type: 101 });
	let areaOptions = areas.filter(function(area) {
		return (area.area_id < 12000); // normal = 11000, hard = 12000
	});

	let areaId = areaOptions[0].area_id;
	let isHard = false;
	$: calcAreaId = (isHard ? areaId + 1000 : areaId);

	let questId = -1;
	$: questOptions = getQuestOptions(calcAreaId)

	$: questData = lookupRows("quest_data", { quest_id: questId })[0];

	function getQuestOptions(areaId) {
		let options = lookupRows("quest_data", { area_id: areaId });
		if (options.length) {
			questId = options[0].quest_id;
		}
		else {
			questId = -1;
		}
		return options;
	}
</script>

<h2>Quest Data Reference</h2>

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

<style>
span.config-label {
	width: 55px;
	display: inline-block;
}
</style>