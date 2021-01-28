//backend script to run when the data changes
var dumpTables = [
	"unit_enemy_data",
	"enemy_parameter",
	"equipment_data",
	"equipment_enhance_rate",
	"unit_attack_pattern",
	"unit_data",
	"unit_promotion",
	"unit_promotion_status",
	"unit_rarity",
	"unit_skill_data",
	"skill_data",
	"chara_story_status",
	"story_detail"
];

// Note: Originally used "sqlite-json", found that package had a bug. Discovered this package was more popular.
var sqliteJson = require("sqlite-to-json");
var sqlite3 = require("sqlite3");
var exporter = new sqliteJson({
	client: new sqlite3.Database("priconne.db")
});

dumpTables.forEach(function(table) {
	exporter.save(table, "./data/" + table + ".json", function(){});
});