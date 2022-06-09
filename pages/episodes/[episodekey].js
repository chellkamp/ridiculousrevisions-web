'use strict;'

import React from 'react';

import CommonView from '../../components/CommonView';
import EpisodeDetails from '../../components/EpisodeDetails';
import Error404 from '../404';
import RSSKeyUtil from '../../lib/RSSKeyUtil';

const fetch = require('node-fetch');
const xml2js = require('xml2js');

export async function getServerSideProps(context) {
	const {PrivateConfig} = require('../../lib/PrivateConfig');
	let episodeKey = null;
	let episodeData = new Array();
	
	if (context['params'] && context['params']['episodekey']) {
		episodeKey = context['params']['episodekey'];
	}
	
	let dateKey = RSSKeyUtil.getKeyValueFromParamString(episodeKey);
	
	if (dateKey) {
		let year = dateKey.getUTCFullYear();
		let month = dateKey.getUTCMonth();
		let day = dateKey.getUTCDate();
		
		// get the RSS feed
		let rssData = {};
		let rssItems = new Array();
		let rssStr = await fetch(PrivateConfig.get().PODCAST_RSS_URL).then(res => res.text());
		
		rssData = await new Promise(
			(resolve, reject) => {
				xml2js.parseString(
					rssStr,
					{ explicitArray: false },
					(err, result) => {
						if (err) {
							reject(err);
						} else {
							resolve(result);
						}
					}
				);
			}
		);
		
		if (rssData && rssData.rss && rssData.rss.channel && rssData.rss.channel.item) {
			rssItems = rssData.rss.channel.item;
			let range = RSSKeyUtil.getIndexesForUTCDate(year, month, day, rssItems);
			
			rssItems = rssItems.slice(range.start, range.end);
		} else {
			throw new Error(`Error retrieving RSS feed from address ${SiteConfig.RSS_URL}`);
		}
		
		const DBUtil = require('../../lib/pgDBUtil'); // This has to be a server-side use only, which is why it's here
		
		let rawDocs = await DBUtil.getEpisodeDocsForUTCDate(year, month, day);
			
		// Zip DB data into RSS items
		rssItems.forEach(
			rssItem => {
				let additionalInfo = null;
		
				if (rawDocs) {
					let done = false;
					let num = rawDocs.length;
					for(let i = 0; !done && i < num; ++i) {
						if (rawDocs[i]['guid'] && rawDocs[i]['guid'] === rssItem['guid']['_']) {
							additionalInfo = rawDocs[i].additionalInfo;
							done = true;
						}
					}
				}
			
				rssItem.additionalInfo = additionalInfo;
				episodeData.push(rssItem);
			}
		);
		
	}
	
	if (episodeData.length < 1) {
		context.res.statusCode = 404;
	}
	
	return {
		props: { episodeKey: episodeKey, episodeData: episodeData }
	};
}// end getServerSideProps()

export default class EpisodeDetailCollection extends React.Component {

	render() {
		if (this.props.episodeData.length < 1) {
			return Error404();
		}
		
		return (
			<CommonView>
				{
					this.props.episodeData.map(
						(item, key) => {
							return (<EpisodeDetails item={item} key={key}/>);
						}
					)
				}
			</CommonView>
		);
	}
}