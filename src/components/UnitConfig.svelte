<script>
	export let unitConfig = null;

	import UnitInput from "@src/components/UnitInput.svelte";
	import UnitCard from "@src/components/UnitCard.svelte";
</script>

<div id="config-wrap">
	{#if unitConfig}
	<UnitCard bind:unit={unitConfig} />
	{/if}
</div>

<style>
	div#config-wrap {
		margin-top: 20px;
	}
</style>
