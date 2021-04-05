import React from 'react';

export async function getServerSideProps(context) {
	const AuthUtil = require('../../lib/AuthUtil');
	const {PrivateConfig} = require('../../lib/PrivateConfig');

	await AuthUtil.redirectIfSessionInvalid(
		context.req,
		context.res,
		PrivateConfig.get().ADMIN_LOGIN_PAGE
	);

	return {
		props: {}
	}

}

export default class AdminHome extends React.Component {
	render() {
		return (
			<div>This is the Admin Home.</div>
		);
	}
}
