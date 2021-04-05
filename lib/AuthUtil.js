const http = require('http');

const AWSCognitoIdentityProvider = require('@aws-sdk/client-cognito-identity-provider');

/**
 * @param {http.IncomingMessage} req client request
 * @param {http.ServerResponse} res server response
 * @param {apiMethod} handler API method to call if authorized
 */
export async function secureApiMethod(req, res, handler) {
	const {PrivateConfig} = require('./PrivateConfig');

	let cognitoProviderClient = new AWSCognitoIdentityProvider.CognitoIdentityProviderClient(
		{region: PrivateConfig.get().region}
	);

	let sessionInfo = readUserSessionCookies(req);
	
	let refreshResp;
		
	try {
		let refreshReq = new AWSCognitoIdentityProvider.InitiateAuthCommand(
				{
					"AuthFlow": "REFRESH_TOKEN_AUTH",
					"AuthParameters" : { "REFRESH_TOKEN": sessionInfo.userSessionRefreshToken },
					"ClientId": PrivateConfig.get().COGNITO_CLIENT_ID
				}
		);
		
		refreshResp = await cognitoProviderClient.send(refreshReq);
		
	} catch(e) {
		// set error info in the response object and return from this function
		if (e['code'] && e.code == 'NotAuthorizedException') {
			res.statusCode = 403;
		}
		let retVal = {error: e};
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(retVal));
		return;
	}
	
	try {
		if (refreshResp['AuthenticationResult']) {
			// Update cookies.  Call method.
			let data = await Promise.resolve(handler(req, res)); // lets us handle synchronous and asynchronous functions
			let respObj = {data: data || null};
			let respStr = JSON.stringify(respObj);
			res.setHeader('Content-Type', 'application/json');
			res.end(respStr);
		} else if (refreshResp['ChallengeName']) {
			throw new Error(refreshResp.ChallengeName);
		} else {
			throw new Error("Unhandled authentication response.");
		}
		
	} catch(innerErr) {
		let errObj = {
			name: innerErr['name'] || '',
			message: innerErr['message'] || ''
		};
		let respObj = {error: errObj};
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(respObj));
	}
}

/**
 * Meant to be called from within getServerSideProps().
 * Checks the cookies against Cognito service to see if session is still valid.
 * If session is not valid, redirect to specified address
 * @param {http.IncomingMessage} req HTTP request from client
 * @param {http.ServerResponse} res HTTP response object that server will send to client
 * @param {string} redirectUrl address to redirect to if session is not valid
 */
export async function redirectIfSessionInvalid(req, res, redirectUrl) {
	const {PrivateConfig} = require('./PrivateConfig');
		
	let cognitoProviderClient = new AWSCognitoIdentityProvider.CognitoIdentityProviderClient(
		{region: PrivateConfig.get().region}
	);
	
	try {
		let sessionInfo = readUserSessionCookies(req);
		
		let refreshReq = new AWSCognitoIdentityProvider.InitiateAuthCommand(
				{
					"AuthFlow": "REFRESH_TOKEN_AUTH",
					"AuthParameters" : { "REFRESH_TOKEN": sessionInfo.userSessionRefreshToken },
					"ClientId": PrivateConfig.get().COGNITO_CLIENT_ID
				}
		);
		
		let refreshResp = await cognitoProviderClient.send(refreshReq);
		
		if (refreshResp['AuthenticationResult']) {
			// do nothing.  We're good.'
		} else if (refreshResp['ChallengeName']){
			throw new Error(refreshResp['ChallengeName']);
		} else {
			throw new Error("Unhandled authentication response.");
		}
				
	} catch(e) {
		let addressAndArgs = `${redirectUrl}?redirUrl=${encodeURIComponent(req.url)}`;
		res.writeHead(307, { Location: addressAndArgs});
		res.end();
	}
}


/**
 * Gets the values for the specified cookies from an IncomingMessage object.
 * @param {http.IncomingMessage} message to extract from
 * @param {string} name of cookie value to retrieve
 * @return {Object}
 */
export function getCookiesFromMsg(msg, ...cookieNames) {
	let retVal = {};
	
	if (msg && msg['headers'] && msg['headers']['cookie']) {
		let entry = msg.headers.cookie;
		let pairs = entry.split('; ');
		let numFound = 0;
		
		for (let idx = 0; numFound < cookieNames.length && idx < pairs.length; ++idx) {
			let pairVal = pairs[idx].split('=');
			
			let foundName = false;
			for (let nameIdx = 0; !foundName && nameIdx < cookieNames.length; ++nameIdx) {
				if (pairVal[0] == cookieNames[nameIdx]) {
					foundName = true;
					++numFound;
					if (pairVal.length > 1) {
						retVal[cookieNames[nameIdx]] = pairVal[1];
					}
				}
			}
		}
	}
	return retVal;
}

/**
 * Read the cookies that store the authenticated user session info
 * @param {http.IncomingMessage} req http request from client
 * @return {Object} cookies JSON object
 * @return {string} cookies.username username
 * @return {string} cookies.userSessionRefreshToken refresh token
 * @return {string} cookies.USERNAMEUSER_ID_FOR_SRP real username for Cognito calls
 */
export function readUserSessionCookies(req) {
	let retVal = {
		username: null,
		userSessionRefreshToken: null,
		USERNAMEUSER_ID_FOR_SRP: null
	};
	
	let extractedCookies = getCookiesFromMsg(req, 'username', 'userSessionRefreshToken', 'USERNAMEUSER_ID_FOR_SRP');
	if (extractedCookies['username']) {
		retVal.username = decodeURIComponent(extractedCookies.username);
	}
	
	if (extractedCookies['userSessionRefreshToken']) {
		retVal.userSessionRefreshToken = decodeURIComponent(extractedCookies.userSessionRefreshToken); 
	}
		
	return retVal;
}

/**
 * Write the information necessary to track an authenticated user session.
 * @param {http.ServerResponse} res server response object
 * @param {string} username
 * @param {string} refreshToken
 * @returns {void}
 */
export function writeUserSessionCookies(res, username, refreshToken) {
	res.setHeader('Set-Cookie',
		[
			`username=${encodeURIComponent(username)}; Path=/`,
			`userSessionRefreshToken=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly`
		]
	);
}
