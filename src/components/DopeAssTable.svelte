<script>
	export let data;
	export let columns;
	export let options = {};

	// {
	// 	attr: "hp",
	// 	displayName: "HP",
	// 	sort: null / "default" / function
	// 	html: false
	// }

	let sort = {
		attr: undefined,
		ascending: false
	};

	function changeSort(column) {
		return function() {
			if (column.sort) {
				if (sort.attr === column.attr) {
					sort.ascending = !sort.ascending;
				}
				else {
					sort.ascending = false;
					sort.attr = column.attr;
				}

				if (typeof column.sort === "function") {
					data.sort(column.sort);
					if (!sort.ascending) {
						data.reverse();
					}
				}
				else {
					data.sort(function(row1, row2) {
						if (row1[sort.attr] > row2[sort.attr]) {
							return (sort.ascending ? 1 : -1);
						}
						else if (row1[sort.attr] < row2[sort.attr]) {
							return (sort.ascending ? -1 : 1);
						}
						else return 0;
					});
				}

				// This is to force svelte to update
				data = data.slice();
			}
		}
	}
</script>

<div class="table-wrap">
	<table>
		<tr>
		{#each columns as column}
			<th class="heading" on:click={changeSort(column)}>{column.displayName}</th>
		{/each}
		</tr>
		{#each data as row, i}
		<tr class:odd={i % 2 === 1} class:even={i % 2 === 0}>
			{#each columns as column}
				{#if column.html}
				<td>{@html row[column.attr]}</td>
				{:else}
				<td class:positive={options.colorValues && typeof row[column.attr] === "number" && row[column.attr] > 0}
					class:negative={options.colorValues && typeof row[column.attr] === "number" && row[column.attr] < 0}>{row[column.attr]}</td>
				{/if}
			{/each}
		</tr>
		{/each}
	</table>
</div>

<style>
table {
	position: relative;
}
th {
	cursor: pointer;
	padding: 2px 5px;
	position: sticky;
	background-color: white;
	top: 0;
	border-bottom: 2px solid #566590;
}
td.imgcell {
	/*white-space: nowrap;*/
}
td {
	padding: 0 2px;
}
tr.even {
	background-color: #cfe4ff;
}

div.table-wrap {
	max-height: 800px;
}

td.positive {
	color: green;
}

td.negative {
	color: red;
}
</style>