//------------------------------------------------------------------------------
//import wog from 'window-or-global';
import Profile from '../index';
import { route } from 'preact-router';
import Component from '../../component';
import { bfetch } from '../../../backend';
import { SHA256 } from 'jshashes';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import TextField from 'preact-material-components/TextField';
import 'preact-material-components/TextField/style.css';
import Snackbar from 'preact-material-components/Snackbar';
import 'preact-material-components/Snackbar/style.css';
import style from './style';
import { headerTitleStorePath } from '../../../const';
import { successor, failer, starter } from '../../load';
import disp from '../../../lib/store';
//------------------------------------------------------------------------------
const registration = 'Регистрация';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Registration extends Profile {
	state = {
		auth: {},
		isPulled: true,
		notUseLogoutButton: true,
		pushButtonName: registration
	}

	requiredFields = [
		'user',
		'email',
		'pass',
		'pass2',
		'phone',
		'family',
		'fname'
	]
	
	didSetState({ auth }) {
		if (auth && auth.authorized)
			route('/profile', true);
		else
			disp(store => store.cmpSetIn(headerTitleStorePath, registration));
	}
}
//------------------------------------------------------------------------------
