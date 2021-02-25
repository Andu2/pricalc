<script>
import { stores } from "@sapper/app";
import LZString from "lz-string";
const { page } = stores();
import { savedUnit } from "@src/settings.js"

// if ($page.query.data) {
// 	unit = JSON.parse(LZString.decompressFromEncodedURIComponent($page.query.data));
// }

let unit = $savedUnit;
$: savedUnit.set(unit)

import UnitCard from "@src/components/UnitCard.svelte";
</script>

<UnitCard bind:unit={unit}/>

<!-- <div>
	{LZString.compressToEncodedURIComponent(JSON.stringify(unit))}
</div> -->