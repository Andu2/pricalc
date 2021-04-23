<script>
	export let battlefield = {};

	import { getUnitImg } from "@src/logic/ui";
	import { sortByAttr } from "@src/utils"

	const LIMA_ID = 105201;

	$: distances = computeDistance(battlefield);

	function computeDistance(battlefield) {
		let distance = [];

		for (var i = battlefield.offense.length - 1; i >= 0; i--) {
			let actor = battlefield.offense[i];
			let allyDistances = getAllyDistances(actor, battlefield.offense);
			let enemyDistances = getEnemyDistances(actor, battlefield.defense);
			distance.push({
				img: getUnitImg(actor.config.id, actor.config.rarity),
				name: actor.name,
				side: actor.side,
				allyDistances: allyDistances,
				enemyDistances: enemyDistances
			});
		}

		for (var i = 0; i < battlefield.defense.length; i++) {
			let actor = battlefield.defense[i];
			let allyDistances = getAllyDistances(actor, battlefield.defense);
			let enemyDistances = getEnemyDistances(actor, battlefield.offense);
			distance.push({
				img: getUnitImg(actor.config.id, actor.config.rarity),
				name: actor.name,
				side: actor.side,
				allyDistances: allyDistances,
				enemyDistances: enemyDistances
			});
		}

		return distance;
	}

	function getAllyDistances(actor, allyActors) {
		let allyDistances = [];
		allyActors.forEach(function(ally) {
			if (ally === actor) return;
			allyDistances.push({
				img: getUnitImg(ally.config.id, ally.config.rarity),
				name: ally.name,
				distance: Math.round(Math.abs(ally.position - actor.position) * 100) / 100
			});
		});
		allyDistances.sort(sortByAttr("distance"))
		return allyDistances;
	}

	function getEnemyDistances(actor, enemyActors) {
		let enemyDistances = [];
		enemyActors.forEach(function(enemy) {
			enemyDistances.push({
				img: getUnitImg(enemy.config.id, enemy.config.rarity),
				name: enemy.name,
				distance: Math.round(Math.abs(enemy.position + actor.position) * 100) / 100
			});
		});
		enemyDistances.sort(sortByAttr("distance"))
		return enemyDistances;
	}
</script>

<table>
	<tr><th>Team</th><th>Unit</th><th>Distance to enemies</th><th>Distance to allies</th></tr>
	{#each distances as distanceSet}
	<tr>
		<td>
			{distanceSet.side}
		</td>
		<td>
			<div class="distance-icon">
				<div class="distance-icon-name">{distanceSet.name}</div>
				<img src={distanceSet.img} />
			</div>
		</td>
		<td>
			{#each distanceSet.enemyDistances as enemyDistance}
			<div class="distance-icon">
				<div class="distance-icon-name">{enemyDistance.name}</div>
				<img src={enemyDistance.img} />
				<div class="distance-icon-distance">{enemyDistance.distance}</div>
			</div>
			{/each}
		</td>
		<td>
			{#each distanceSet.allyDistances as allyDistance}
			<div class="distance-icon">
				<div class="distance-icon-name">{allyDistance.name}</div>
				<img src={allyDistance.img} />
				<div class="distance-icon-distance">{allyDistance.distance}</div>
			</div>
			{/each}
		</td>
	</tr>
	{/each}
</table>

<style>
	table {
		border-spacing: 20px;
	}

	img {
		width: 64px;
		height: 64px;
	}

	div.distance-icon {
		display: inline-block;
		margin:0 2px;
		text-align: center;
	}
</style>