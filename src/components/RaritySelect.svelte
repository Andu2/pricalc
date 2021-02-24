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
			<img src="images/star_filled.svg" on:click={setRarity(rarityOption)} />
		{:else}
			<img src="images/star_empty.svg" on:click={setRarity(rarityOption)} />
		{/if}
	{/each}
</span>

<style>
img {
	height: 18px;
	width: 18px;
	cursor: pointer
}
</style>