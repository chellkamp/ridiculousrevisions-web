"use strict";

import CommonView from '../../components/CommonView';
import EpisodeList from '../../components/EpisodeList';
import TitledPage from '../../components/TitledPage';

export async function getServerSideProps(context) {
	const {PrivateConfig} = require('../../lib/PrivateConfig');
	
	return {
		props: {
			podcastFeedUrl: PrivateConfig.get().PODCAST_RSS_URL
		}
	};	
}

export default function Episodes(props) {
	return (
		<CommonView>
			<TitledPage title="Episodes">
				<EpisodeList rssUrl={props.podcastFeedUrl}/>
			</TitledPage>
		</CommonView>
	);
}
