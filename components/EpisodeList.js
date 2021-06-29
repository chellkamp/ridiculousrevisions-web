"use strict;"

import Link from 'next/link';
import React from 'react';

import BuzzsproutPlayer from './BuzzsproutPlayer';
import RSSKeyUtil from '../lib/RSSKeyUtil';

import listStyle from '../styles/episodelist.module.css'

const fetch = require('node-fetch');
const xml2js = require('xml2js');

const displayCount = 10;

export default class EpisodeList extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			startIndex: 0,
			totalEntries: 0,
			items: new Array()
		};
	}

	/**
	 * Loads the specified section of the episode list
     * into the display
	 * @param {number} startIndexOffset
	 */
	async updateList(startIndexOffset) {
		let rssData = {};
		
		let rssUrl;
		if (this.props && this.props.rssUrl) {
			rssUrl = this.props.rssUrl;
		}
		
		try {
			if (rssUrl) {
				let rssStr = await fetch(rssUrl).then(res => res.text());
				
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
			}
			
			let items = new Array();
			
			if (rssData && rssData.rss && rssData.rss.channel && rssData.rss.channel.item) {
				items = rssData.rss.channel.item;
			} else {
				throw new Error(`Error retrieving RSS feed from address ${rssUrl}`);
			}
			
			let totalEntries = items.length;
			
			let startIndex = this.state.startIndex + startIndexOffset;
			
			if (items.length < 1) {
				startIndex = -1;
			} else if (startIndex < 0) {
				startIndex = 0;
			} else if (startIndex >= items.length) {
				startIndex = items.length - 1;
			}
			
			if (items.length > 0) {
				items = items.slice(startIndex, startIndex + displayCount);
			}
			
			let newState = {
				startIndex: startIndex,
				totalEntries: totalEntries,
				items: items
			};
			
			this.setState(newState);
		} catch (e) {
			alert(e.message);
		}
	}// end updateList()

	async componentDidMount() {
		this.updateList(0);
	}

	render() {
		let leftClassName = listStyle.leftarrow;
		let rightClassName = listStyle.rightarrow;

		let leftArrowClickable = this.state.startIndex > 0;
		let rightArrowClickable = this.state.startIndex + displayCount < this.state.totalEntries;

		leftClassName += ` ${leftArrowClickable ? listStyle.clickablearrow : listStyle.nonclickablearrow}`;
		rightClassName += ` ${rightArrowClickable ? listStyle.clickablearrow : listStyle.nonclickablearrow}`;

		return (
			<div className={listStyle.container}>
				<div className={listStyle.pagination}>
					<div className={leftClassName}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#000000"
							onClick={() => { if (leftArrowClickable) this.updateList(-displayCount) }}>
							<polygon points="0,50 100,0 100,100" />
						</svg>
					</div>
					<div className={rightClassName}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#000000"
							onClick={() => { if (rightArrowClickable) this.updateList(displayCount) }}>
							<polygon points="0,0 100,50 0,100" />
						</svg>
					</div>
				</div>
				{

					this.state.items.map((item, key) => {
						return this.renderRssItem(item, key);
					})
				}
				<div className={listStyle.pagination}>
					<div className={leftClassName}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#000000"
							onClick={() => { if (leftArrowClickable) this.updateList(-displayCount) }}>
							<polygon points="0,50 100,0 100,100" />
						</svg>
					</div>
					<div className={rightClassName}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#000000"
							onClick={() => { if (rightArrowClickable) this.updateList(displayCount) }}>
							<polygon points="0,0 100,50 0,100" />
						</svg>
					</div>
				</div>
			</div>
		);
	}// end render()
	
	/**
	 * Generates a React component for an RSS item
	 * @param {Object} item episode info
	 * @param {number} key key for entry
	 * @returns {React.Component} component code for entry
	 */
	renderRssItem(item, key) {
		let dateFormat = new Intl.DateTimeFormat('default', { month: 'short', day: 'numeric', year: 'numeric' });

		let audioUrl;
		if (item['enclosure'] && item['enclosure']['$'] && item['enclosure']['$']['url']) {
			audioUrl = item['enclosure']['$']['url'];
		}
		
		let pubDateMs = NaN;
		let pubDate = null;
		if (item['pubDate']) {
			pubDateMs = Date.parse(item['pubDate']);
			if (typeof(pubDateMs) === 'number') {
				pubDate = new Date(pubDateMs);
			}
		}
		
		let episodeLink = `/episodes/${RSSKeyUtil.getParamStringFromKeyValue(pubDate)}`;
		
		return (
			<article className={listStyle.episodeEntry} key={key}>
				<header>
					<h2>
						<Link href={episodeLink}><a>{item['title']}</a></Link>
					</h2>
					<time>{pubDate ? dateFormat.format(pubDate) : ""}</time>
				</header>
				<main dangerouslySetInnerHTML={{__html: item['description']}}/>
				<BuzzsproutPlayer audioUrl={audioUrl}/>
				{/*
				<audio controls src={audioUrl}>
					<a target="_blank" href={audioUrl}>Download Episode</a>
				</audio>
				*/}
			</article>
		);
	}
}
