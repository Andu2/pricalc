<script>
	export let team1;
	export let team2;

	const LIMA_ID = 105201;

	$: distance = computeDistance(team1, team2);

	var isEnemy = team1 != team2;

	function computeDistance() {
		var distance = [
			['', '', '', '', ''],
			['', '', '', '', ''],
			['', '', '', '', ''],
			['', '', '', '', ''],
			['', '', '', '', '']
		];

		for (var i = 0; i < team1.length; i++) {
			var unit1 = team1[i];
			for (var j = 0; j < team2.length; j++) {
				var unit2 = team2[j];

				var separation = '';

				if (unit1.id && unit2.id && unit1.id != unit2.id && unit1.inPosition && unit2.inPosition && unit1.id != LIMA_ID && unit2.id != LIMA_ID) {
					separation = isEnemy ? Math.abs(unit1.position + unit2.position) : Math.abs(unit1.position - unit2.position);
				}

				distance[5 - unit1.slot][5 - unit2.slot] = separation;
			}
		}

		return distance;
	}
</script>

<table>
	<tr>
		<td>&nbsp;</td>

		{#each team2 as unit2}
			<td>
				<img alt="{unit2.id}" class='table-icon' src='images/unit/unit_icon_unit_{unit2.id ? ((unit2.id + "").slice(0, 4) + "11") : "unknown"}.png' />
			</td>
		{/each}
	</tr>

	{#each team1 as unit1}
	<tr>
		<td>
			<img alt="{unit1.id}" class='table-icon' src='images/unit/unit_icon_unit_{unit1.id ? ((unit1.id + "").slice(0, 4) + "11") : "unknown"}.png' />
		</td>
		{#each team2 as unit2}
			<td>
				{distance[5 - unit1.slot][5 - unit2.slot]}
			</td>
		{/each}
	</tr>
	{/each}
</table>