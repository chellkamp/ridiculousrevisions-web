import CommonView from '../components/CommonView'

import homeStyle from '../styles/home.module.css'

export default function Home() {
	return (
		<CommonView>
			<div className={homeStyle.imgdiv}>
				<img className={homeStyle.mainimg} src="/img/titlepage.png"/>
			</div>
			<div className={`${homeStyle.slogan} usetitlefont`}>
				Bedtime stories for the disturbed.
			</div>
		</CommonView>
	);
}