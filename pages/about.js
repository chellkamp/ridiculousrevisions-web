import CommonView from '../components/CommonView';
import TitledPage from '../components/TitledPage';

import CommonCollection from '../lib/CommonCollection';
import aboutStyle from '../styles/about.module.css';

export default function About() {
	let emailAddress = "chris@ridiculousrevisions.com";
	return (
		<CommonView>
			<TitledPage title="About">
				<div className={aboutStyle.wrapper}>
					<div className={aboutStyle.profileContainer}>
						<img src="/img/profile_chris.jpg"/>
						<h3>Chris Hellkamp</h3>
						<h4>Architect of this Disaster</h4>
						<p>
							This Jim Henson muppet made flesh is Chris.  He is the author, host, music composer, and producer of this podcast.
							Chris is a software engineer by trade.  He started this podcast from his love of stories and his love
							of learning new things.
						</p>
					</div>
					<div>
						What happened after Goldilocks ran out of the three bears' house?  How did Cinderella's marriage hold up?
						Why did those elves help out that shoemaker in the first place?  This podcast shoves classic children's stories
						through the meat grinder to give you original short stories that you probably won't want to tell to your kids.
						Welcome to <span className="titleText">Ridiculous Revisions</span>, bedtime stories for the disturbed!
					</div>
					<div className={aboutStyle.contactContainer}>
						<h2>Contact</h2>
						<div>
							{
								CommonCollection.getSocialLinks().map(
									(item) => {
										return (
											<div key={item.title}>
												<a href={item.href}>{item.icon}</a> {item.title}: <a href={item.href}>{item.text}</a>
											</div>
										);
									}
								)
							}
						</div>
					</div>
				</div>				
			</TitledPage>
		</CommonView>
	);
}