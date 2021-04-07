<script>
	export let rarity;

	function setRarity(rarityOption) {
		return function() {
			rarity = rarityOption;
		}
	}
</script>

<span>
	{#each [1,2,3,4,5] as rarityOption}
		{#if rarity >= rarityOption}
			<div class="icon-star-full" on:click={setRarity(rarityOption)} ></div>
		{:else}
			<div class="icon-star-full unfull" on:click={setRarity(rarityOption)} ></div>
		{/if}
	{/each}
</span>

<style>
div {
	display: inline-block;
	height: 18px;
	width: 18px;
	padding-right: 1px;
	font-size: 18px;
	color: #ffd049;
	cursor: pointer
}

div.unfull {
/*	color: #cfe4ff;*/
	color: #ccd7e2;
}
</style>