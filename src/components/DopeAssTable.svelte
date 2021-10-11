<script>
	// TODO: make more dope and less ass
	export let data;
	export let columns;
	export let options = {};
	export let scroll = true;

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
	$: displayValues = getDisplayValues(data, columns, options);

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
				if (isNaN(row1Numeric)) row1Numeric = Infinity;
				if (isNaN(row2Numeric)) row2Numeric = Infinity;
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

	function getDisplayValues(data, columns, options) {
		return data.map(function(row) {
			let displayRow = {};
			for (var column in columns) {
				let colData = {
					value: row[columns[column].attr],
					classes: []
				}
				if (typeof columns[column].displayValue === "function") {
					colData.value = columns[column].displayValue(row, columns[column].attr)
				}
				if (options.colorValues && typeof row[columns[column].attr] === "number") {
					if (isNaN(row[columns[column].attr])) colData.classes.push("nan");
					else if (row[columns[column].attr] > 0) colData.classes.push("positive");
					else if (row[columns[column].attr] < 0) colData.classes.push("negative");
				}
				displayRow[columns[column].attr] = colData;
			}
			return displayRow;
		});
	}
</script>

<div class="table-wrap" class:scroll={scroll}>
	<table>
		<tr>
		{#each columns as column}
			<th class="heading" class:top={!!column.helpText} on:click={changeSort(column)}>
				{#if column.html}
					{@html column.displayName}
				{:else}
					{column.displayName}
				{/if}
				{#if sort.attr === column.attr}
					{#if sort.ascending}
					▲
					{:else}
					▼
					{/if}
				{/if}
				{#if column.helpText}
				<Tooltip header={column.displayName} text={column.helpText} />
				{/if}
			</th>
		{/each}
		</tr>
		{#each displayValues as row, i}
		<tr class:odd={i % 2 === 1} class:even={i % 2 === 0}>
			{#each columns as column}
				<td class={row[column.attr].classes.join(" ")} >
				{#if column.html}
					{@html row[column.attr].value}
				{:else}
					{row[column.attr].value}
				{/if}
				</td>
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

th:hover {
	color: #566590
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

div.scroll {
	max-height: 750px;
	overflow-x: auto;
}

div.table-wrap {
	display: inline-block;
	max-width: 100%;

	/* Is there no good solution? CSS is so shit */
/*	border-style: solid;
	border-color: #cfe4ff;
	border-width: 3px 0;*/

	/* Incredibly difficult to get scroll shadows on top of content */
/*	background:
		linear-gradient(white 30%, rgba(255,255,255,0)),
		linear-gradient(rgba(255,255,255,0), white 70%) 0 100%,

		linear-gradient(rgba(22,59,90,0.25) 0%, rgba(22,59,90,0)),
		linear-gradient(rgba(22,59,90,0), rgba(22,59,90,0.25) 100%) 0 100%;

	background-repeat: no-repeat;
	background-size: 100% 50px, 100% 50px, 100% 15px, 100% 15px;
	background-attachment: local, local, scroll, scroll;
	background-color: transparent;

	position: relative;*/
}

td.positive {
	color: green;
}

td.negative {
	color: red;
}

</style>
