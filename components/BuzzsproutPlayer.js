const fileNoExtensionRegex = /.+(?=\.mp3)/;

/**
 * player iframe for an episode
 * @param {Object} props
 * @param {string} props.audioUrl
 * 
 */
export default function BuzzsproutPlayer(props) {
	let retVal = (<div>Sorry! Player not available.</div>);
	if (props['audioUrl']) {
		let audioUrl = props.audioUrl;
		let match = audioUrl.match(fileNoExtensionRegex);
		
		if (match) {
			let iframeSrc = `${match[0]}?client_source=small_player&amp;iframe=true&player=small`;
			retVal = (
				<iframe src={iframeSrc} loading="lazy" width="100%" height="200" frameBorder="0" scrolling="no"/>
			);
		}
	}
	return retVal;
}
