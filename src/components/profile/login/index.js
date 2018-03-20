//------------------------------------------------------------------------------
//import wog from 'window-or-global';
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
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Login extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'auth', alias: 'auth' }
		]
	])

	isLoading = (state, callback) => this.setState({ isLoading: state }, callback)

	didSetState() {
		disp(store => store.cmpSetIn(headerTitleStorePath, 'Авторизация'));
	}

	login = e => {
		const { state } = this;
		const { auth } = state;
		const user = this.user === undefined ? auth.user : this.user;
		const pass = this.pass === undefined ? auth.pass : this.pass;

		bfetch(
			{
				method: 'PUT',
				noauth: true,
				r: {
					m: 'auth',
					f: 'login',
					r: {
						// eslint-disable-next-line
						user: user,
						hash: (new SHA256()).hex(pass).toUpperCase()
					}
				}
			},
			successor(result => {
				if (result.authorized) {
					delete result.nostore;
					if (result.profile && result.profile.birthday)
						result.profile.birthday = new Date(result.profile.birthday);

					// eslint-disable-next-line
					disp(store => store.mergeIn('auth', { ...r, ...result, pass: pass }));
				}
				else
					this.showError('Ошибка авторизации');

				this.isLoading(false);
			}),
			failer(
				error => this.isLoading(
					false,
					e => this.showError('Ошибка авторизации')
				)
			),
			starter(opts => this.isLoading(true))
		);
	}

	linkTo = path => e => {
		e.stopPropagation();
		e.preventDefault();
		route(path);
	}

	goRegistration = this.linkTo('/profile/registration')

	snackbarRef = e => this.snackbar = e;

	showError(e) {
		e && this.snackbar.MDComponent.show({ message: e });
	}

	style = [style.login, 'mdc-toolbar-fixed-adjust'].join(' ');
	
	render(props, state) {
		const { auth } = state;

		if (auth === undefined)
			return undefined;

		const user = this.user !== undefined ? this.user : auth.user;
		const pass = this.pass !== undefined ? this.pass : auth.pass;

		const {
			isLoading,
			userError,
			passError
		} = state;

		const userField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={userError ? userError : ' '}
				disabled={isLoading}
				fullwidth required invalid={!!userError}
				placeHolder="Имя пользователя или E-mail"
				trailingIcon="perm_identity"
				type="text"
				value={user}
				onInput={this.userFieldInput}
			/>);

		const passField = (
			<TextField autocomplete="off" helperTextPersistent
				helperText={passError ? passError : ' '}
				disabled={isLoading}
				fullwidth required invalid={!!passError} minlength={8}
				placeHolder="Пароль"
				trailingIcon="security"
				type="password"
				value={pass}
				onInput={this.passFieldInput}
			/>);

		const loginButton = (
			<Button unelevated
				disabled={isLoading}
				className={style.button}
				onClick={this.login}
			>
				<Button.Icon>arrow_forward</Button.Icon>Войти
			</Button>);

		const regButton = (
			<Button unelevated
				disabled={isLoading}
				className={style.button}
				onClick={this.goRegistration}
			>
				<Button.Icon>person_add</Button.Icon>Регистрация
			</Button>);

		return (
			<div class={this.style}>
				<Snackbar ref={this.snackbarRef} />

				<form onSubmit={false}>
					{userField}
					{passField}
				</form>

				{loginButton}
				{regButton}

			</div>);
	}
}
//------------------------------------------------------------------------------
