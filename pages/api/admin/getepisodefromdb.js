const http = require('http');
import {secureApiMethod} from '../../../lib/AuthUtil';
import {getEpisodeDocForGuid} from '../../../lib/DBUtil';

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @return {void}
 */
export default async function(req, res) {
	
	await secureApiMethod(req, res,
		async (req, res) => {
			let guid;
			
			
			if (req['query']) {
				guid = req.query['guid'];
			}
			
			let doc = await getEpisodeDocForGuid(guid);
			return doc;
		}
	);
}