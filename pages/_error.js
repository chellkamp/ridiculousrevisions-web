import CommonView from '../components/CommonView';

function Error({ statusCode }) {
	return (
		<CommonView>
			<h1>Looks like we screwed up!</h1>
			<p>
				{statusCode
				? `An error ${statusCode} occurred on the server.`
				: 'An error occurred in the browser.'}
			</p>
		</CommonView>
	)
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error