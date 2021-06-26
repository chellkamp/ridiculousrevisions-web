import React from 'react';

import CommonView from './CommonView';

import LoginStyle from '../../styles/login.module.css';

/**
 * @class Form for changing password
 * Expects following props:
 * -redirUrl: url to redirect to on success
 * -username: username of person logging in
 */
export default class ChangePasswordForm extends React.Component {
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
							<div>
								{this.props.username}
							</div>
							<div className={LoginStyle.fieldline}>
								<label htmlFor="newPassword">New Password:</label>
								<input type="password" id="newPassword" name="newPassword"/>
							</div>
							<div>
								<input type="hidden" id="formAction" name="formAction" value="changePasswordSubmit"/>
								<input type="hidden" id="redirUrl" name="redirUrl" value={this.props.redirUrl}/>
							</div>
						</div>
						<div>
							<input type="submit" value="Change password"/>
						</div>
					</form>
				</div>
			</CommonView>
		);
	}
}