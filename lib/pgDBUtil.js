/*
 * Utility functions for postgresql database.  Can only be used on server side.
 */
const {Client} = require('pg')
const {PrivateConfig} = require('./PrivateConfig');

/**
 * Creates a new instance of pg Client with our read-only options.
 * @returns {Client}
 */
function createReadOnlyClient() {
	let config = PrivateConfig.get();
		
	let client = new Client({connectionString: config.db.DB_STRING});
	return client;
}

/**
 * Creates a new instance of pg Client with our read-only options.
 * @returns {Client}
 */
function createWritableClient() {
	let config = PrivateConfig.get();
	
	let client = new Client({connectionString: config.db.DB_STRING_EDIT});
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
	
	let client = createReadOnlyClient();
	
	try {
		await client.connect();
		
		const query = {
			text: `SELECT * FROM "${config.db.DB_TABLE}" WHERE "guid" = $1 limit 1`,
			values: [guid]
		};
		
		retVal = await client.query(query);
		retVal = (retVal.rows.length > 0) ? retVal.rows[0] : null;				
	} finally {
		await client.end();
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
	
	let client = createWritableClient();
	
	try {
		await client.connect();
		
		const query = {
			text: `INSERT INTO "${config.db.DB_TABLE}"("guid", "pubDate", "additionalInfo") ` +
                  `VALUES ($1, $2, $3) ` +
                  `ON CONFLICT ("guid") DO UPDATE SET "pubDate" = $2, "additionalInfo" = $3`,
			values: [guid, data.pubDate, data.additionalInfo]
		};
		
		let opResult = await client.query(query);
		retVal = (opResult.rowCount > 0);
	} finally {
		await client.end();
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
	
	let client = createReadOnlyClient();
	
	try {
		await client.connect();
		
		const query = {
			text: `SELECT * from "${config.db.DB_TABLE}" ` +
			      `WHERE $1 <= "pubDate" AND "pubDate" < $2 ` +
                  `ORDER BY "pubDate"`,
			values: [minDateMs, maxDateMs]
		};
		
		retVal = await client.query(query);
		retVal = retVal.rows;
	} finally {
		await client.end();
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
