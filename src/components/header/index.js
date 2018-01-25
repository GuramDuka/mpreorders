//------------------------------------------------------------------------------
import Component from '../../components/component';
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
// import style from './style';
//------------------------------------------------------------------------------
export default class Header extends Component {
	closeDrawer() {
		this.drawer.MDComponent.open = false;
		this.state = {
			darkThemeEnabled: false
		};
	}

	openDrawer = () => (this.drawer.MDComponent.open = true);
	openSettings = () => this.settings.MDComponent.show();
	openSearch = () => this.search.MDComponent.show();
	drawerRef = e => this.drawer = e;
	settingsRef = e => this.settings = e;
	searchRef = e => this.search = e;

	linkTo = path => e => {
		route(path);
		this.closeDrawer();
	}

	goHome = this.linkTo('/')
	goProfile = this.linkTo('/profile')
	goCategories = this.linkTo('/categories')
	goProducts = this.linkTo('/products')
	goOrders = this.linkTo('/orders')
	goCart = this.linkTo('/cart')

	toggleDarkTheme = () => {
		this.setState(
			{
				darkThemeEnabled: !this.state.darkThemeEnabled
			},
			() => {
				if (this.state.darkThemeEnabled) {
					document.body.classList.add('mdc-theme--dark');
				}
				else {
					document.body.classList.remove('mdc-theme--dark');
				}
			}
		);
	}

	render() {
		return (
			<div>
				<Toolbar className="toolbar" fixed>
					<Toolbar.Row>
						<Toolbar.Section align-start>
							<Toolbar.Icon menu onClick={this.openDrawer}>
								menu
							</Toolbar.Icon>
							<Toolbar.Title>Заказы</Toolbar.Title>
						</Toolbar.Section>
						<Toolbar.Section align-end>
							<Toolbar.Icon onClick={this.openSearch}>search</Toolbar.Icon>
							<Toolbar.Icon onClick={this.openSettings}>settings</Toolbar.Icon>
						</Toolbar.Section>
					</Toolbar.Row>
				</Toolbar>
				<Drawer.TemporaryDrawer ref={this.drawerRef}>
					<Drawer.TemporaryDrawerContent>
						<List>
							<List.LinkItem onClick={this.goHome}>
								<List.ItemIcon>home</List.ItemIcon>
								Начало
							</List.LinkItem>
							<List.LinkItem onClick={this.goCategories}>
								<List.ItemIcon>view_stream</List.ItemIcon>
								Категории
							</List.LinkItem>
							<List.LinkItem onClick={this.goProducts}>
								<List.ItemIcon>view_list</List.ItemIcon>
								Каталог
							</List.LinkItem>
							<List.LinkItem onClick={this.goOrders}>
								<List.ItemIcon>reorder</List.ItemIcon>
								Заказы
							</List.LinkItem>
							<List.LinkItem onClick={this.goCart}>
								<List.ItemIcon>shopping_cart</List.ItemIcon>
								Корзина
							</List.LinkItem>
							<List.LinkItem onClick={this.goProfile}>
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
