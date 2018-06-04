//------------------------------------------------------------------------------
import DOMPurify from 'dompurify';
import List from 'preact-material-components/List';
import 'preact-material-components/List/style.css';
import Snackbar from 'preact-material-components/Snackbar';
import 'preact-material-components/Snackbar/style.css';
import { Component as PreactComponent } from 'preact';
import Component from '../../Component';
import Image from '../../Image';
import VerticalActionBar from '../../VerticalActionBar';
import Divider from '../../Divider';
import '../../Divider/style.scss';
import disp from '../../../lib/store';
import { headerSearchStorePath } from '../../../const';
import { prevent, plinkRoute } from '../../../lib/util';
import strftime from '../../../lib/strftime';
import { pull, push } from './loader';
import style from './style.scss';
//------------------------------------------------------------------------------
function propRender(data) {
	const a = [], l = data.rows.length;

	for (let i = 0; i < l; i++) {
		const row = data.rows[i];

		if (row.index !== 0)
			continue;

		let s = row.display;

		for (const r of data.rows)
			if (r.propertyLink === row.propertyLink && r.index !== 0)
				s += ', ' + r.display;

		a.push(<span><strong>{row.propertyDisplay}</strong>:&nbsp;{s}</span>);

		if (i + 1 < l)
			a.push(<strong>; </strong>);
	}

	return a.length !== 0
		? a
		: <span>Свойства не заданы</span>;
}
//------------------------------------------------------------------------------
function descRender(data) {
	const a = [];

	if (data.fullName)
		a.push(<strong>{data.fullName}</strong>);

	if (data.description)
		if (data.descriptionInHtml)
			a.push(
				<div
					// eslint-disable-next-line
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(data.description)
					}}
				/>);
		else
			a.push(<div class={style.taj}>{data.description}</div>);

	return a.length !== 0
		? a
		: <span>Описание не задано</span>;
}
//------------------------------------------------------------------------------
function remsRender(data) {
	if (data.rows.length === 0)
		return <span>Нет остатков, временно отсутствует</span>;

	return (
		<table class={style.lightBorderTable}>
			<tr>
				<th>Склад</th>
				<th>Остаток</th>
			</tr>
			<tbody>
				{data.rows.map(r => (
					<tr>
						<td>{r.storeDisplay}</td>
						<td align="right">{r.remainder}</td>
					</tr>))}
			</tbody>
		</table>);
}
//------------------------------------------------------------------------------
// Intl not work correctly under android
//const dateFormatter = date => {
//	let f = new Intl.DateTimeFormat('ru-RU', {
//		year	: 'numeric',
//		month	: '2-digit',
//		day		: '2-digit',
//		hour	: '2-digit',
//		minute	: '2-digit',
//		second	: '2-digit',
//		hour12	: false
//	});
//	return f.format(date);
//};

function dateFormatter(date) {
	return strftime('%d.%m.%Y %H:%M:%S', date);
}
//------------------------------------------------------------------------------
function bprsRender(data) {
	if (data.rows.length === 0)
		return <span>Цены поставщиков не определены</span>;

	return (
		<table class={style.lightBorderTable}>
			<thead />
			{/*<caption>Таблица размеров обуви</caption>*/}
			<tr>
				<th>Дата</th>
				<th>Документ</th>
				<th>Цена</th>
			</tr>
			<tbody>
				{data.rows.map(r => (
					<tr>
						<td>{dateFormatter(r.period)}</td>
						<td>{r.display}</td>
						<td align="right">{r.price}</td>
					</tr>))}
			</tbody>
			<tfoot />
		</table>);
}
//------------------------------------------------------------------------------
function sprsRender(data) {
	if (data.rows.length === 0)
		return <span>Базовые цены не определены</span>;

	return (
		<table class={style.lightBorderTable}>
			<tr>
				<th>Поставщик</th>
				<th>Цена</th>
				<th>Дата</th>
			</tr>
			<tbody>
				{data.rows.map(r => (
					<tr>
						<td>{r.display}</td>
						<td align="right">{r.price}</td>
						<td>{dateFormatter(r.period)}</td>
					</tr>))}
			</tbody>
		</table>);
}
//------------------------------------------------------------------------------
function lprsRender(data) {
	if (data.rows.length === 0)
		return <span>Цены продажи не определены</span>;

	return (
		<table class={style.lightBorderTable}>
			<tr>
				<th>Дата</th>
				<th>Склад</th>
				<th>Цена</th>
			</tr>
			<tbody>
				{data.rows.map(r => (
					<tr>
						<td>{dateFormatter(r.period)}</td>
						<td>{r.display}</td>
						<td align="right">{r.price}</td>
					</tr>))}
			</tbody>
		</table>);
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class ExpandableItem extends PreactComponent {
	onExpand = () => {
		if (this.state.isExpanded)
			pull.call(this);
	}

	onClick = e => {
		this.setState({ isExpanded: !this.state.isExpanded }, this.onExpand);
		return prevent(e);
	}

	render({ title, meta, render }, { data, isExpanded }) {
		return (
			<div>
				<List className={style.p0} onClick={this.onClick}>
					<List.Divider />
					<List.Item>
						<List.ItemGraphic>
							{`expand_${isExpanded ? 'less' : 'more'}`}
						</List.ItemGraphic>
						{title}
						<List.ItemMeta>
							{meta}
						</List.ItemMeta>
					</List.Item>
					{isExpanded ? <List.Divider /> : undefined}
					{isExpanded && data ? render(data) : undefined}
					<List.Divider />
				</List>
			</div>);
	}
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Product extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'auth', alias: 'auth' }
		]
	])

	mount() {
		disp(
			store => store.deleteIn(headerSearchStorePath),
			() => pull.call(this)
		);
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

		const { cr, sr } = Product;

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
			<Divider horizontal />,
			<ExpandableItem link={link}
				f="prop" render={propRender}
				title="Свойства"
				meta="list"
			/>,
			<ExpandableItem link={link}
				f="desc" render={descRender}
				title="Описание"
				meta="info"
			/>
		];

		if (auth && auth.authorized && auth.employee)
			items.push(
				<ExpandableItem auth link={link}
					f="rems" render={remsRender}
					title="Остатки"
					meta="reorder"
				/>,
				<ExpandableItem auth link={link}
					f="bprs" render={bprsRender}
					title="Базовые цены"
					meta="monetization_on"
				/>,
				<ExpandableItem auth link={link}
					f="sprs" render={sprsRender}
					title="Цены поставщиков"
					meta="multiline_chart"
				/>,
				<ExpandableItem auth link={link}
					f="lprs" render={lprsRender}
					title="Цены продажи"
					meta="score"
				/>
			);

		if (state.inFavorites !== undefined)
			inFavorites = state.inFavorites;

		if (state.inCart !== undefined)
			inCart = state.inCart;

		const vab = auth && auth.authorized ? (
			<VerticalActionBar>
				<VerticalActionBar.Fab
					onClick={this.inFavoritesClick}
				>
					<VerticalActionBar.Fab.Icon>
						{inFavorites ? 'favorite' : 'favorite_bordered'}
					</VerticalActionBar.Fab.Icon>
				</VerticalActionBar.Fab>
				<VerticalActionBar.Fab
					onClick={this.inCartClick}
				>
					<VerticalActionBar.Fab.Icon>
						{inCart ? 'shopping_cart' : 'add_shopping_cart'}
					</VerticalActionBar.Fab.Icon>
				</VerticalActionBar.Fab>
			</VerticalActionBar>) : undefined;

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
