<script>
	import { lookupRows } from "@src/data/priconnedb";
	import RaritySelect from "@src/components/RaritySelect.svelte";

	const amuletCosts = lookupRows("shop_static_price_group", {});
	const rarityCostSample = lookupRows("unit_rarity", { unit_id: 100101 });

	let initialRarity = 3;
	let desiredRarity = 5;
	let currentShards = 0;
	let shardsBought = 0;

	$: costs = calculateCost(initialRarity, desiredRarity, currentShards, shardsBought);

	function calculateCost(initialRarity, desiredRarity, currentShards, shardsBought) {
		let shardsNeeded = 0;
		rarityCostSample.forEach(function(costData) {
			if (costData.rarity <= desiredRarity && costData.rarity > initialRarity) {
				shardsNeeded += costData.consume_num;
			}
		});
		shardsNeeded = Math.max(shardsNeeded - currentShards, 0);

		let response = {
			shards: shardsNeeded
		};

		let amuletsNeeded = 0;
		// assumes sorted
		amuletCosts.forEach(function(costData) {
			let shardsToBuy = 0;
			if (costData.buy_count_to === -1) {
				shardsToBuy = shardsNeeded;
			}
			else {
				shardsToBuy = Math.min(shardsNeeded, Math.max(costData.buy_count_to - shardsBought));
			}

			amuletsNeeded += shardsToBuy * costData.count;
			shardsNeeded -= shardsToBuy;
			shardsBought += shardsToBuy;
		});

		response.amulets = amuletsNeeded;
		return response;
	}
</script>

<div id="header">
	<img class="header-image" src="images/item/icon_icon_item_90005.png" />

	<h2>Memory Shard Divine Amulet Costs</h2>

	<p>Memory shards of characters you already own can be purchased with divine amulets. The divine amulet cost goes up as you buy more shards, up to a maximum of five divine amulets per shard. You can use this calculator to see how many divine amulets you'll need to reach a desired rarity.</p>
</div>

<div id="reference-tables">
	<div class="info-column">
		<table class="info-table">
			<tr><th>Shard From</th><th>Shard To</th><th>Amulet Cost</th></tr>
			{#each amuletCosts as costData, i}
			<tr class:even={i % 2 === 0}>
				<td>{costData.buy_count_from}</td>
				<td>{costData.buy_count_to === -1 ? "∞" : costData.buy_count_to}</td>
				<td>{costData.count}</td>
			</tr>
			{/each}
		</table>
	</div>
	<div class="info-column">
		<table class="info-table">
			<tr><th>Unit Rarity</th><th>Shard Cost</th></tr>
			{#each rarityCostSample as costData, i}
			<tr class:even={i % 2 === 0}>
				<td>{costData.rarity}</td>
				<td>{costData.consume_num}</td>
			</tr>
			{/each}
		</table>
	</div>
</div>

<table class="input-table">
	<tr><td class="label-cell">Current rarity:</td><td class="input-cell"><RaritySelect bind:rarity={initialRarity} /></td></tr>
	<tr><td class="label-cell">Desired rarity:</td><td class="input-cell"><RaritySelect bind:rarity={desiredRarity} /></td></tr>
	<tr><td class="label-cell">Current shards:</td><td class="input-cell"><input type="number" min=0 max=999 bind:value={currentShards} /></td></tr>
	<tr><td class="label-cell">Shards previously bought:</td><td class="input-cell"><input type="number" min=0 max=999 bind:value={shardsBought} /></td></tr>
</table>

<p>Reaching the desired rarity will cost <strong>{costs.shards}</strong> shards, which will cost <strong>{costs.amulets}</strong> <img class="inline-icon" src="images/item/icon_icon_item_90005.png" /> divine amulets.</p>

<style>
	div#header {
		overflow: auto; /* float margin fix */
	}

	img.header-image {
		float: left;
		margin-right: 10px;
	}

	div#reference-tables {
		margin: 20px 0;
		clear: both;
	}

	div.info-column {
		display: inline-block;
		vertical-align: bottom;
	}

	div.info-column + div.info-column {
		margin-left: 20px;
	}

	table.info-table th {
		color: #303b5a;
		border-bottom: 2px solid #566590;
		padding: 0 2px;
	}

	table.info-table td {
		padding: 0 2px;
	}

	table.info-table tr.even {
		background-color: #cfe4ff;
	}

	table.input-table {
		border-spacing: 5px;
	}

	td.label-cell {
		font-weight: bold;
		color: #303b5a;
		padding-right: 20px;
	}
</style>