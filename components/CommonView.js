import Head from 'next/head';
import Link from 'next/link';

import CommonCollection from '../lib/CommonCollection';

const navbarItems = [
	["Episodes", "/episodes"],
	["About", "/about"]
]

export default function CommonView({children}) {
	return (
		<div className="mainBody">
			<Head>
				<link rel="icon" type="image/png" sizes="16x16" href="/img/favicon_16.png"/>
				<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon_32.png"/>
			</Head>
			<header className="pageHeader">
				<div className="logo">
					<Link href="/">
						<a><img src="/img/title.png" alt="HOME"/></a>
					</Link>
				</div>
				<div className="navlist usetitlefont">
					<ul>
						{
							navbarItems.map(
								(item) => {
									return (<li key={item[0]}><Link href={item[1]}><a>{item[0]}</a></Link></li>)
								}
							)
						}
					</ul>
				</div>
			</header>
			<main>
				<div className="backsplash">
					<div className="overbacksplash">
					<div className="contentcontainer">
						<div>
							{children}
						</div>
					</div>
					</div>
				</div>
			</main>
			<footer className="pageFooter">
				<div>
					{
						CommonCollection.getSocialLinks().map(
							(item) => {
								return (
									<div key={item.title} className="socialIcon">
										<a href={item.href} target="_blank">
											{item.icon}
										</a>
									</div>
								);
							}
						)
					}
				</div>
			</footer>
		</div>
	)
}