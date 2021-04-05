import React from 'react';

import LoginForm from '../../components/auth/LoginForm';
import ChangePasswordForm from '../../components/auth/ChangePasswordForm';

import {parseRequestBody} from '../../lib/HttpUtil';

export async function getServerSideProps(context) {
	const AWSCognitoIdentityProvider = require('@aws-sdk/client-cognito-identity-provider');
	const AuthUtil = require('../../lib/AuthUtil');

	const {PrivateConfig} = require('../../lib/PrivateConfig');

	let displayType = '';
	let formAction = '';
	let redirUrl = '/admin';
	let username = '';
	let realUsername = '';
	let password = '';
	let newPassword = '';
	let errorMsg = '';
	
	
	// get parameters
	if (context['query'] && context['query']['redirUrl']) {
		redirUrl = context['query']['redirUrl'];
	}
	
	await parseRequestBody(context.req);
	if (context.req['body']) {
		formAction = context.req.body['formAction'] || formAction;
		username = context.req.body['username'] || username;
		password = context.req.body['password'] || password;
		redirUrl = context.req.body['redirUrl'] || redirUrl;
		newPassword = context.req.body['newPassword'] || newPassword;
	}
	
	// extract relevant cookies
	
	let session;
	let refreshToken;

	let extractedCookies = AuthUtil.getCookiesFromMsg(context.req, 'session', 'USER_ID_FOR_SRP');
	if (extractedCookies['session']) {
		session = decodeURIComponent(extractedCookies.session);
	}
	
	if (extractedCookies['USER_ID_FOR_SRP']) {
		realUsername = decodeURIComponent(extractedCookies.USER_ID_FOR_SRP);
	}
	
	let sessionInfo = AuthUtil.readUserSessionCookies(context.req);
	username = username || sessionInfo.username; // give param priority over cookie
	refreshToken = sessionInfo.userSessionRefreshToken;
	
	let cognitoProviderClient = new AWSCognitoIdentityProvider.CognitoIdentityProviderClient(
		{region: PrivateConfig.get().region}
	);

	
	if (username && refreshToken) {
		
				
		try {			
			let refreshReq = new AWSCognitoIdentityProvider.InitiateAuthCommand(
				{
					"AuthFlow": "REFRESH_TOKEN_AUTH",
					"AuthParameters" : { "REFRESH_TOKEN": refreshToken },
					"ClientId": PrivateConfig.get().COGNITO_CLIENT_ID
				}
			);
			
			let refreshResp = await cognitoProviderClient.send(refreshReq);
			
			context.res.writeHead(307, { Location: redirUrl});
			context.res.end();
			return {
				props: {
					username: ''
				}
			}
		} catch(e) {
			// do nothing.  Just continue on with the form process
			console.log(e);
		}
	}
		
	if (formAction == "loginSubmit") {
		if (username && password) {
			// authenticate through Cognito
			// if successful, set session cookie and redirect
			// else mark as with login error (loginError = )
			let loginReq = new AWSCognitoIdentityProvider.InitiateAuthCommand(
				{
					"AuthFlow": "USER_PASSWORD_AUTH",
					"AuthParameters" : { "USERNAME": username, "PASSWORD": password },
					"ClientId": PrivateConfig.get().COGNITO_CLIENT_ID
				}
			);
			
			try {
				let loginResp = await cognitoProviderClient.send(loginReq);
				
				if (loginResp['AuthenticationResult']) {
					// add user session object to cookies
					AuthUtil.writeUserSessionCookies(context.res, username, loginResp.AuthenticationResult.RefreshToken);
					context.res.writeHead(307, { Location: redirUrl});
					context.res.end();
				} else if (loginResp['ChallengeName']) {
					if (loginResp.ChallengeName == 'NEW_PASSWORD_REQUIRED') {
						context.res.setHeader('Set-Cookie',
							[
								`session=${encodeURIComponent(loginResp.Session)}; Path=/; HttpOnly`,
								`USER_ID_FOR_SRP=${encodeURIComponent(loginResp.ChallengeParameters.USER_ID_FOR_SRP)}; Path=/; HttpOnly`
							]
						);
						
						displayType = "changePassword"; //signal to display Change Password display
					} else {
						throw new Error(`Unhandled challenge: ${loginResp.ChallengeName}`);
					}
				} else {
					throw new Error("Unhandled authentication result");
				}
			} catch(e) {
				errorMsg = e.message;
			}
												
		}// end if username && password
	}// end formAction is "loginSubmit"
	else if (formAction == "changePasswordSubmit") {
		try {
			let challengeReq = new AWSCognitoIdentityProvider.RespondToAuthChallengeCommand(
				{
					"ChallengeName": "NEW_PASSWORD_REQUIRED",
					"ClientId": PrivateConfig.get().COGNITO_CLIENT_ID,
					"Session": session,
					"ChallengeResponses" : { "USERNAME": realUsername, "NEW_PASSWORD": newPassword }
				}
			);
			
			let challengeResp = await cognitoProviderClient.send(challengeReq);
			
			AuthUtil.writeUserSessionCookies(
				context.res,
				username,
				challengeResp.AuthenticationResult.RefreshToken
			);								

			context.res.writeHead(307, { Location: redirUrl});
			context.res.end();
		} catch(e) {
			formAction = ''; // take user back to the login screen
			errorMsg = e.message;
		}
	}
	
	// default: login screen
	
	return {
		props: {
			displayType: displayType || '',
			redirUrl: redirUrl || '',
			username: username || '',
			errorMsg: errorMsg || ''
		}
	};
}

export default class LoginPage extends React.Component {
	handleSubmit(e) {
		let valid = true;
		
		if (!valid) {
			e.preventDefault();
		}
	}
	
	render() {
		if (this.props.displayType == "changePassword") {
			return React.createElement(ChangePasswordForm, this.props);
		}
		
		return new React.createElement(LoginForm, this.props);
	}
}
