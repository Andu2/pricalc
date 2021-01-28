echo "Clearing database"
rm priconne.db
for i in redive_master_db_diff/*.sql
do
	echo "processing $i"
	sqlite3 priconne.db ".read $i"
done