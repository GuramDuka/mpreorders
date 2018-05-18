//------------------------------------------------------------------------------
import Profile from '../index';
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

	mount(...args) {
		super.mount(...args);
		this.validateAllFields();
	}

	pushSuccessorHook(result) {
		if (!result.registered && result.exists)
			throw new Error('Пользователь уже зарегистрирован');
		delete result.registered;
	}
}
//------------------------------------------------------------------------------
