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
import Select from 'preact-material-components/Select';
import 'preact-material-components/Menu/style.css';
import 'preact-material-components/Select/style.css';
import Spinner from './spinner';
import Title from './title';
import 'preact-material-components/Theme/style.css';
import {
	headerSearchStorePath,
	inputFieldHelperTextClasses
} from '../../const';
import disp from '../../lib/store';
import { prevent } from '../../lib/util';
import style from './style';
//------------------------------------------------------------------------------
export default class Header extends Component {
	dtrace() {
		this.__name = 'Header';
	}

	searchPathValidator = s => s === this.state.searchStorePath

	searchPaths = [
		state => this.setState(state),
		[
			{
				path: /^(.*)\.search\.order\.field$/,
				alias: 'searchOrderField',
				validator: this.searchPathValidator
			},
			{
				path: /^(.*)\.search\.order\.direction$/,
				alias: 'searchOrderDirection',
				validator: this.searchPathValidator
			},
			{
				path: /^(.*)\.search\.filter$/,
				alias: 'searchFilter',
				validator: this.searchPathValidator
			},
			{
				path: /^(.*)\.search\.stock$/,
				alias: 'searchStock',
				validator: this.searchPathValidator
			}
		]
	]

	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'auth', alias: 'auth' }
		],
		[
			state => this.setState(state, () =>
				disp(state => {
					const r = /([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g;
					const [functor, paths] = this.searchPaths;

					for (const { alias } of paths)
						state = state.pubIn([
							functor,
							// replace for example searchOrderDirection to search.order.direction
							this.state.searchStorePath + '.'
							+ alias.replace(r, '$1.$2').toLowerCase()
						]);
					return state;
				})
			),
			{ path: headerSearchStorePath, alias: 'searchStorePath' }
		],
		this.searchPaths
	])

	closeDrawer = e => this.drawer.MDComponent.open = false
	openDrawer = e => this.drawer.MDComponent.open = true
	openSettings = e => this.settings.MDComponent.show()
	openSearch = e => this.search.MDComponent.show()
	drawerRef = e => this.drawer = e
	settingsRef = e => this.settings = e
	searchRef = e => this.search = e

	linkTo = path => e => {
		route(path);
		this.closeDrawer();
		return prevent(e);
	}

	goHome = this.linkTo('/')
	goProfile = this.linkTo('/profile')
	goLogin = this.linkTo('/login')
	goCategories = this.linkTo('/categories')
	goProducts = this.linkTo('/products')
	goOrders = this.linkTo('/orders')
	goCart = this.linkTo('/cart')

	toggleDarkTheme = e => {
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
		return prevent(e);
	}

	searchFilterInput = e => {
		const v = e.target.value.trim();
		this.setState({ searchFilter: v.length !== 0 ? v : undefined });
		return prevent(e);
	}

	searchStockChange = e => {
		const v = e.target.checked;
		this.setState({ searchStock: v ? v : undefined });
		return prevent(e);
	}

	searchOrderFields = [
		'code',
		'name',
		'price',
		'remainder',
		'article'
	]

	searchOrderFieldChange = e => {
		const v = this.searchOrderFields[e.target.selectedIndex - 1];
		this.setState({ searchOrderField: v !== 'name' ? v : undefined });
		return prevent(e);
	}

	searchOrderDirections = [
		'asc',
		'desc'
	]

	searchOrderDirectionChange = e => {
		const v = this.searchOrderDirections[e.target.selectedIndex - 1];
		this.setState({ searchOrderDirection: v !== 'asc' ? v : undefined });
		return prevent(e);
	}

	searchDialogApplyClick = e => {
		const {
			searchStorePath,
			searchOrderField,
			searchOrderDirection,
			searchFilter,
			searchStock
		} = this.state;

		disp(state => state
			.undefIn(searchStorePath + '.search.filter', searchFilter)
			.flagIn(searchStorePath + '.search.stock', searchStock)
			.undefIn(searchStorePath + '.search.order.field', searchOrderField, 2)
			.undefIn(searchStorePath + '.search.order.direction', searchOrderDirection, 2)
		);
	}

	willSetState(state) {
		const {
			searchFilter,
			searchOrderField,
			searchOrderDirection,
			searchStock
		} = { ...this.state, ...state };

		const changed =
			searchOrderField !== undefined
			|| searchOrderDirection !== undefined
			|| searchFilter !== undefined
			|| searchStock !== undefined;

		state.searchIconStyle = ['material-icons',
			changed ? style.blink : undefined
		].join(' ');

		state.searchNotChanged = !changed;
	}

	render(props, { darkThemeEnabled, auth, searchStorePath,
		searchIconStyle, searchNotChanged,
		searchOrderField, searchOrderDirection, searchStock, searchFilter }) {
		const authorized = auth && auth.authorized;

		const searchIcon = searchStorePath ? (
			<Toolbar.Icon onClick={this.openSearch}
				className={searchIconStyle}
			>
				search
			</Toolbar.Icon>) : undefined;

		const searchOrderFieldIndex = this.searchOrderFields.indexOf(
			searchOrderField !== undefined ? searchOrderField : 'name'
		) + 1;

		const searchOrderDirectionIndex = this.searchOrderDirections.indexOf(
			searchOrderDirection !== undefined ? searchOrderDirection : 'asc'
		) + 1;

		const searchDialog = searchStorePath ? (
			<Dialog ref={this.searchRef}>
				<Dialog.Header>Поиск</Dialog.Header>
				<Dialog.Body>
					<TextField
						helperText="Вводите текст ..."
						helperTextPersistent
						fullwidth
						trailingIcon="search"
						value={searchFilter}
						onInput={this.searchFilterInput}
					>
						<Icon>menu</Icon>
					</TextField>
					<span>Имеющиеся в наличии&nbsp;&nbsp;</span>
					<Switch
						checked={searchStock}
						onChange={this.searchStockChange}
					/>
					<Select hintText="Поле сортировки"
						selectedIndex={searchOrderFieldIndex}
						onChange={this.searchOrderFieldChange}
					>
						<Select.Item>Код</Select.Item>
						<Select.Item>Наименование</Select.Item>
						<Select.Item>Цена</Select.Item>
						<Select.Item>Остаток</Select.Item>
						<Select.Item>Артикул</Select.Item>
					</Select>
					<p aria-hidden class={inputFieldHelperTextClasses}>
						&nbsp;&nbsp;Выберите поле сортировки
					</p>
					<Select hintText="Направление сортировки"
						selectedIndex={searchOrderDirectionIndex}
						onChange={this.searchOrderDirectionChange}
					>
						<Select.Item>АБВ...ЭЮЯ</Select.Item>
						<Select.Item>ЯЮЭ...ВБА</Select.Item>
					</Select>
					<p aria-hidden class={inputFieldHelperTextClasses}>
						&nbsp;&nbsp;Выберите направление сортировки
					</p>
				</Dialog.Body>
				<Dialog.Footer>
					<Dialog.FooterButton
						onClick={this.searchDialogApplyClick}
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
