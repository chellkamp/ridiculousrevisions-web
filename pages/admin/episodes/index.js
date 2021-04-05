import React from 'react';

import TitleOnlyList from '../../../components/TitleOnlyList';

export async function getServerSideProps(context) {
	const AuthUtil = require('../../../lib/AuthUtil');
	const {PrivateConfig} = require('../../../lib/PrivateConfig');
	
	await AuthUtil.redirectIfSessionInvalid(context.req, context.res, PrivateConfig.get().ADMIN_LOGIN_PAGE);

	return {
		props: {
			podcastFeedUrl: PrivateConfig.get().PODCAST_RSS_URL
		}
	};	
}

export default class EpisodeEditMainPage extends React.Component {
	render() {
		return (
			<TitleOnlyList rssUrl={this.props.podcastFeedUrl}/>
		);
	}
}
