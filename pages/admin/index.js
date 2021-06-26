import React from 'react';

import CommonView from '../../components/admin/CommonView';

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
			<CommonView>
				<div>This is the Admin Home.</div>
			</CommonView>
		);
	}
}
