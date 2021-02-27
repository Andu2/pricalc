<script>
	import { SKILL_NAMES, UNLOCKED_UNITS, lookupRows, getUnitSkills } from "@src/data/priconnedb";
	import Scatter from "svelte-chartjs/src/Scatter.svelte";

	let data = {
		datasets: [{
			backgroundColor: "rgba(255, 50, 50, 0.5)",
			pointRadius: 4,
			pointBorderWidth: 0,
			label: "Union Burst",
			data: []
		}, {
			backgroundColor: "rgba(50, 255, 50, 0.5)",
			pointRadius: 4,
			pointBorderWidth: 0,
			label: "Skill 1",
			data: []
		}, {
			backgroundColor: "rgba(50, 50, 255, 0.5)",
			pointRadius: 4,
			pointBorderWidth: 0,
			label: "Skill 2",
			data: []
		}]
	};
	let options = {
		scales: {
			xAxes: [{
				scaleLabel: {
					labelString: "Damage per Attack Stat",
					display: true
				}, 
				ticks: {
					min: 0
				}
			}],
			yAxes: [{
				scaleLabel: {
					labelString: "Damage per Skill Level",
					display: true
				}, 
				ticks: {
					min: 0
				}
			}]
		},
		tooltips: {
			// chart js does not make this easy eh
			callbacks: {
				label: function(tooltipItem, data) {
					console.log(tooltipItem, data)
					return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].name;
				}
			}
		}
	};

	let csvData = "data:text/csv;charset=utf-8,";
	
	csvData += ["Char", "AtkType", "SkillType", "Base", "LevelScaling", "AttackScaling"].join(",") + "\n";
	UNLOCKED_UNITS.forEach(function(unitData) {
		var unitSkills = getUnitSkills(unitData.unit_id);
		for (var skill in unitSkills) {
			var datasetIndex = ["union_burst", "main_skill_1", "main_skill_2"].indexOf(skill);
			unitSkills[skill].actions.forEach(function(action) {
				if (action.action_type === 1) {
					csvData += [unitData.unit_name, unitData.atk_type, skill, action.action_value_1, action.action_value_2, action.action_value_3].join(",") + "\n";
					data.datasets[datasetIndex].data.push({
						x: action.action_value_3,
						y: action.action_value_2,
						name: unitData.unit_name
					})
				}
			})
		}
	});

</script>
<p>
Damaging skills scale both by skill level and the user's attack stat. This chart shows the relationship between skill level scaling and attack scaling.
</p>
<Scatter {data} {options} />

<p><a href={csvData} download="damage-scaling.csv">Download CSV</a></p>
<p>A skill will show up more than once on this chart if it has multiple damaging components. For example, Hatsune's union burst has a component that deals damage to all enemies and a component that only deals damage to physical enemies, so both components will show up on this chart.</p>