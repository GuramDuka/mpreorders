//------------------------------------------------------------------------------
import wog from 'window-or-global';
import uuidv1 from 'uuid/v1';
import Component from '../../components/component';
import { bfetch } from '../../backend/backend';
import FormField from 'preact-material-components/FormField';
import 'preact-material-components/FormField/style.css';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import TextField from 'preact-material-components/TextField';
import 'preact-material-components/TextField/style.css';
import Checkbox from 'preact-material-components/Checkbox';
import 'preact-material-components/Checkbox/style.css';
import Snackbar from 'preact-material-components/Snackbar';
import 'preact-material-components/Snackbar/style.css';
import style from './style';
import { headerTitleStorePath } from '../../const';
//------------------------------------------------------------------------------
const termsOfUseAndPrivacyPolicy = `
Настоящие УСЛОВИЯ ИСПОЛЬЗОВАНИЯ Сайта являются официальным документом Клиника доктора Блюма (ИНН 7728741960, адрес: г. Москва, Ленинский проспект 131, далее – Администратор) и определяют порядок использования посетителями сайта http://www.blumclinic.ru (далее - Сайт) Сайта (виджет онлайн-консультант, интегрированный в Сайт) и обработки информации, получаемой от посетителей Сайта.
Начиная использование Сайта, посетитель Сайта выражает свое полное и безоговорочное согласие с настоящими УСЛОВИЯМИ ИСПОЛЬЗОВАНИЯ САЙТА, которые определяются Администратором как публичная оферта в соответствии со статьей 437 ГК РФ.
Посетитель Сайта обязан ознакомиться с настоящими УСЛОВИЯМИ ИСПОЛЬЗОВАНИЯ САЙТА до начала использования Сайта.
Настоящие УСЛОВИЯ ИСПОЛЬЗОВАНИЯ Сайта могут быть изменены Администратором в одностороннем порядке в любой момент без уведомления пользователя Сайта.
Сайт и порядок его использования. Сайт представляет собой комплексный объект авторских и смежных прав, все исключительные права на который принадлежат правообладателю – Клиника доктора Блюма (ОИНН 7728741960, адрес: г. Москва, Ленинский проспект 131). Использование Сайта осуществляется пользователями Сайта на безвозмездной основе на условиях простой неисключительной лицензии. Пользователю предоставляется право на воспроизведение Сайта на Сайте Администратора и его последующее использование исключительно в соответствии с его функциональным назначением – для целей коммуникации с Администратором Сайта.
Согласие на обработку персональных данных. В случае если при использовании Сайта пользователем будет сообщена какая-либо информация, относящаяся к прямо или косвенно определенному или определяемому физическому лицу (далее – персональные данные), ее последующая обработка будет осуществляться в соответствии с законодательством Российской Федерации. В отношении всех сообщаемых персональных данных пользователь дает Администратору согласие на их обработку. Администратор обрабатывает персональные данные пользователя исключительно в целях предоставления пользователю функционала Сайта и Сайта, размещенного на нем контента, маркетинговой, рекламной, иной информации, в целях получения пользователем персонализированной (таргетированной) рекламы, исследования и анализа данных пользователя, а также в целях продвижения пользователю своих товаров и услуг. Администратор принимает все необходимые меры для защиты персональных данных пользователя Сайта, а также предоставляет к таким данным доступ только тем работникам, подрядчикам и агентам Администратора, которым эта информация необходима для обеспечения целей обработки персональных данных Администратором Сайта. Раскрытие предоставленных пользователем персональных данных может быть произведено лишь в соответствии с законодательством Российской Федерации. В отношении всех сообщенных Администратору пользователем своих персональных данных Администратор вправе осуществлять сбор, систематизацию, накопление, хранение, уточнение (обновление, изменение), использование, распространение (в том числе передача любым третьим лицам, включая передачу персональных данных третьим лицам на хранение или в случае поручения обработки персональных данных третьим лицам), обезличивание, блокирование, уничтожение, трансграничная передача, обработка с применением основных способов такой обработки (хранение, запись на электронных носителях и их хранение, составление перечней, маркировка) и иные действия в соответствии со статьей 3 Федерального закона от 27.06.2006 № 152-ФЗ «О персональных данных». Пользователь понимает и соглашается с тем, что предоставление Администратору какой-либо информации о себе, не являющейся контактной и не относящейся к целям, обозначенным Администратором Сайта (не относящейся к деятельности Администратора, к продвигаемым им товарам и/или услугам, к условиям сотрудничества Администратора и пользователя Сайта), а ровно предоставление информации, относящейся к государственной, банковской и/или коммерческой тайне, информации о расовой и/или национальной принадлежности, политических взглядах, религиозных или философских убеждениях, состоянии здоровья, интимной жизни пользователя Сайта или иного третьего лица запрещено.
Обязанности пользователя Сайта. Пользователь обязан при посещении Сайта и при использовании Сайта соблюдать положения настоящих УСЛОВИЙ ИСПОЛЬЗОВАНИЯ Сайта и законодательства Российской Федерации, в том числе:
  • В случае принятия пользователем решения о предоставлении Администратору какой-либо информации (каких-либо данных), предоставлять исключительно достоверную и актуальную информацию. Пользователь Сайта не вправе вводить Администратора в заблуждение в отношении своей личности, сообщать ложную или недостоверную информацию о себе;
  • Не сообщать Администратору любым образом, как с использованием Сайта, так и в ином порядке, какую-либо информацию, полностью или в части относящуюся к государственной, коммерческой и/или банковской тайне, фактам и информации о своей личной жизни или личной жизни третьих лиц, а также не сообщать иную информацию, предоставление которой запрещено настоящими УСЛОВИЯМИ ИСПОЛЬЗОВАНИЯ Сайта;
  • Не сообщать, не передавать и не предоставлять Администратору какую-либо информацию (в том числе данные, объекты, контент и тд.) и ссылки на такую информацию если это может нарушать или привести к нарушению законодательства Российской Федерации, нарушить права и интересы третьих лиц. В случае наличия у пользователя сомнений относительного правомерности сообщения какой-либо информации Администратору посредством Сайта и Сайта, пользователь обязан воздержаться от совершения данного действия;
  • Использовать полученную от Администратора информацию (в том числе информацию, переданную Администратором через Сайт и/или Сайт) исключительно для личных целей, не передавать такую информацию третьим лицам без прямого на то согласия Администратора.
Ограничение ответственности Администратора. Сайт и Сайт, как и любое программное обеспечение, не свободно от ошибок. Сайт, Сайт, весь функционал, включая скрипты, приложения, контент и иную информацию, размещенную на сайте, поставляются на условиях «КАК ЕСТЬ», со всеми недостатками, проявившимися сразу или не сразу. Администратор не гарантирует и не обещает каких-либо результатов от использования Сайта или Сайта. Принимая настоящие УСЛОВИЯ ИСПОЛЬЗОВАНИЯ Сайта пользователь Сайта соглашается с тем, что Администратор не несет никакой ответственности за функционирование и работоспособность Сайта. Администратор не несет ответственности за временные сбои и перерывы в работе Сайта или Сайта и вызванные такими сбоями потери информации. Администратор также не несет никакой ответственности за ущерб, причиненный пользователям Сайта, явившийся результатом использования Сайт или Сайта. Администратор вправе использовать и распоряжаться информацией пользователя для составления статистической отчетности, использовать ее в рекламных и маркетинговых целях, а также вправе направлять пользователю информацию о своей деятельности и любым способом ее рекламировать. Правообладатель Сайта (Клиника Доктора Блюма) не несет никакой ответственности за функционирование Сайта, за какие-либо последствия его использования пользователями Сайта и/или последствия сообщения или получения какой-либо информации с использованием (с помощью) Сайта.
`;
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Profile extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			'auth'
		]
	])

	storeDisp(store) {
		return store.setIn(headerTitleStorePath, 'Профиль');
	}

	snackbarRef = e => this.snackbar = e
	openSnackbar = e => {
		//this.snackbar.MDComponent.dismissesOnAction = false;
		this.snackbar.MDComponent.show(e);
	}

	fieldInputValidator = field => e => {
		this[field] = e.target.value;
		this.validateFields();
	}

	// change event occurs when the value of an element has been changed
	//userFieldChange = e => this.user = e.target.value;
	// input event occurs immediately after the value of an element has changed
	userFieldInput = this.fieldInputValidator('user')
	emailFieldInput = this.fieldInputValidator('email')
	passFieldInput = this.fieldInputValidator('pass')
	pass2FieldInput = this.fieldInputValidator('pass2')

	validateFields() {
		const { state, user, email, pass, pass2 } = this;
		const { isReg } = state;
		const m = {};

		const throwMsg = () => {
			const invalid = !!m.msg;
			invalid && this.openSnackbar({
				//timeout: 15000,
				multiline: true,
				message: m.msg
				//actionOnBottom: true,
				//actionText: 'ЗАКРЫТЬ',
				//actionHandler: e => true
			});
			this.setState({ valid: !invalid });
		};

		const check = () => {
			if (isReg && (!email || email.indexOf('@') <= 0))
				m.msg = 'Не заполнен E-mail';
			else if (!pass || pass.length === 0)
				m.msg = 'Не заполнен пароль';
			else if (isReg && pass !== pass2)
				m.msg = 'Пароли не совпадают';
		};

		if (!user || user.trim().length === 0)
			m.msg = 'Не заполнено имя пользователя';
		// check non printable symbols, allow only Basic Latin and Cyrillic, exclude space
		// http://kourge.net/projects/regexp-unicode-block
		else if (user.replace(/[\u0021-\u007e,\u00a0-\u00ff,\u0400-\u04FF,\u0500-\u052F]*/g, '').length !== 0)
			m.msg = 'Недопустимые символы в имени пользователя';

		if (m.msg)
			throwMsg();
		else
			bfetch(
				// eslint-disable-next-line
				{ r: { m: 'auth', f: 'check', r: { user: user } } },
				json => {
					if (json.exists && user.toUpperCase() === json.user.toUpperCase())
						m.msg = 'Пользователь с таким именем уже существует';
					else
						check();
					throwMsg();
				}, error => {
					check();
					throwMsg();
				}
			);
	}

	termsOfUseAndPrivacyPolicyAccept = e =>
		this.setState({
			termsOfUseAndPrivacyPolicyAccepted: e.target.checked
		})

	login = e => true
	logout = e => true
	registration = e => this.setState({ isReg: true })
	register = e => true
	cancelRegistration = e =>
		this.setState({ isReg: false }, e => wog.scrollTo(0, 0))

	style = [style.profile, 'mdc-toolbar-fixed-adjust'].join(' ');
	userFieldId = uuidv1()

	render(props, { isReg, termsOfUseAndPrivacyPolicyAccepted, valid, auth }) {
		if (auth === undefined)
			return undefined;

		const { user, email, pass } = this;

		const userField = (
			<TextField helperTextPersistent
				helperText={isReg ? 'Например: VikDik или vik.dik@gmail.com' : ' '}
				fullwidth required invalid
				placeHolder="Имя пользователя или E-mail"
				trailingIcon="account_circle"
				value={user ? user : auth.user ? auth.user : ''}
				onInput={this.userFieldInput}
				id={this.userFieldId}
			/>);

		const emailField = isReg ? (
			<TextField helperTextPersistent
				helperText={'Например: vik.dik@gmail.com'}
				fullwidth required invalid
				placeHolder="Электронная почта (E-mail)"
				value={email ? email : auth.email ? auth.email : ''}
				trailingIcon="email"
				onInput={this.emailFieldInput}
			/>) : undefined;

		const passField = (
			<TextField helperTextPersistent
				helperText={isReg ? 'Минимум 8 символов' : ' '}
				fullwidth required invalid minlength={8}
				placeHolder="Пароль"
				trailingIcon="security"
				type="password"
				value={pass ? pass : ''}
				onInput={this.passFieldInput}
			/>);

		const pass2Field = isReg ? (
			<TextField helperTextPersistent
				helperText="Повторите пароль"
				fullwidth required invalid minlength={8}
				placeHolder="Подтверждение пароля"
				trailingIcon="security"
				type="password"
				onInput={this.pass2FieldInput}
			/>) : undefined;

		const termsOfUseAndPrivacyPolicyField = isReg ? (
			<div>
				{termsOfUseAndPrivacyPolicyAccepted ? undefined :
					<h4>Условия использования и политика конфиденциальности</h4>}
				{termsOfUseAndPrivacyPolicyAccepted ? undefined :
					<p style={{ textAlign: 'justify' }}>
						{termsOfUseAndPrivacyPolicy}
					</p>}
				<FormField>
					<Checkbox onChange={this.termsOfUseAndPrivacyPolicyAccept} />
					Я согласен с условиями использования и политикой конфиденциальности
				</FormField>
			</div>) : undefined;

		const loginButton = isReg ? undefined : (
			<Button unelevated className={style.button} onClick={this.login}>
				<Button.Icon>arrow_forward</Button.Icon>Войти
			</Button>);

		const logoutButton = isReg || !auth.authorized ? undefined : (
			<Button unelevated className={style.button} onClick={this.logout}>
				<Button.Icon>arrow_back</Button.Icon>Выйти
			</Button>);

		const regButton = (
			<Button unelevated
				disabled={isReg && (!valid || !termsOfUseAndPrivacyPolicyAccepted)}
				className={style.button}
				onClick={isReg ? this.register : this.registration}
			>
				<Button.Icon>account_box</Button.Icon>Регистрация
			</Button>);

		const cancelButton = isReg ? (
			<Button unelevated
				className={style.button}
				onClick={this.cancelRegistration}
			>
				<Button.Icon>cancel</Button.Icon>Отмена
			</Button>) : undefined;

		return (
			<div class={this.style}>
				<Snackbar ref={this.snackbarRef} />

				{userField}
				{emailField}
				{passField}
				{pass2Field}
				{termsOfUseAndPrivacyPolicyField}

				{loginButton}
				{logoutButton}
				{regButton}
				{cancelButton}

			</div>);
	}
}
//------------------------------------------------------------------------------
