//------------------------------------------------------------------------------
//import wog from 'window-or-global';
import { route } from 'preact-router';
import Component from '../../components/component';
import { bfetch } from '../../backend';
import { SHA256 } from 'jshashes';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import TextField from 'preact-material-components/TextField';
import 'preact-material-components/TextField/style.css';
import Radio from 'preact-material-components/Radio';
import 'preact-material-components/Radio/style.css';
import Snackbar from 'preact-material-components/Snackbar';
import 'preact-material-components/Snackbar/style.css';
import style from './style';
import { headerTitleStorePath } from '../../const';
import { successor, failer, starter } from '../load';
import disp from '../../lib/store';
import { strftime } from '../../lib/strftime';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Profile extends Component {
	state = {
		pushButtonName: 'Сохранить',
		pushFunction: 'profile_push',
		pushError: 'Ошибка записи'
	}

	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'auth', alias: 'auth' }
		]
	])

	allFields = {}
	requiredFields = []
	profileFields = ['birthday', 'gender', 'family', 'fname', 'sname', 'phone']

	clearTypedFields = () => {
		for (const field of Object.keys(this.allFields))
			delete this[field];
	}

	isLoading = (state, callback) => this.setState({ isLoading: state, isPulled: true }, callback)

	didSetState({ auth, isPulled }) {
		if (!auth || !auth.authorized)
			route('/login', true);
		else {
			disp(store => store.cmpSetIn(headerTitleStorePath, 'Профиль'));

			if (!isPulled)
				this.pull();
		}
	}

	fieldInputValidator = (field, display) => {
		this.allFields[field] = display;

		return e => {
			this.field = field;
			this[field] = e.target.value;
			this['validate' + field.substr(0, 1).toUpperCase() + field.substr(1) + 'Field']();
		};
	}

	// change event occurs when the value of an element has been changed
	//userFieldChange = e => this.user = e.target.value;
	// input event occurs immediately after the value of an element has changed
	userFieldInput = this.fieldInputValidator('user', 'Имя пользователя')
	emailFieldInput = this.fieldInputValidator('email', 'Электронная почта')
	passFieldInput = this.fieldInputValidator('pass', 'Пароль')
	pass2FieldInput = this.fieldInputValidator('pass2', 'Подтверждение пароля')
	birthdayFieldInput = this.fieldInputValidator('birthday', 'День рождения')
	genderFieldInput = this.fieldInputValidator('gender', 'Пол')
	phoneFieldInput = this.fieldInputValidator('phone', 'Контактный телефон')
	familyFieldInput = this.fieldInputValidator('family', 'Фамилия')
	fnameFieldInput = this.fieldInputValidator('fname', 'Имя')
	snameFieldInput = this.fieldInputValidator('sname', 'Отчество')

	validateAllFields(state, callback) {
		const combo = { ...this.state, ...state };
		const notFilled = {};
		let v = true;

		for (const field of Object.keys(this.allFields)) {
			const fe = field + 'Error';
			const fieldError = combo[fe];

			if (fieldError)
				v = false;
			else if (this.requiredFields.includes(field)) {
				if (this[field] === undefined || this[field].trim().length === 0) {
					notFilled[fe] = this.allFields[field] + ' - необходимо заполнить';
					v = false;
				}
			}
		}

		this.setState({ valid: v, ...state, ...notFilled }, callback);
	}

	// check non printable symbols, allow only Basic Latin and Cyrillic, exclude space
	// http://kourge.net/projects/regexp-unicode-block
	userPattern = /[\u0021-\u007e,\u00a0-\u00ff,\u0400-\u04FF,\u0500-\u052F]/g

	validateUserField(ret) {
		//const { state } = this;
		const r = { userError: undefined };

		if (!this.user)
			r.userError = 'Не заполнено имя пользователя';
		else if (!this.userPattern.test(this.user))
			r.userError = 'Недопустимые символы в имени пользователя';

		if (ret)
			return r;

		// (state.isReg || (state.auth && state.auth.authorized)) && bfetch(
		// 	{ noauth: true, r: { m: 'auth', f: 'check', r: { user: this.user } } },
		// 	result => {
		// 		const userUC = this.user.toUpperCase();
		// 		const rserUC = result.user.toUpperCase();

		// 		if (userUC === rserUC && result.exists)
		// 			this.validateAllFields({
		// 				userError: 'Пользователь с таким именем уже существует'
		// 			});
		// 	}
		// );

		this.validateAllFields(r);
	}

	reValidEmail = new RegExp((() => {
		const sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
		const sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
		const sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
		const sQuotedPair = '\\x5c[\\x00-\\x7f]';
		const sDomainLiteral = `\\x5b(${sDtext}|${sQuotedPair})*\\x5d`;
		const sQuotedString = `\\x22(${sQtext}|${sQuotedPair})*\\x22`;
		const sDomainRef = sAtom;
		const sSubDomain = `(${sDomainRef}|${sDomainLiteral})`;
		const sWord = `(${sAtom}|${sQuotedString})`;
		const sDomain = `${sSubDomain}(\\x2e${sSubDomain})*`;
		const sLocalPart = `${sWord}(\\x2e${sWord})*`;
		const sAddrSpec = `${sLocalPart}\\x40${sDomain}`; // complete RFC822 email address spec
		const sValidEmail = `^${sAddrSpec}$`; // as whole string
		return sValidEmail;
	})())

	validateEmail(email) {
		return email && email.length <= 127 && this.reValidEmail.test(email);
	}

	validateEmailField(ret) {
		const r = {
			emailError: this.validateEmail(this.email) ? undefined : 'Не заполнен E-mail'
		};

		if (ret)
			return r;

		this.validateAllFields(r);
	}

	//strongPassPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})/g
	//strongPassPattern = /^(?=.*\d)(?=.*[!@#$%^&*()-_+=.,:;?|~\\/`\'\"\[\]{}])(?=.*[a-z])(?=.*[A-Z]).{8,}/g
	//mediumPassPattern = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/g

	validatePassField(ret) {
		const { pass } = this;
		const r = { passError: undefined };
		//const valid = this.strongPassPattern.test(pass);

		if (pass.length < 8)
			r.passError = 'Пароль должен содержать минимум 8 символов';//'Your password must be at least 8 characters';
		else if (pass.search(/[a-z]/g) < 0)
			r.passError = 'Пароль должен содержать минимум одну строчную [a-z] букву';//'Your password must contain at least one lower case letter';
		else if (pass.search(/[A-Z]/g) < 0)
			r.passError = 'Пароль должен содержать минимум одну заглавную [A-Z] букву';//'Your password must contain at least one upper case letter';
		else if (pass.search(/[0-9]/g) < 0)
			r.passError = 'Пароль должен содержать минимум одну цифру [0-9]';//'Your password must contain at least one digit';
		// eslint-disable-next-line
		else if (pass.search(/[!@#$%^&*()-_+=.,:;?|~\\/`\'"\[\]{}]/g) < 0)
			r.passError = 'Пароль должен содержать минимум один специальный символ';//'Your password must contain at least one special symbol';

		if (ret)
			return r;

		this.validateAllFields({ ...r, ...this.validatePass2Field(true) });
	}

	validatePass2Field(ret) {
		const { pass, pass2 } = this;
		const valid = pass === pass2;
		const r = { pass2Error: valid ? undefined : 'Пароли не совпадают' };

		if (ret)
			return r;

		this.validateAllFields(r);
	}

	validateBirthdayField(ret) {
		const { birthday } = this;
		// http://html5pattern.com/Dates
		//const pattern = /(0[1-9]|1[0-9]|2[0-9]|3[01]).(0[1-9]|1[012]).[0-9]{4}/g;
		let valid = false;

		if (birthday && birthday.constructor === String || birthday instanceof String) {
			//const p = birthday.split('.');
			//parsed = Date.parse(p[2] + '-' + p[1] + '-' + p[0]);
			const parsed = Date.parse(birthday);
			valid = !Number.isNaN(parsed);
		}

		const r = {
			birthdayError: valid ? undefined : 'Неверный формат дня рождения'
		};

		if (ret)
			return r;

		this.validateAllFields(r);
	}

	validateGenderField(ret) {
		const r = {
			genderError: undefined
		};

		if (ret)
			return r;

		this.validateAllFields(r);
	}

	validateFamilyField(ret) {
		const r = {
			familyError: undefined
		};

		if (ret)
			return r;

		this.validateAllFields(r);
	}

	validateFnameField(ret) {
		const r = {
			fnameError: undefined
		};

		if (ret)
			return r;

		this.validateAllFields(r);
	}

	validateSnameField(ret) {
		const r = {
			snameError: undefined
		};

		if (ret)
			return r;

		this.validateAllFields(r);
	}

	//phonePattern = /(\+?\d[- .()]*){7,13}/g
	phonePattern = /^((8|\+7)[- ]?)?(\(?\d{3}\)?[- ]?)?[\d\- ]{7,10}$/
	phoneMask = '+d (ddd) dd-dd-ddd'

	maskPhoneField = e => {
		// const value = e.target.value;

		// if (e.keyCode === 8) {
		// 	// ignore backspace
		// }
		// else if (/^\d{4}$/.test(value)) {
		// 	e.target.value = value + '-';
		// }
		// else if (/^\d{4}-\d{2}$/.test(value)) {
		// 	e.target.value = value + '-';
		// }
	}

	validatePhoneField(ret) {
		const { phone } = this;
		const valid = this.phonePattern.test(phone);
		const r = {
			phoneError: valid ? undefined : 'Неверный телефонный номер'
		};

		if (ret)
			return {};

		this.validateAllFields(r);
	}

	push = e => {
		const { state, pushSuccessorHook } = this;
		const { auth, pushFunction, pushError } = state;
		const user = this.user === undefined ? auth.user : this.user;
		const email = this.email === undefined ? auth.email : this.email;
		const pass = this.pass === undefined ? auth.pass : this.pass;
		const r = {
			// eslint-disable-next-line
			user: user,
			hash: (new SHA256()).hex(pass).toUpperCase()
		};

		if (email)
			r.email = email;

		const profile = {};

		for (const n of this.profileFields)
			if (this[n] !== undefined) {
				profile[n] = this[n];
				r.profile = profile;
			}

		if (profile.birthday) {
			const parsed = Date.parse(profile.birthday);

			if (Number.isNaN(parsed))
				delete profile.birthday;
			else
				profile.birthday = new Date(parsed);
		}

		bfetch(
			{
				method: 'PUT',
				r: {
					m: 'auth',
					f: pushFunction,
					// eslint-disable-next-line
					r: r
				}
			},
			successor(result => {
				delete result.nostore;

				if (result.profile && result.profile.birthday)
					result.profile.birthday = new Date(result.profile.birthday);

				pushSuccessorHook && pushSuccessorHook(result);
				this.clearTypedFields();
				// eslint-disable-next-line
				disp(store => store.mergeIn('auth', { ...r, ...result, pass: pass }));
				this.setState({ isLoading: false, valid: false });
			}),
			failer(error => this.isLoading(false, e => this.showError(error.message + '\r\n' + pushError))),
			starter(opts => this.isLoading(true))
		);
	}

	pull = e => {
		const { state } = this;
		const { auth } = state;
		const user = this.user === undefined ? auth.user : this.user;
		const pass = this.pass === undefined ? auth.pass : this.pass;
		const r = {
			// eslint-disable-next-line
			user: user,
			hash: (new SHA256()).hex(pass).toUpperCase()
		};

		bfetch(
			{
				method: 'PUT',
				// eslint-disable-next-line
				r: { m: 'auth', f: 'profile_pull', r: r }
			},
			successor(result => this.isLoading(false, () => {
				if (result.authorized) {
					delete result.nostore;

					if (result.profile && result.profile.birthday)
						result.profile.birthday = new Date(result.profile.birthday);

					// eslint-disable-next-line
					disp(store => store.mergeIn('auth', { ...result, user: user, pass: pass }));
				}
				else
					this.showError('Ошибка чтения');
			})),
			failer(
				error => this.isLoading(
					false,
					e => this.showError('Ошибка чтения')
				)
			),
			starter(opts => this.isLoading(true))
		);
	}

	logout = e => bfetch(
		{
			method: 'PUT',
			//noauth: true,
			r: { m: 'auth', f: 'logout', r: {} }
		},
		successor(result => {
			this.clearTypedFields();
			disp(store => store.deleteIn('auth.authorized', 2));
			this.isLoading(false);
		}),
		failer(error => this.isLoading(
			false,
			e => this.showError('Ошибка при отмене авторизации')
		)),
		starter(opts => this.isLoading(true))
	)

	style = [style.profile, 'mdc-toolbar-fixed-adjust'].join(' ');

	snackbarRef = e => this.snackbar = e;

	showError(e) {
		e && this.snackbar.MDComponent.show({ message: e });
	}

	linkTo = path => e => {
		e.stopPropagation();
		e.preventDefault();
		route(path);
	}

	render(props, state) {
		const { auth } = state;

		if (auth === undefined)
			return undefined;

		const profile = auth.profile ? auth.profile : {};
		const user = this.user !== undefined ? this.user : auth.user;
		const pass = this.pass !== undefined ? this.pass : auth.pass;
		const email = this.email !== undefined ? this.email : auth.email;
		const birthday = this.birthday !== undefined ? this.birthday : profile.birthday !== undefined ? strftime('%Y-%m-%d', profile.birthday) : undefined;
		const gender = this.gender !== undefined ? this.gender : profile.gender;
		const family = this.family !== undefined ? this.family : profile.family;
		const fname = this.fname !== undefined ? this.fname : profile.fname;
		const sname = this.sname !== undefined ? this.sname : profile.sname;
		const phone = this.phone !== undefined ? this.phone : profile.phone;

		const {
			isPulled,
			valid,
			userError,
			emailError,
			passError,
			pass2Error,
			birthdayError,
			genderError,
			familyError, fnameError, snameError,
			phoneError
		} = state;

		const isLoading = state.isLoading || !isPulled;

		const userField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={userError ? userError : this.allFields.user + ' или E-mail, например: VikDik или vik.dik@gmail.com'}
				fullwidth disabled={isLoading} invalid={!!userError}
				required={this.requiredFields.includes('user')}
				placeHolder={this.allFields.user + ' или E-mail'}
				trailingIcon="perm_identity"
				type="text"
				value={user}
				onInput={this.userFieldInput}
			/>);

		const emailField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={emailError ? emailError : this.allFields.email + ' (E-mail), например: vik.dik@gmail.com'}
				fullwidth disabled={isLoading} invalid={!!emailError}
				required={this.requiredFields.includes('email')}
				placeHolder={this.allFields.email + ' (E-mail)'}
				type="email"
				value={email}
				trailingIcon="email"
				onInput={this.emailFieldInput}
			/>);

		const passField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={passError ? passError : this.allFields.pass + ', например: Uc_gliec6'}
				fullwidth disabled={isLoading} invalid={!!passError}
				required={this.requiredFields.includes('pass')}
				placeHolder={this.allFields.pass} minlength={8}
				trailingIcon="security"
				type="password"
				value={pass}
				onInput={this.passFieldInput}
			/>);

		const pass2Field = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={pass2Error ? pass2Error : this.allFields.pass2}
				fullwidth disabled={isLoading} invalid={!!pass2Error}
				required={this.requiredFields.includes('pass2')}
				placeHolder="" minlength={8}
				trailingIcon="security"
				type="password"
				onInput={this.pass2FieldInput}
			/>);

		const birthdayField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={birthdayError ? birthdayError : this.allFields.birthday + ', например: 20.08.2000'}
				fullwidth disabled={isLoading} invalid={!!birthdayError}
				required={this.requiredFields.includes('birthday')}
				placeHolder={this.allFields.birthday}
				type="date"
				value={birthday}
				trailingIcon="cake"
				onInput={this.birthdayFieldInput}
			/>);

		const genderField = (
			<div>
				<div class="mdc-text-field mdc-text-field--fullwidth mdc-text-field--box mdc-text-field--with-trailing-icon mdc-text-field--upgraded mdc-ripple-upgraded">
					<label>
						<Radio className={style.radio}
							autocomplete="off"
							disabled={isLoading}
							required={this.requiredFields.includes('gender')}
							fullwidth
							value="male"
							checked={gender === 'male'}
							name="gender"
							onChange={this.genderFieldInput}
						/>
						Мужской
					</label>
					<label>
						<Radio className={style.radio}
							autocomplete="off"
							disabled={isLoading}
							required={this.requiredFields.includes('gender')}
							fullwidth
							value="female"
							checked={gender === 'female'}
							name="gender"
							onChange={this.genderFieldInput}
						/>
						Женский
					</label>
					<label>
						<Radio className={style.radio}
							autocomplete="off"
							disabled={isLoading}
							required={this.requiredFields.includes('gender')}
							fullwidth
							value="other"
							checked={gender === 'other'}
							name="gender"
							onChange={this.genderFieldInput}
						/>
						Другое
					</label>
				</div>
				<p aria-hidden class="mdc-text-field-helper-text mdc-text-field-helper-text--persistent mdc-text-field-helper-text mdc-text-field-helper-text--persistent">
					{genderError ? 'Пол (' + genderError + ')' : this.allFields.gender}
				</p>
			</div>);

		const phoneField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={phoneError ? phoneError : this.allFields.phone + ', например: +7 (912) 88-85-554'}
				fullwidth disabled={isLoading} invalid={!!phoneError}
				required={this.requiredFields.includes('phone')}
				placeHolder={this.allFields.phone}
				type="tel"
				value={phone}
				trailingIcon="phone"
				onInput={this.phoneFieldInput} onKeyUp={this.maskPhoneField}
			/>);

		const familyField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={familyError ? familyError : this.allFields.family}
				fullwidth disabled={isLoading} invalid={!!familyError}
				required={this.requiredFields.includes('family')}
				placeHolder=""
				trailingIcon="account_circle"
				type="text"
				value={family}
				onInput={this.familyFieldInput}
			/>);

		const fnameField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={fnameError ? fnameError : this.allFields.fname}
				fullwidth disabled={isLoading} invalid={!!fnameError}
				required={this.requiredFields.includes('fname')}
				placeHolder=""
				trailingIcon="account_circle"
				type="text"
				value={fname}
				onInput={this.fnameFieldInput}
			/>);

		const snameField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={snameError ? snameError : this.allFields.sname}
				fullwidth disabled={isLoading} invalid={!!snameError}
				required={this.requiredFields.includes('sname')}
				placeHolder=""
				trailingIcon="account_circle"
				type="text"
				value={sname}
				onInput={this.snameFieldInput}
			/>);

		const logoutButton = state.notUseLogoutButton ? undefined : (
			<Button unelevated
				disabled={isLoading}
				className={style.button}
				onClick={this.logout}
			>
				<Button.Icon>arrow_back</Button.Icon>Выйти
			</Button>);

		const pushButton = (
			<Button unelevated
				disabled={!valid || isLoading}
				className={style.button}
				onClick={this.push}
			>
				<Button.Icon>backup</Button.Icon>{state.pushButtonName}
			</Button>);

		return (
			<div class={this.style}>
				<Snackbar ref={this.snackbarRef} class={style.snackbar} />

				<form onSubmit={false}>
					{userField}
					{emailField}
					{passField}
					{pass2Field}
					{birthdayField}
					{genderField}
					{phoneField}
					{familyField}
					{fnameField}
					{snameField}
				</form>

				{logoutButton}
				{pushButton}

			</div>);
	}
}
//------------------------------------------------------------------------------
