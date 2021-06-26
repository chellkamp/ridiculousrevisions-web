/*
 * Utility functions for database.  Can only be used on server side.
 */

const {MongoClient} = require('mongodb');
const {PrivateConfig} = require('./PrivateConfig');

/**
 * Creates a new instance of MongoClient with our read-only options.
 * @returns {MongoClient}
 */
function createReadOnlyMongoClient() {
	let config = PrivateConfig.get();
	let options = null;
	if (config.db['USE_DB_CERT']) {
		let ca = [config.file_contents['DB_CERT']];
		options = {
			sslCA: ca,
			sslValidate: true,
			useNewUrlParser: true
		};
	}
	
	let client = options? new MongoClient(config.db.DB_STRING, options) : new MongoClient(config.db.DB_STRING);
	return client;
}

/**
 * Creates a new instance of MongoClient with our read-only options.
 * @returns {MongoClient}
 */
function createWritableMongoClient() {
	let config = PrivateConfig.get();
	let options = null;
	if (config.db['USE_DB_CERT']) {
		let ca = [config.file_contents['DB_CERT']];
		options = {
			sslCA: ca,
			sslValidate: true,
			useNewUrlParser: true
		};
	}
	
	let client = options? new MongoClient(config.db.DB_STRING_EDIT, options) : new MongoClient(config.db.DB_STRING_EDIT);
	return client;
}


/**
 * Finds a unique entry in the DB by guid
 * @param {string} guid guid in database
 * @returns {Promise<Object>} document object if found.  Otherwise, null.
 */
export async function getEpisodeDocForGuid(guid) {
	let config = PrivateConfig.get();
	let retVal = null;
	
	let client = createReadOnlyMongoClient();
	
	try {
		await client.connect();
		const database = client.db(config.db.DB);
		const collection = database.collection(config.db.DB_TABLE);
		const query = {guid: guid};
		
		retVal = collection.findOne(query);
	} finally {
		await client.close();
	}
	
	return retVal;
}

/**
 * @param {string} guid guid in database
 * @param {Object} data data to set in DB
 * @returns {Promise<boolean>} true for success; false for failure
 */
export async function saveEpisodeDoc(guid, data) {
	let config = PrivateConfig.get();
	let retVal;
	
	let client = createWritableMongoClient();
	
	try {
		await client.connect();
		const database = client.db(config.db.DB);
		const collection = database.collection(config.db.DB_TABLE);
		const query = {guid: guid};
		const options = {upsert: true};
		const setObj = {$set: data};
		
		let opResult = await collection.updateOne(query, setObj, options);
		retVal = opResult.result.ok;
	} finally {
		await client.close();
	}
	return retVal;
}

/**
  Looks up all documents from the for the given day
  and returns them
 */
export async function getEpisodeDocsForUTCDate(
	year, //[required] full year
	month, //[required] month, 0-11, 0=January
	day //[required] day within month
) {
	let config = PrivateConfig.get();
	let retVal = null;
	
	let minDateMs = Date.UTC(year, month, day);
	let maxDate = new Date(minDateMs);
	maxDate.setUTCDate(maxDate.getUTCDate() + 1);
	let maxDateMs = maxDate.getTime();
	
	let client = createReadOnlyMongoClient();
	
	try {
		await client.connect();
		const database = client.db(config.db.DB);
		const collection = database.collection(config.db.DB_TABLE);
		const query = { pubDate: { $gte: minDateMs, $lt: maxDateMs}};
		retVal = await collection.find(query, { sort: {pubDate: 1}}).toArray();
	} finally {
		await client.close();
	}
	
	return retVal;
}

/**
 * Convert database episode to JSON object that's serializable for HTML hydration.
 */
export function getSerializableEpisode(episodeDoc) {
	let retVal = {
		guid: null,
		pubDate: null,
		additionalInfo: null
	};
	
	if (episodeDoc) {
		if (episodeDoc['guid']) {
			retVal.guid = episodeDoc.guid;
		}
		
		if (episodeDoc['pubDate']) {
			retVal.pubDate = episodeDoc.pubDate;
		}
		
		if (episodeDoc['additionalInfo']) {
			retVal.additionalInfo = episodeDoc.additionalInfo;
		}
	}
	
	return retVal;
}
