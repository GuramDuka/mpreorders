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
import categoriesLoader from '../categories/loader';
//import style from './style';
//------------------------------------------------------------------------------
export default class Header extends Component {
	closeDrawer = e => this.drawer.MDComponent.open = false;
	openDrawer = e => this.drawer.MDComponent.open = true;
	openSettings = e => this.settings.MDComponent.show();
	openSearch = e => this.search.MDComponent.show();
	drawerRef = e => this.drawer = e;
	settingsRef = e => this.settings = e;
	searchRef = e => this.search = e;

	linkTo = (path, loader) => ({
		onClick: e => {
			e.stopPropagation();
			e.preventDefault();

			const ctrl = (disabled, path) => {
				path && route(path) && this.closeDrawer();
				disabled !== undefined
					&& this.setState({ linksDisabled: disabled });
			};

			if (loader)
				loader(result => ctrl(false, path),	error => ctrl(false), opts => ctrl(true));
			else
				ctrl(undefined, path);
		},
		href: path
	})

	goHome = this.linkTo('/')
	goProfile = this.linkTo('/profile')
	goCategories = this.linkTo('/categories', categoriesLoader)
	goProducts = this.linkTo('/products')
	goOrders = this.linkTo('/orders')
	goCart = this.linkTo('/cart')

	toggleDarkTheme = e => {
		e.stopPropagation();
		e.preventDefault();

		this.setState({ darkThemeEnabled: !this.state.darkThemeEnabled });

		if (this.state.darkThemeEnabled)
			document.body.classList.add('mdc-theme--dark');
		else
			document.body.classList.remove('mdc-theme--dark');
	}

	render(props, { linksDisabled }) {
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
							<Toolbar.Icon onClick={this.openSearch}>search</Toolbar.Icon>
							<Toolbar.Icon onClick={this.openSettings}>settings</Toolbar.Icon>
						</Toolbar.Section>
					</Toolbar.Row>
				</Toolbar>
				<Drawer.TemporaryDrawer ref={this.drawerRef}>
					<Drawer.TemporaryDrawerContent>
						<List>
							<List.LinkItem disabled={linksDisabled} {...this.goHome}>
								<List.ItemIcon>home</List.ItemIcon>
								Начало
							</List.LinkItem>
							<List.LinkItem disabled={linksDisabled} {...this.goCategories}>
								<List.ItemIcon>view_stream</List.ItemIcon>
								Категории
							</List.LinkItem>
							<List.LinkItem disabled={linksDisabled} {...this.goProducts}>
								<List.ItemIcon>view_list</List.ItemIcon>
								Каталог
							</List.LinkItem>
							<List.LinkItem disabled={linksDisabled} {...this.goOrders}>
								<List.ItemIcon>reorder</List.ItemIcon>
								Заказы
							</List.LinkItem>
							<List.LinkItem disabled={linksDisabled} {...this.goCart}>
								<List.ItemIcon>shopping_cart</List.ItemIcon>
								Корзина
							</List.LinkItem>
							<List.LinkItem disabled={linksDisabled} {...this.goProfile}>
								<List.ItemIcon>account_circle</List.ItemIcon>
								Профиль
							</List.LinkItem>
						</List>
					</Drawer.TemporaryDrawerContent>
				</Drawer.TemporaryDrawer>
				<Dialog ref={this.settingsRef}>
					<Dialog.Header>Настройки</Dialog.Header>
					<Dialog.Body>
						<div>
							<span>Включить темную тему</span>
							&nbsp;&nbsp;&nbsp;&nbsp;
							<Switch onClick={this.toggleDarkTheme} />
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
