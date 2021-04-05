{ // create local scope
	// Change to db we want to create in
	db = db.getSiblingDB('admin');
	
	// read-only user
	db.createUser(
		{
			user: "ridrevsweb",
			pwd: "ridrevsweb",
			roles: [
				{ role: "read", db: "ridiculousrevisions" }
			]
		}
	);

	// read/write user
	db.createUser(
		{
			user: "ridrevswrite",
			pwd: "ridrevswrite",
			roles: [
				{ role: "readWrite", db: "ridiculousrevisions" }
			]
		}
	);
}
