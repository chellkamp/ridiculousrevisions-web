import BuzzsproutPlayer from './BuzzsproutPlayer';

import listStyle from '../styles/episodelist.module.css';

const showdown = require('showdown');

export default function EpisodeDetails(props) {
	let item = props.item;
	let dateFormat = new Intl.DateTimeFormat('default', { month: 'short', day: 'numeric', year: 'numeric' });
	
	let audioUrl;
	if (item['enclosure'] && item['enclosure']['$'] && item['enclosure']['$']['url']) {
		audioUrl = item['enclosure']['$']['url'];
	}
	
	let pubDateMs = NaN;
	let pubDate = null;
	if (item['pubDate']) {
		pubDateMs = item['pubDate'];
		if (typeof(pubDateMs) === 'number') {
			pubDate = new Date(pubDateMs);
		}
	}
	
	let additionalInfoHTML = '';
	
	if(item['additionalInfo']) {
		let markdownConverter = new showdown.Converter();
		additionalInfoHTML = markdownConverter.makeHtml(item['additionalInfo']);
	}
	
	return (
		<article className={listStyle.episodeEntry}>
			<header>
				<h2>{item['title']}</h2>
				<time>{pubDate ? dateFormat.format(pubDate) : ""}</time>
			</header>
			<main dangerouslySetInnerHTML={{__html: item['description']}}/>
			<footer>
				{
					additionalInfoHTML ? (
						<>
						<h3>Additional Info</h3>
						<div className={listStyle.episodeAddlInfo} dangerouslySetInnerHTML={{__html:additionalInfoHTML}} />
						</>
					) : ''
				}
			</footer>
			<BuzzsproutPlayer audioUrl={audioUrl}/>
		</article>
	);
}