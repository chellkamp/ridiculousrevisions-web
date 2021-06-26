import React from 'react';

import CommonView from './CommonView';

import LoginStyle from '../../styles/login.module.css';

/**
 * @class form for initial login
 * Expects the following props:
 * -username: default username value, can be ''
 * -redirUrl: URL to redirect to on successful login
 */
export default class LoginForm extends React.Component {
	
	/**
	 * Handles a form submit
	 * @param {SubmitEvent} event
	 * @returns {void}
	 */
	handleSubmit(e) {
		
	}
	
	render() {
		return (
			<CommonView>
				<div className={`${LoginStyle.submitform} ${LoginStyle.loginformcontainer}`}>
					<form action="" onSubmit={this.handleSubmit} method="post">
						<div className={LoginStyle.inputcontainer}>
							<div className={LoginStyle.error}>{this.props.errorMsg}</div>
							<div className={LoginStyle.fieldline}>
								<label htmlFor="username">Email:</label>
								<input type="text" id="username" name="username" defaultValue={this.props.username}/>
							</div>
							<div className={LoginStyle.fieldline}>
								<label htmlFor="password">Password:</label>
								<input type="password" id="password" name="password" defaultValue=""/>
							</div>
							<div>
								<input type="hidden" id="formAction" name="formAction" value="loginSubmit"/>
								<input type="hidden" id="redirUrl" name="redirUrl" value={this.props.redirUrl}/>
							</div>
						</div>
						<div>
							<input type="submit" value="Sign in"/>
						</div>
					</form>
				</div>
			</CommonView>
		);
	}
}
