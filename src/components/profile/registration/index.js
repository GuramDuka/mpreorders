//------------------------------------------------------------------------------
//import wog from 'window-or-global';
import Profile from '../index';
import { route } from 'preact-router';
import { headerTitleStorePath, headerSearchStorePath } from '../../../const';
import disp from '../../../lib/store';
//------------------------------------------------------------------------------
const registration = 'Регистрация';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Registration extends Profile {
	state = {
		auth2: {},
		isPulled: true,
		notUseLogoutButton: true,
		pushButtonName: registration,
		pushFunction: 'registration',
		pushError: 'Ошибка регистрации',
		authorizedRouteUrl: '/profile',
		header: registration
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

	pushSuccessorHook(result) {
		if (!result.registered && result.exists)
			throw new Error('Пользователь уже зарегистрирован');
		delete result.registered;
	}
}
//------------------------------------------------------------------------------
