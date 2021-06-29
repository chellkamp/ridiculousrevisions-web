import Head from 'next/head';
import Link from 'next/link';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

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
			
			<Navbar bg="white" fixed="top" expand="lg">
				<Navbar.Brand href="/">
					<div className="logo">
						<img src="/img/title.png" alt="HOME"/>
					</div>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav"/>
				<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="mr-auto">
					{
						navbarItems.map(
							(item) => {
								return <Nav.Link key={item[0]} href={item[1]}>{item[0]}</Nav.Link>;
							}
						)
					}
				</Nav>
				</Navbar.Collapse>
			</Navbar>
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