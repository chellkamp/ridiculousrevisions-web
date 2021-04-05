const http = require('http');
const querystring = require('querystring');

/**
 * read a request's body into a buffer and return the string once done
 * @param {http.IncomingMessage} msg incoming stream to read
 * @return {Promise<string>}
 */
export async function readIncomingBody(msg) {
	let chunks = new Array();
	
	const promise = new Promise(
		(resolve, reject) => {
				msg.on('end',
					()=>{
						let data = Buffer.concat(chunks).toString('utf8');
						resolve(data);
					}
				);
				msg.on('error', (e)=>{reject(e);});
				msg.on('aborted', ()=>{reject(new Error("Aborted"));});
				msg.on('data', (chunk)=>{chunks.push(chunk);});
		}
	);
	
	return promise;
}


/**
 * parse IncomingMessage body and, if successful add a body member onto the request
 * @param {http.IncomingMessage} msg message stream to parse body data from
 */
export async function parseRequestBody(msg /*IncomingMessage*/) {
	if (msg && msg['headers'] && msg['headers']['content-type'] === 'application/x-www-form-urlencoded') {
		let bodyStr = await readIncomingBody(msg);
		let body = querystring.decode(bodyStr) || {};
		msg['body'] = body;
	}
}
