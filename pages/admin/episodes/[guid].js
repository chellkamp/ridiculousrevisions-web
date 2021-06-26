global.fetch =  require('node-fetch');

import React from 'react';

import CommonView from '../../../components/admin/CommonView';
import EpisodeDetails from '../../../components/EpisodeDetails';
import Error404 from '../../404';

import formStyle from '../../../styles/editform.module.css';

const showdown = require('showdown');
const xml2js = require('xml2js');

/**
 * @typedef {Object} PropsContainer
 * @property {Object} props properties; must be simple JSON-serializable (simple types or JSON objects)
 */

/**
 * Extracts page properties from page request
 * @param {Object} context
 * @returns {PropsContainer}
 */
export async function getServerSideProps(context) {
	const {PrivateConfig} = require('../../../lib/PrivateConfig');
	const AuthUtil = require('../../../lib/AuthUtil');
	
	await AuthUtil.redirectIfSessionInvalid(context.req, context.res, PrivateConfig.get().ADMIN_LOGIN_PAGE);
		
	let guid;
	
	if(context['params']) {
		guid = context['params']['guid'];
	}
	
	let rssResp = await fetch(PrivateConfig.get().PODCAST_RSS_URL);
	let rssStr = await rssResp.text();
	let rssData = await new Promise(
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
	
	let episodeDataRss = null;
	
	if (rssData && rssData.rss && rssData.rss.channel && rssData.rss.channel.item) {
		let rssItems = rssData.rss.channel.item;
		
		let found = false;
		let curItem;
		for(let curIdx = 0; !found && curIdx < rssItems.length; ++curIdx){
			curItem = rssItems[curIdx];
			if (curItem['guid'] && curItem['guid']['_'] == guid) {
				found = true;
				episodeDataRss = curItem;
			}
		}
	} else {
		throw new Error(`Error retrieving RSS feed from address ${PrivateConfig.get().PODCAST_RSS_URL}`);
	}

	return {
		props: {
			guid: guid || null,
			episodeDataRss: episodeDataRss
		}
	};
}

class PreviewPane extends React.Component {	
	constructor(props) {
		super(props);
		this.state = {item: null};
	}
	update(item) {
		this.setState({item: item})
	}
	
	render() {
		return this.state['item'] ? (<EpisodeDetails item={this.state.item}/>) : (<div></div>);
	}
}

class EditForm extends React.Component {
	constructor(props) {
		super(props);
		
		this.onTextChange = this.onTextChange.bind(this);
		this.handleSave = this.handleSave.bind(this);
		
		this.state = { saved: true, additionalInfo: '' };
	}
	
	onTextChange(event) {
		this.setState({saved: false, additionalInfo: event.target.value});
	}
	
	update(additionalInfo) {
		this.setState({saved: true, additionalInfo: additionalInfo || ''});
	}
	
	handleSave() {
		if (this.props.handleSave) {
			if (this.props.handleSave({additionalInfo: this.state.additionalInfo})) {
				this.setState({saved: true, additionalInfo: this.state.additionalInfo});
			}
		}
	}
	
	render() {
		return (
			<div>
				<div className={formStyle.message}>{this.state.saved ? '' : 'There are unsaved changes.'}</div>
				<div className={formStyle.editform}>
					<form>
						<textarea value={this.state.additionalInfo} onChange={this.onTextChange}/>
						<button onClick={(e) => {this.handleSave(); e.preventDefault();}}>Save</button>
					</form>
				</div>
			</div>
		)
	}
}

/**
 * Edit page class.  Duh
 */
export default class EpisodeEditPage extends React.Component {
	constructor(props) {
		super(props);
		
		this.episodeData = props['episodeDataRss'] || null;
		this.previewPaneRef = React.createRef();
		this.editFormRef = React.createRef();
		this.handleSave = this.handleSave.bind(this);
	}
	
	async componentDidMount() {
		
		if (!this.props.episodeDataRss) {
			return;
		}
		
		this.readDbUrl = new URL('/api/admin/getepisodefromdb', window.location.href);
		this.readDbUrl.searchParams.append('guid', this.props.guid);
				
		this.writeDbUrl = new URL('/api/admin/saveepisodetodb', window.location.href);
		
		let dbResp = await fetch(this.readDbUrl);
		let dbRespJson = await dbResp.json();
				
		if (dbRespJson['data']) {
			this.episodeData['additionalInfo'] = dbRespJson.data['additionalInfo'];
		}
		
		
		this.previewPaneRef.current.update(this.episodeData);
		this.editFormRef.current.update(this.episodeData['additionalInfo']);
	}
	
	async handleSave(data = {}) {
		data.pubDate = Date.parse(this.props.episodeDataRss.pubDate); // need to include date for proper indexing
		let obj = {
			guid: this.props.guid,
			data: data
		};
		
		try {
			let resp = await fetch(this.writeDbUrl, {
				method: 'post',
				body: JSON.stringify(obj),
				headers: {'Content-Type': 'application/json'}
			});
			
			if(resp.status == 403) {
				// redirect to login
				window.location.href = '/admin/login';
				return;
			}
			
			let respObj = await resp.json();
			
			if (respObj['error']) {
				throw new Error(respObj.error.message);
			}
			
			if (respObj['data']) {
				this.episodeData['additionalInfo'] = data['additionalInfo'];
				this.previewPaneRef.current.update(this.episodeData);
			}
			
			return respObj['data'];
			
		} catch(e) {
			alert(e.message);
		}
	}
	
	render() {
		if (!this.props.episodeDataRss) {
			return Error404();
		}

		return (
			<CommonView>
				<PreviewPane ref={this.previewPaneRef}/>
				<EditForm ref={this.editFormRef} handleSave={this.handleSave}/>
			</CommonView>
		);
	}
	
}