<script>
	export let data;
	export let columns;
	export let options = {};

	import Tooltip from "@src/components/Tooltip.svelte";

	// {
	// 	attr: "hp",
	// 	displayName: "HP",
	// 	sort: null / "default" / function
	// 	html: false
	// }

	let sort = {
		attr: undefined,
		column: null,
		ascending: false
	};

	$: resort(sort, data);

	function changeSort(column) {
		return function() {
			if (column.sort) {
				sort.column = column;
				if (sort.attr === column.attr) {
					sort.ascending = !sort.ascending;
				}
				else {
					sort.ascending = false;
					sort.attr = column.attr;
				}
			}
		}
	}

	function resort(sort) {
		let column = sort.column;
		if (!column) return;
		if (typeof column.sort === "function") {
			data.sort(column.sort);
		}
		else if (column.sort === "numeric") {
			data.sort(function(row1, row2) {
				let row1Numeric = row1[sort.attr] * 1;
				let row2Numeric = row2[sort.attr] * 1;
				if (row1Numeric > row2Numeric) return 1;
				else if (row1Numeric < row2Numeric) return -1;
				else return 0;
			});
		}
		else {
			data.sort(function(row1, row2) {
				if (row1[sort.attr] > row2[sort.attr]) return 1;
				else if (row1[sort.attr] < row2[sort.attr]) return -1;
				else return 0;
			});
		}

		if (!sort.ascending) {
			data.reverse();
		}

		// This is to force svelte to update
		data = data.slice();
	}
</script>

<div class="table-wrap">
	<table>
		<tr>
		{#each columns as column}
			<th class="heading" class:top={!!column.helpText} on:click={changeSort(column)}>
				{column.displayName}
				{#if column.helpText}
				<Tooltip header={column.displayName} text={column.helpText} />
				{/if}
			</th>
		{/each}
		</tr>
		{#each data as row, i}
		<tr class:odd={i % 2 === 1} class:even={i % 2 === 0}>
			{#each columns as column}
				{#if column.html}
				<td>{@html row[column.attr]}</td>
				{:else if typeof column.displayValue === "function"}
				<td>{@html column.displayValue(row)}</td>
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
	overflow-x: auto;
}

td.positive {
	color: green;
}

td.negative {
	color: red;
}

/* This is a dumb temporary solution that only works if one column has help text */
th.top {
	z-index: 1;
}
</style>