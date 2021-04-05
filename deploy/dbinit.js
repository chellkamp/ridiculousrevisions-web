{ // create local scope

	print("Initializing database...");

	// Change to db we want to create in
	db = db.getSiblingDB('ridiculousrevisions');

	let collName = 'episode';

	if (db.getCollectionNames().indexOf(collName) < 0) {
		print(`Creating collection '${collName}'...`);
		db.createCollection(collName);
	} else {
		print (`Collection '${collName}' already exists.`)
	}

	let idxName = 'episode_pubDate';

	let foundIdxObj = db[collName].getIndexes().find(
		idx => {return idx['name'] && idx['name'] === idxName}
	)

	if (foundIdxObj) {
		print(`Dropping index '${idxName}'...`);
		db[collName].dropIndex(idxName);
	}

	print(`Creating index \'${idxName}\'...`);
	db[collName].createIndex(
		{ 'pubDate':1 },
		{ 'name': idxName }
	);

	print ("Done.");

}