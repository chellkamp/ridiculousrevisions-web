const http = require('http');
import {secureApiMethod} from '../../../lib/AuthUtil';
import {saveEpisodeDoc} from '../../../lib/pgDBUtil';

/**
 * @typedef {Object} SaveEpisodeArgs
 * @property {Object} body body
 * @property {string} body.guid guid
 * @property {Object} body.data update data
 * @property {string} body.data.additionalInfo additional info field
 */

/**
 * @param {SaveEpisodeArgs} req
 * @param {http.ServerResponse} res
 * @return {void}
 */
export default async function(req, res) {
	await secureApiMethod(req, res,
		async (req, res) => {
			let params = req.body;
			let guid = params.guid;
						
			let data = params.data;
			let result = await saveEpisodeDoc(guid, data);
			let respObj = {
				result: result
			};
			return respObj;
		}
	);
}