"use strict";

import Link from 'next/link';

import EpisodeList from './EpisodeList';

import listStyle from '../styles/episodelist.module.css'

export default class TitleOnlyList extends EpisodeList {	
	/**
	 * Generates a React component for an RSS item
	 * @param {Object} item episode info
	 * @param {number} key key for entry
	 * @returns {React.Component} component code for entry
	 */
	renderRssItem(item, key) {
		let dateFormat = new Intl.DateTimeFormat('default', { month: 'short', day: 'numeric', year: 'numeric' });

		let pubDateMs = NaN;
		let pubDate = null;
		if (item['pubDate']) {
			pubDateMs = Date.parse(item['pubDate']);
			if (typeof(pubDateMs) === 'number') {
				pubDate = new Date(pubDateMs);
			}
		}
		
		let guid = null;
		if (item['guid']) {
			guid = item['guid']['_'];
		}
		
		let encodedGuid;
		if (guid) {
			encodedGuid = encodeURIComponent(guid);
		}
		
		let episodeLink = `/admin/episodes/${encodedGuid}`;
		return (
			<article className={listStyle.episodeEntry} key={key}>
				<header>
					<h2>
						<Link href={episodeLink}><a>{item['title']}</a></Link>
					</h2>
					<time>{pubDate ? dateFormat.format(pubDate) : ""}</time>
				</header>
			</article>
		);
	}
}