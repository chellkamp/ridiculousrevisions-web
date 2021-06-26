export default function TitledPage(props) {
	return (
		<>
			<h1>{props.title}</h1>
			<div className="titledContent">
				{props.children}
			</div>
		</>
	);
}
