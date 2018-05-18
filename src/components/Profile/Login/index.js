//------------------------------------------------------------------------------
import { route } from 'preact-router';
import Component from '../../Component';
import { bfetch } from '../../../backend';
import { SHA256 } from 'jshashes';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import TextField from 'preact-material-components/TextField';
import 'preact-material-components/TextField/style.css';
import Snackbar from 'preact-material-components/Snackbar';
import 'preact-material-components/Snackbar/style.css';
import style from './style.scss';
import { headerTitleStorePath, headerSearchStorePath } from '../../../const';
import { successor, failer, starter } from '../../load';
import disp from '../../../lib/store';
import { plinkRoute } from '../../../lib/util';
//import setZeroTimeout from '../../../lib/zerotimeout';
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

	mount() {
		disp(store => store.cmpSetIn(headerTitleStorePath, 'Авторизация').
			deleteIn(headerSearchStorePath));
	}

	didSetState({ auth }) {
		if (auth && auth.authorized)
			route('/', true);
	}

	isLoading = (state, callback) => this.setState({ isLoading: state }, callback)

	fieldInput = field => e => this[field] = e.target.value

	userFieldInput = this.fieldInput('user')
	passFieldInput = this.fieldInput('pass')

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
			successor(result => this.isLoading(false, () => {
				if (result.authorized) {
					delete result.nostore;

					if (result.profile && result.profile.birthday)
						result.profile.birthday = new Date(result.profile.birthday);

					// eslint-disable-next-line
					disp(store => store.mergeIn('auth', { ...result, user: user, pass: pass }),
						() => route('/', true)
					);
				}
				else
					this.showError('Ошибка авторизации');
			})),
			failer(
				error => this.isLoading(
					false,
					e => this.showError('Ошибка авторизации')
				)
			),
			starter(opts => this.isLoading(true))
		);
	}

	linkTo = path => plinkRoute(path)

	goRegistration = this.linkTo('/registration')

	snackbarRef = e => this.snackbar = e;

	showError(e) {
		e && this.snackbar.MDComponent.show({ message: e });
	}

	render(props, state) {
		const { auth } = state;

		const user = this.user !== undefined
			? this.user	: auth ? auth.user : undefined;
		const pass = this.pass !== undefined
			? this.pass : auth ? auth.pass : undefined;

		const { isLoading } = state;

		const userField = (
			<TextField autocomplete="off"
				helperText="Введите имя"
				disabled={isLoading}
				fullwidth required
				label="Имя пользователя или E-mail"
				trailingIcon="perm_identity"
				type="text"
				value={user}
				onInput={this.userFieldInput}
			/>);

		const passField = (
			<TextField autocomplete="off"
				helperText="Введите пароль"
				disabled={isLoading}
				fullwidth required
				label="Пароль"
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
			<div class={style.login}>
				<Snackbar ref={this.snackbarRef} style={style.snackbar} />

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
