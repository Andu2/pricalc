<script>
	import { jpContentHistory } from "@src/data/priconnedb";
	import { formatDate } from "@src/utils";
	import DopeAssTable from "@src/components/DopeAssTable.svelte";
	import JPContentHeader from "@src/components/JPContentHeader.svelte";
	import JPContentFooter from "@src/components/JPContentFooter.svelte";

		const jpLaunchDate = new Date(jpContentHistory.jpLaunchDate);
		const enLaunchDate = new Date(jpContentHistory.enLaunchDate);

	function getArenaName(arena) {
		if (arena === "arena") return "Arena";
		else if (arena === "princessArena") return "Princess Arena";
		else return "???";
	}

	let shopDisplayNames = {
		"dungeon": "Dungeon",
		"arena": "Arena",
		"princessArena": "Princess Arena",
		"clanBattle": "Clan Battle",
		"master": "Master"
	}

	// Feature
	const featureColumns = [
		{
			attr: "feature",
			displayName: "Feature",
			sort: "default"
		}, {
			attr: "jpDate",
			displayName: "JP Release Date‎",
			sort: "default"
		}, {
			html: true,
			attr: "jpDaysAfterLaunch",
			displayName: "Days since JP Launch",
			sort: "numeric"
		}, {
			html: true,
			attr: "enDaysToRelease",
			displayName: "Days to EN Release",
			sort: "numeric"
		}, {
			html: true,
			attr: "enReleaseDate",
			displayName: "Expected EN Release Date",
			sort: "default"
		}
	];
	const featureData = (() => {
		return jpContentHistory.features.map(feature => {
			const jpDaysAfterLaunch = Math.round((new Date(feature.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysAfterLaunch = Math.round((Date.now() - enLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysToRelease = jpDaysAfterLaunch - enDaysAfterLaunch;
			const enReleaseDate = new Date((Date.now() + (enDaysToRelease * 1000 * 60 * 60 * 24)));

			return {
				feature: feature.description,
				jpDate: formatDate(new Date(feature.jpDate)),
				jpDaysAfterLaunch,
				enDaysToRelease,
				enReleaseDate: formatDate(enReleaseDate),
			};
		});
	})();

	// Dungeon
	const dungeonColumns = [
		{
			attr: "dungeon",
			displayName: "Dungeon",
			sort: "default"
		}, {
			attr: "jpDate",
			displayName: "JP Release Date‎",
			sort: "default"
		}, {
			html: true,
			attr: "jpDaysAfterLaunch",
			displayName: "Days since<br/>JP Launch",
			sort: "numeric"
		}, {
			html: true,
			attr: "enDaysToRelease",
			displayName: "Days to<br/>EN Release",
			sort: "numeric"
		}, {
			html: true,
			attr: "enReleaseDate",
			displayName: "Expected EN<br/>Release Date",
			sort: "default"
		}
	];
	const dungeonData = (() => {
		return jpContentHistory.dungeon.map(dungeon => {
			const jpDaysAfterLaunch = Math.round((new Date(dungeon.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysAfterLaunch = Math.round((Date.now() - enLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysToRelease = jpDaysAfterLaunch - enDaysAfterLaunch;
			const enReleaseDate = new Date((Date.now() + (enDaysToRelease * 1000 * 60 * 60 * 24)));

			return {
				dungeon: dungeon.level,
				jpDate: formatDate(new Date(dungeon.jpDate)),
				jpDaysAfterLaunch,
				enDaysToRelease,
				enReleaseDate: formatDate(enReleaseDate),
			};
		});
	})();

 	// Grotto
	const grottoColumns = [
		{
			attr: "grotto",
			displayName: "Grotto Level",
			sort: "default"
		}, {
			attr: "jpDate",
			displayName: "JP Release Date‎",
			sort: "default"
		}, {
			html: true,
			attr: "jpDaysAfterLaunch",
			displayName: "Days since<br/>JP Launch",
			sort: "numeric"
		}, {
			html: true,
			attr: "enDaysToRelease",
			displayName: "Days to<br/>EN Release",
			sort: "numeric"
		}, {
			html: true,
			attr: "enReleaseDate",
			displayName: "Expected EN<br/>Release Date",
			sort: "default"
		}
	];
	const grottoData = (() => {
		return jpContentHistory.grotto.map(grotto => {
			const jpDaysAfterLaunch = Math.round((new Date(grotto.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysAfterLaunch = Math.round((Date.now() - enLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysToRelease = jpDaysAfterLaunch - enDaysAfterLaunch;
			const enReleaseDate = new Date((Date.now() + (enDaysToRelease * 1000 * 60 * 60 * 24)));

			return {
				grotto: grotto.level,
				jpDate: formatDate(new Date(grotto.jpDate)),
				jpDaysAfterLaunch,
				enDaysToRelease,
				enReleaseDate: formatDate(enReleaseDate),
			};
		});
	})();

	// Shards in Shop
	const shardColumns = [
		{
			attr: "character",
			displayName: "Character",
			sort: "default"
		}, {
			attr: "shop",
			displayName: "Shop",
			sort: "default"
		}, {
			attr: "jpDate",
			displayName: "JP Release Date‎",
			sort: "default"
		}, {
			html: true,
			attr: "jpDaysAfterLaunch",
			displayName: "Days since<br/>JP Launch",
			sort: "numeric"
		}, {
			html: true,
			attr: "enDaysToRelease",
			displayName: "Days to<br/>EN Release",
			sort: "numeric"
		}, {
			html: true,
			attr: "enReleaseDate",
			displayName: "Expected EN<br/>Release Date",
			sort: "default"
		}
	];
	const shardData = (() => {
		return jpContentHistory.shardsInShop.map(shard => {
			const jpDaysAfterLaunch = Math.round((new Date(shard.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysAfterLaunch = Math.round((Date.now() - enLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysToRelease = jpDaysAfterLaunch - enDaysAfterLaunch;
			const enReleaseDate = new Date((Date.now() + (enDaysToRelease * 1000 * 60 * 60 * 24)));

			return {
				character: shard.name,
				shop: shopDisplayNames[shard.shop],
				jpDate: formatDate(new Date(shard.jpDate)),
				jpDaysAfterLaunch,
				enDaysToRelease,
				enReleaseDate: formatDate(enReleaseDate),
			};
		});
	})();

	// Arena Shuffles
	const arenaShuffleColumns = [
		{
			attr: "name",
			displayName: "Arena Name",
			sort: "default"
		}, {
			attr: "jpDate",
			displayName: "JP Date‎",
			sort: "default"
		}, {
			html: true,
			attr: "jpDaysAfterLaunch",
			displayName: "Days since<br/>JP Launch",
			sort: "numeric"
		}, {
			html: true,
			attr: "enDaysToRelease",
			displayName: "Days to<br/>EN Shuffle",
			sort: "numeric"
		}, {
			html: true,
			attr: "enReleaseDate",
			displayName: "Expected EN Date",
			sort: "default"
		}
	];
	const arenaShuffleData = (() => {
		return jpContentHistory.arenaShuffle.map(arenaShuffle => {
			const jpDaysAfterLaunch = Math.round((new Date(arenaShuffle.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysAfterLaunch = Math.round((Date.now() - enLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysToRelease = jpDaysAfterLaunch - enDaysAfterLaunch;
			const enReleaseDate = new Date((Date.now() + (enDaysToRelease * 1000 * 60 * 60 * 24)));

			return {
				name: getArenaName(arenaShuffle.type),
				jpDate: formatDate(new Date(arenaShuffle.jpDate)),
				jpDaysAfterLaunch,
				enDaysToRelease,
				enReleaseDate: formatDate(enReleaseDate),
			};
		});
	})();


	// Furniture
	const furnitureLevelColumns = [
		{
			attr: "furnitureLevelCap",
			displayName: "Furniture Level Cap",
			sort: "default"
		}, {
			attr: "jpDate",
			displayName: "JP Date‎",
			sort: "default"
		}, {
			html: true,
			attr: "jpDaysAfterLaunch",
			displayName: "Days since<br/>JP Launch",
			sort: "numeric"
		}, {
			html: true,
			attr: "enDaysToRelease",
			displayName: "Days to<br/>EN Shuffle",
			sort: "numeric"
		}, {
			html: true,
			attr: "enReleaseDate",
			displayName: "Expected EN Date",
			sort: "default"
		}
	];
	const furnitureLevelData = (() => {
		return jpContentHistory.furnitureLevelCap.map(furnitureLevel => {
			const jpDaysAfterLaunch = Math.round((new Date(furnitureLevel.jpDate) - jpLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysAfterLaunch = Math.round((Date.now() - enLaunchDate) / 1000 / 60 / 60 / 24);
			const enDaysToRelease = jpDaysAfterLaunch - enDaysAfterLaunch;
			const enReleaseDate = new Date((Date.now() + (enDaysToRelease * 1000 * 60 * 60 * 24)));

			return {
				furnitureLevelCap: furnitureLevel.level,
				jpDate: formatDate(new Date(furnitureLevel.jpDate)),
				jpDaysAfterLaunch,
				enDaysToRelease,
				enReleaseDate: formatDate(enReleaseDate),
			};
		});
	})();


</script>

<h2>JP Misc Features Timeline</h2>

<JPContentHeader />

<h3>Features</h3>
<DopeAssTable data={featureData} columns={featureColumns} scroll={false} />

<h3>Dungeons</h3>
<DopeAssTable data={dungeonData} columns={dungeonColumns} scroll={false} />

<h3>Grotto Quests</h3>
<DopeAssTable data={grottoData} columns={grottoColumns} scroll={false} />

<h3>Shards in Shop</h3>
<DopeAssTable data={shardData} columns={shardColumns} scroll={false} />

<h3>Arena Shuffles</h3>
<DopeAssTable data={arenaShuffleData} columns={arenaShuffleColumns} scroll={false} />

<h3>Furniture Levels</h3>
<DopeAssTable data={furnitureLevelData} columns={furnitureLevelColumns} scroll={false} />

<JPContentFooter />

<style>
	table + h3 {
		margin-top: 40px;
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
</style>
