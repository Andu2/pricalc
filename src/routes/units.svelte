<script>
import { stores } from "@sapper/app";
import LZString from "lz-string";
const { page } = stores();

let unit;

if ($page.query.data) {
	unit = JSON.parse(LZString.decompressFromEncodedURIComponent($page.query.data));
}
else {
	unit = {
		id: -1,
		rarity: 1,
		level: 1,
		rank: 1,
		bond: 8,
		includeExSkillStats: true,
		equipment: {
			slot1: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot2: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot3: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot4: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot5: {
				equipped: false,
				refine: 0,
				id: -1
			},
			slot6: {
				equipped: false,
				refine: 0,
				id: -1
			}
		},
		skills: {
			union_burst: 1,
			main_skill_1: 1,
			main_skill_2: 1,
			ex_skill_1: 1
		},
		bonds: []
	};
}

import UnitCard from "@src/components/UnitCard.svelte";
</script>

<UnitCard bind:unit={unit}/>

<div>
	{LZString.compressToEncodedURIComponent(JSON.stringify(unit))}
</div>