//------------------------------------------------------------------------------
import Component from '../component';
import { route } from 'preact-router';
import Toolbar from 'preact-material-components/Toolbar';
import 'preact-material-components/Toolbar/style.css';
import Drawer from 'preact-material-components/Drawer';
import 'preact-material-components/Drawer/style.css';
import Dialog from 'preact-material-components/Dialog';
import 'preact-material-components/Dialog/style.css';
import Switch from 'preact-material-components/Switch';
import 'preact-material-components/Switch/style.css';
import List from 'preact-material-components/List';
import 'preact-material-components/List/style.css';
import TextField from 'preact-material-components/TextField';
import 'preact-material-components/TextField/style.css';
import Spinner from './spinner';
import Title from './title';
//import style from './style';
import 'preact-material-components/Theme/style.css';
//------------------------------------------------------------------------------
export default class Header extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'auth', alias: 'auth' }
		]
	])

	closeDrawer = e => this.drawer.MDComponent.open = false
	openDrawer = e => this.drawer.MDComponent.open = true
	openSettings = e => this.settings.MDComponent.show()
	openSearch = e => this.search.MDComponent.show()
	drawerRef = e => this.drawer = e
	settingsRef = e => this.settings = e
	searchRef = e => this.search = e

	linkTo = path => e => {
		e.stopPropagation();
		e.preventDefault();
		route(path);
		this.closeDrawer();
	}

	goHome = this.linkTo('/')
	goProfile = this.linkTo('/profile')
	goLogin = this.linkTo('/login')
	goCategories = this.linkTo('/categories')
	goProducts = this.linkTo('/products')
	goOrders = this.linkTo('/orders')
	goCart = this.linkTo('/cart')

	toggleDarkTheme = e => {
		e.stopPropagation();
		e.preventDefault();

		this.setState(
			{ darkThemeEnabled: !this.state.darkThemeEnabled },
			() => {
				const { classList } = document.body;

				if (this.state.darkThemeEnabled)
					classList.add('mdc-theme--dark');
				else
					classList.remove('mdc-theme--dark');
			}
		);
	}

	render(props, { darkThemeEnabled, auth }) {
		const authorized = auth && auth.authorized;
		return (
			<div>
				<Toolbar className="toolbar" fixed>
					<Toolbar.Row>
						<Toolbar.Section align-start>
							<Toolbar.Icon menu onClick={this.openDrawer}>
								menu
							</Toolbar.Icon>
							<Title />
						</Toolbar.Section>
						<Toolbar.Section align-end>
							<Spinner />
							<Toolbar.Icon onClick={this.openSearch}>
								search
							</Toolbar.Icon>
							<Toolbar.Icon onClick={this.openSettings}>
								settings
							</Toolbar.Icon>
							{/* Zero Width Space https://unicode-table.com/ru/200B/
							  * Need for right positioning when title.length === 0
							  */}
							<Toolbar.Title>&#x200B;</Toolbar.Title>
						</Toolbar.Section>
					</Toolbar.Row>
				</Toolbar>
				<Drawer.TemporaryDrawer ref={this.drawerRef}>
					<Drawer.TemporaryDrawerContent>
						<Drawer.DrawerItem onClick={this.goHome}>
							<List.ItemGraphic>home</List.ItemGraphic>
							Начало
						</Drawer.DrawerItem>
						<Drawer.DrawerItem onClick={this.goCategories}>
							<List.ItemGraphic>view_stream</List.ItemGraphic>
							Категории
						</Drawer.DrawerItem>
						<Drawer.DrawerItem onClick={this.goProducts}>
							<List.ItemGraphic>view_list</List.ItemGraphic>
							Каталог
						</Drawer.DrawerItem>
						<Drawer.DrawerItem onClick={this.goOrders}>
							<List.ItemGraphic>reorder</List.ItemGraphic>
							Заказы
						</Drawer.DrawerItem>
						<Drawer.DrawerItem onClick={this.goCart}>
							<List.ItemGraphic>shopping_cart</List.ItemGraphic>
							Корзина
						</Drawer.DrawerItem>
						<Drawer.DrawerItem onClick={authorized ? this.goProfile : this.goLogin}>
							<List.ItemGraphic>{authorized ? 'verified_user' : 'account_circle'}</List.ItemGraphic>
							{authorized ? 'Профиль' : 'Вход/Регистрация'}
						</Drawer.DrawerItem>
					</Drawer.TemporaryDrawerContent>
				</Drawer.TemporaryDrawer>
				<Dialog ref={this.settingsRef}>
					<Dialog.Header>Настройки</Dialog.Header>
					<Dialog.Body>
						<div>
							<span>Включить темную тему</span>
							&nbsp;&nbsp;&nbsp;&nbsp;
							<Switch onClick={this.toggleDarkTheme} checked={darkThemeEnabled} />
						</div>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.FooterButton accept>Закрыть</Dialog.FooterButton>
					</Dialog.Footer>
				</Dialog>
				<Dialog ref={this.searchRef}>
					<Dialog.Header>Поиск</Dialog.Header>
					<Dialog.Body>
						<TextField
							helperText="Вводите текст ..."
							helperTextPersistent
							fullwidth
							trailingIcon="search"
						/>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.FooterButton accept>Закрыть</Dialog.FooterButton>
					</Dialog.Footer>
				</Dialog>
			</div>
		);
	}
}
//------------------------------------------------------------------------------
