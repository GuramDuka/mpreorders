//------------------------------------------------------------------------------
//import wog from 'window-or-global';
import Profile from '../index';
import { route } from 'preact-router';
import { headerTitleStorePath } from '../../../const';
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
		pushButtonName: registration,
		pushFunction: 'registration',
		pushError: 'Ошибка регистрации'
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

	willMount() {
		this.validateAllFields();
	}

	didSetState({ auth }) {
		if (auth && auth.authorized)
			route('/profile', true);
		else
			disp(store => store.cmpSetIn(headerTitleStorePath, registration));
	}

	pushSuccessorHook(result) {
		if (!result.registered && result.exists)
			throw new Error('Пользователь уже зарегистрирован');
		delete result.registered;
	}
}
//------------------------------------------------------------------------------
