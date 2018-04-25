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
import Icon from 'preact-material-components/Icon';
import 'preact-material-components/Icon/style.css';
import Spinner from './spinner';
import Title from './title';
//import style from './style';
import 'preact-material-components/Theme/style.css';
import { headerSearchStorePath } from '../../const';
import disp from '../../lib/store';
//------------------------------------------------------------------------------
export default class Header extends Component {
	storePaths = new Map([
		[
			(state, store) => this.setState(
				{ ...state, searchProps: store.getIn(state.searchStorePath, {}) }
			),
			[
				{ path: 'auth', alias: 'auth' },
				{ path: headerSearchStorePath, alias: 'searchStorePath' }
			]
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

	searchFilterInput = e => {
		e.stopPropagation();
		e.preventDefault();
		this.setState({ searchFilter: e.target.value });
	}

	searchStockChange = e => {
		e.stopPropagation();
		e.preventDefault();
		this.setState({ searchStock: e.target.checked });
	}

	searchDialogApplyClick = e => {
		const { state } = this;
		const { searchStorePath, searchFilter, searchStock } = state;

		disp(state => {
			if (searchFilter !== undefined)
				state = state.setIn(searchStorePath + '.filter', searchFilter);
			if (searchStock !== undefined)
				state = state.setIn(searchStorePath + '.stock', searchStock);
			return state;
		});
	}

	render(props, { darkThemeEnabled, auth, searchProps, searchFilter, searchStock }) {
		const authorized = auth && auth.authorized;

		const searchIcon = searchProps ? (
			<Toolbar.Icon onClick={this.openSearch}>
				search
			</Toolbar.Icon>) : undefined;

		const searchNotChanged =
			(searchFilter === undefined || searchFilter === searchProps.filter) &&
			(searchStock === undefined || searchStock === searchProps.stock);

		const searchDialog = searchProps ? (
			<Dialog ref={this.searchRef}>
				<Dialog.Header>Поиск</Dialog.Header>
				<Dialog.Body>
					<TextField
						helperText="Вводите текст ..."
						helperTextPersistent
						fullwidth
						trailingIcon="search"
						value={searchFilter !== undefined ? searchFilter : searchProps.filter}
						onInput={this.searchFilterInput}
					>
						<Icon>menu</Icon>
					</TextField>
					<span>Имеющиеся в наличии&nbsp;&nbsp;</span>
					<Switch
						onChange={this.searchStockChange}
						checked={searchStock !== undefined ? searchStock : searchProps.stock}
					/>
				</Dialog.Body>
				<Dialog.Footer>
					<Dialog.FooterButton
						onClick={this.searchDialogApplyClick}
						disabled={searchNotChanged}
						accept
					>
						OK
					</Dialog.FooterButton>
					<Dialog.FooterButton
						onClick={this.searchDialogApplyClick}
						disabled={searchNotChanged}
					>
						Применить
					</Dialog.FooterButton>
					<Dialog.FooterButton cancel>Закрыть</Dialog.FooterButton>
				</Dialog.Footer>
			</Dialog>) : undefined;

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
							{searchIcon}
							<Toolbar.Icon onClick={this.openSettings}>
								settings
							</Toolbar.Icon>
							{/* Zero Width Space https://unicode-table.com/ru/200B/
							  * Need for right positioning when title.length === 0
							  */}
							<Toolbar.Title style={{ margin: 0 }}>&#x200B;</Toolbar.Title>
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
						<span>Тёмная тема&nbsp;&nbsp;</span>
						<Switch onClick={this.toggleDarkTheme} checked={darkThemeEnabled} />
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.FooterButton accept>Закрыть</Dialog.FooterButton>
					</Dialog.Footer>
				</Dialog>
				{searchDialog}
			</div >
		);
	}
}
//------------------------------------------------------------------------------
