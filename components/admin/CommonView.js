import Head from 'next/head';
import Link from 'next/link';

export default function CommonView({children}) {
	return (
		<div className="mainBody">
			<Head>
				<link rel="icon" type="image/png" sizes="16x16" href="/img/favicon_16.png"/>
				<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon_32.png"/>
			</Head>
			{children}
		</div>
	);
}