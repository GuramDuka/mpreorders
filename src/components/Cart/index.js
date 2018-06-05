//------------------------------------------------------------------------------
import { route } from 'preact-router';
import Snackbar from 'preact-material-components/Snackbar';
import 'preact-material-components/Snackbar/style.css';
import Component from '../Component';
import Image from '../Image';
import Vab from '../VerticalActionBar';
import Divider from '../Divider';
import '../Divider/style.scss';
import disp from '../../lib/store';
import { headerTitleStorePath, headerSearchStorePath } from '../../const';
import { prevent, plinkRoute } from '../../lib/util';
import { pull, push } from './loader';
import style from './style.scss';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Cart extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'auth', alias: 'auth' }
		]
	])

	mount() {
		disp(
			store => store.deleteIn(headerSearchStorePath)
				.cmpSetIn(headerTitleStorePath, 'Корзина'),
			() => pull.call(this)
		);
	}

	didSetState({ isPulled, auth, authorizedRouteUrl, notAuthorizedRouteUrl }) {
		const url = auth && auth.authorized
			? authorizedRouteUrl : notAuthorizedRouteUrl;

		if (url)
			route('/', true);
		else if (!isPulled)
			this.pull();
	}
	
	linkTo = path => ({ href: path, onClick: plinkRoute(path) })

	imageMagnifierRef = e => this.imageMagnifier = e
	showImageMagnifier = link => e => {
		this.imageMagnifier.show(link);
		return prevent(e);
	}

	transformImages(images) {
		const images2 = [];

		for (const v of images)
			images2.push(v, undefined);

		images2.pop();

		return images2;
	}

	inFavoritesClick = e => {
		const { state } = this;
		let { inFavorites } = state.data.rows[0];

		if (state.inFavorites !== undefined)
			inFavorites = state.inFavorites;

		push.call(this, { favorite: !inFavorites });
		return prevent(e);
	}

	inCartClick = e => {
		const { state } = this;
		let { inCart } = state.data.rows[0];

		if (state.inCart !== undefined)
			inCart = state.inCart;

		push.call(this, { quantity: inCart ? 0 : 1 });
		return prevent(e);
	}

	snackbarRef = e => this.snackbar = e;

	showError(e) {
		this.snackbar.MDComponent.show({ message: e });
	}

	// regex replace comma without space after
	static cr = /(,(?=\S)|:)/g;
	static sr = /(\s{2})/g;

	render(props, state) {
		const { auth, data } = state;

		if (data === undefined)
			return undefined;

		let {
			link,
			code,
			name,
			article,
			manufacturer,
			remainder,
			reserve,
			price,
			images,
			inFavorites,
			inCart
		} = data.rows[0];

		const { cr, sr } = Cart;

		name = name.replace(cr, ', ').replace(sr, ' ').trim();
		article = article.replace(cr, ', ').trim();
		manufacturer = manufacturer.replace(cr, ', ').trim();
		remainder = remainder !== 0 || reserve !== 0 ? remainder + (reserve ? ' (' + reserve + ')' : '') : '';
		price = price + '₽';

		let display = `[${code}] ${name}`;

		if (article)
			display += `, артикул: ${article}`;

		if (manufacturer)
			display += `, производитель: ${manufacturer}`;

		if (remainder)
			display += `, остаток: ${remainder}`;

		if (price)
			display += `, цена: ${price}`;

		images = this.transformImages(images);

		const items = [
			<div>{display}</div>,
			<Divider horizontal />,
			<div class={style.container}>
				<Image.Magnifier ref={this.imageMagnifierRef} />
				{images.map((v, i, a) => v ?
					<Image inline class={style.media} link={v} onClick={this.showImageMagnifier(v)} />
					: <Divider inline vertical />
				)}
			</div>,
			<Divider horizontal />
		];

		if (state.inFavorites !== undefined)
			inFavorites = state.inFavorites;

		if (state.inCart !== undefined)
			inCart = state.inCart;

		const vab = auth && auth.authorized ? (
			<Vab>
				<Vab.Fab
					onClick={this.inFavoritesClick}
				>
					<Vab.Fab.Icon>
						{inFavorites ? 'favorite' : 'favorite_bordered'}
					</Vab.Fab.Icon>
				</Vab.Fab>
				<Vab.Fab
					onClick={this.inCartClick}
				>
					<Vab.Fab.Icon>
						{inCart ? 'shopping_cart' : 'add_shopping_cart'}
					</Vab.Fab.Icon>
				</Vab.Fab>
			</Vab>) : undefined;

		return (
			<div class={style.product}>
				<Snackbar ref={this.snackbarRef} class={style.snackbar} />
				{items}
				{vab}
			</div>
		);
	}
}
//------------------------------------------------------------------------------
