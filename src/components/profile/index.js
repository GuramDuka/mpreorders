//------------------------------------------------------------------------------
import Component from '../../components/component';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import TextField from 'preact-material-components/TextField';
import 'preact-material-components/TextField/style.css';
import style from './style';
import { LogIn, LogOut, UserPlus } from 'preact-feather';
import FaBeer from 'react-icons/fa/beer';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Profile extends Component {
	style = [style.profile, 'mdc-toolbar-fixed-adjust'].join(' ');

	render(props, state) {
		return (
			<div class={this.style}>
				<FaBeer />
				<LogIn style={{ verticalAlign: 'middle' }} color="black" />
				<LogOut style={{ verticalAlign: 'middle' }} color="black" />
				<UserPlus style={{ verticalAlign: 'middle' }} color="black" />
				<TextField
					helperText="Имя пользователя"
					helperTextPersistent
					fullwidth
					trailingIcon="account_circle"
				/>
				<TextField
					helperText="Электронная почта (Email)"
					helperTextPersistent
					fullwidth
					trailingIcon="email"
				/>
				<TextField
					helperText="Пароль"
					helperTextPersistent
					fullwidth
					trailingIcon="security"
				/>
				<Button unelevated>
					<Button.Icon>arrow_forward</Button.Icon>Войти
				</Button>
				<Button unelevated>
					<Button.Icon>arrow_back</Button.Icon>Выйти
				</Button>
				<Button unelevated>
					<Button.Icon>account_box</Button.Icon>Регистрация
				</Button>
			</div>);
	}
}
//------------------------------------------------------------------------------
